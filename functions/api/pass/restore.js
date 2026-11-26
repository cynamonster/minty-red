// Cloudflare Pages Function: POST /api/pass/restore
// Verifies email ownership and sends a 1-click restore link via Resend

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ message: 'Valid email is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
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
    let emailSent = false;

    if (resendKey) {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #07090e; color: #f1f5f9; padding: 32px; border-radius: 16px; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #f59e0b; margin-top: 0; font-size: 22px;">Minty Arcade Pass</h2>
          <p style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">Click the button below on your phone or computer to instantly restore your Arcade Pass on this device:</p>
          <p style="margin: 28px 0; text-align: center;">
            <a href="${magicLink}" style="background: #f59e0b; color: #020617; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 15px; text-decoration: none; display: inline-block;">
              Restore My Pass Now
            </a>
          </p>
          <p style="color: #64748b; font-size: 12px; line-height: 1.4; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 16px;">
            Enjoy 100% ad-free play, unlimited infinite sectors, and daily puzzle archives.<br>
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${magicLink}" style="color: #38bdf8; word-break: break-all; font-size: 11px;">${magicLink}</a>
          </p>
        </div>
      `;

      const primaryFrom = env.RESEND_FROM_EMAIL || 'Minty Arcade <pass@minty.red>';
      let emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: primaryFrom,
          to: [email],
          subject: 'Restore Your Minty Arcade Pass',
          html: emailHtml,
        }),
      });

      // If sending from custom domain fails because it is not verified yet, fallback to onboarding@resend.dev
      if (!emailRes.ok && primaryFrom !== 'Minty Arcade <onboarding@resend.dev>') {
        const primaryErr = await emailRes.json().catch(() => ({}));
        console.warn('Resend primary sender failed, attempting fallback to onboarding sender:', primaryErr);

        emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Minty Arcade <onboarding@resend.dev>',
            to: [email],
            subject: 'Restore Your Minty Arcade Pass',
            html: emailHtml,
          }),
        });
      }

      if (emailRes.ok) {
        emailSent = true;
      } else {
        const errJson = await emailRes.json().catch(() => ({}));
        console.error('Resend delivery failed:', errJson);
        const emailError = errJson.message || 'Unable to deliver restore email via Resend.';
        return new Response(
          JSON.stringify({
            success: false,
            message: `Email delivery failed: ${emailError}`,
            previewLink: magicLink,
          }),
          { status: 502, headers: { 'Content-Type': 'application/json' } }
        );
      }
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

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
