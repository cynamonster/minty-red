// Cloudflare Pages Function: POST /api/pass/checkout
// Creates a Stripe Checkout Session for Minty Arcade Pass ($0.99/mo or $9.99/yr)

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));
    const plan = 'annual';
    const returnUrl = body.returnUrl || 'https://minty.red/';

    const stripeKey = env.STRIPE_SECRET_KEY;
    const selectedPriceId = env.STRIPE_PRICE_ID_ANNUAL || 'price_annual_sample';

    // Graceful developer fallback if Stripe secret is not configured in local environment
    if (!stripeKey || stripeKey.includes('sample') || stripeKey === 'placeholder') {
      const parsedUrl = new URL(returnUrl);
      parsedUrl.searchParams.set('pass_success', '1');
      parsedUrl.searchParams.set('session_id', 'mock_dev_session_' + Date.now());
      return new Response(
        JSON.stringify({
          checkoutUrl: parsedUrl.toString(),
          mock: true,
          message: 'Stripe keys not configured. Simulating instant approval for dev/preview.',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const cleanOrigin = new URL(returnUrl).origin;
    const successUrl = `${cleanOrigin}/?pass_success=1&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = returnUrl;

    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('line_items[0][price]', selectedPriceId);
    params.append('line_items[0][quantity]', '1');
    params.append('success_url', successUrl);
    params.append('cancel_url', cancelUrl);
    params.append('allow_promotion_codes', 'true');
    params.append('billing_address_collection', 'auto');
    params.append('metadata[arcade_plan]', plan);

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      return new Response(JSON.stringify({ message: session.error?.message || 'Stripe error' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ checkoutUrl: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message || 'Internal error' }), {
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
