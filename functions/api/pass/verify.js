// Cloudflare Pages Function: GET /api/pass/verify?session_id=...
// Verifies a completed checkout session and returns pass entitlement status

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      return new Response(JSON.stringify({ message: 'Missing session_id' }), { status: 400 });
    }

    // Mock dev session support
    if (sessionId.startsWith('mock_dev_session_')) {
      const now = Date.now();
      return new Response(
        JSON.stringify({
          active: true,
          tier: 'annual',
          email: 'player@example.com',
          expiresAt: now + 365 * 24 * 60 * 60 * 1000,
          token: `dev_token_${now}`,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stripeKey = env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return new Response(JSON.stringify({ active: true, tier: 'annual' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok || session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ active: false, message: 'Payment not completed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const email = session.customer_details?.email || session.customer_email;
    const plan = session.metadata?.arcade_plan || 'annual';
    const expiresAt = Date.now() + (plan === 'monthly' ? 31 : 366) * 24 * 60 * 60 * 1000;

    // Persist in Cloudflare KV if available
    if (env.PASS_STORE && email) {
      await env.PASS_STORE.put(
        `pass:${email.toLowerCase()}`,
        JSON.stringify({
          active: true,
          tier: plan,
          customerId: session.customer,
          subscriptionId: session.subscription,
          updatedAt: Date.now(),
        })
      );
    }

    return new Response(
      JSON.stringify({
        active: true,
        tier: plan,
        email,
        expiresAt,
        token: `minty_${session.subscription || sessionId}`,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
