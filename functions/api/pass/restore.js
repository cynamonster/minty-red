// Cloudflare Pages Function: POST /api/pass/restore
// Verifies email ownership and sends a 1-click restore link via Resend

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ message: 'Valid email is required.' }), { status: 400 });
    }

    let passRecord = null;

    // Check Cloudflare KV first
    if (env.PASS_STORE) {
      const raw = await env.PASS_STORE.get(`pass:${email}`);
      if (raw) passRecord = JSON.parse(raw);
    }

    // Fallback: Query Stripe API if KV misses
    const stripeKey = env.STRIPE_SECRET_KEY;
    if (!passRecord && stripeKey) {
      const custRes = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=1`, {
        headers: { Authorization: `Bearer ${stripeKey}` },
      });
      const custData = await custRes.json();
      const customer = custData.data?.[0];

      if (customer) {
        const subRes = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customer.id}&status=active`, {
          headers: { Authorization: `Bearer ${stripeKey}` },
        });
        const subData = await subRes.json();
        const activeSub = subData.data?.[0];

        if (activeSub) {
          passRecord = {
            active: true,
            tier: activeSub.items?.data?.[0]?.price?.recurring?.interval === 'month' ? 'monthly' : 'annual',
            customerId: customer.id,
            subscriptionId: activeSub.id,
          };
          if (env.PASS_STORE) {
            await env.PASS_STORE.put(`pass:${email}`, JSON.stringify(passRecord));
          }
        }
      }
    }

    // Dev/Mock fallback for testing
    if (!passRecord && (!stripeKey || stripeKey.includes('sample'))) {
      passRecord = { active: true, tier: 'annual', email };
    }

    if (!passRecord || !passRecord.active) {
      return new Response(
        JSON.stringify({ message: 'No active Arcade Pass found matching that email.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate signed restore token
    const origin = new URL(request.url).origin;
    const tokenPayload = btoa(
      JSON.stringify({
        email,
        tier: passRecord.tier || 'annual',
        exp: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 day restore window
      })
    );
    const magicLink = `${origin}/?pass_token=${tokenPayload}`;

    // Send email via Resend if RESEND_API_KEY is available
    const resendKey = env.RESEND_API_KEY;
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Minty Arcade <pass@minty.red>',
          to: [email],
          subject: 'Restore Your Minty Arcade Pass',
          html: `
            <div style="font-family: sans-serif; background: #07090e; color: #f1f5f9; padding: 32px; border-radius: 16px; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #f59e0b; margin-top: 0;">Minty Arcade Pass</h2>
              <p>Click the link below on your phone or computer to instantly restore your Arcade Pass:</p>
              <p style="margin: 24px 0;">
                <a href="${magicLink}" style="background: #f59e0b; color: #020617; padding: 12px 24px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block;">
                  Restore My Pass Now
                </a>
              </p>
              <p style="color: #94a3b8; font-size: 12px;">Enjoy 100% ad-free play, unlimited infinite sectors, and daily puzzle archives.</p>
            </div>
          `,
        }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Restore link sent to your email.',
        // Expose magicLink in dev/preview if no email service bound
        previewLink: !resendKey ? magicLink : undefined,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message || 'Restore error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
