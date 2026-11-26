// Cloudflare Pages Function: GET or POST /api/pass/portal
// Generates a Stripe Customer Portal link for managing billing & subscriptions

export async function onRequestGet(context) {
  return handlePortal(context);
}

export async function onRequestPost(context) {
  return handlePortal(context);
}

async function handlePortal(context) {
  try {
    const { request, env } = context;
    const stripeKey = env.STRIPE_SECRET_KEY;
    const url = new URL(request.url);
    const customerId = url.searchParams.get('customer_id');
    const returnUrl = url.searchParams.get('return_url') || `${url.origin}/`;

    if (!stripeKey) {
      return Response.redirect(returnUrl, 302);
    }

    if (!customerId) {
      // Direct user to Stripe login portal if customer ID is not supplied directly
      return Response.redirect('https://billing.stripe.com/p/login', 302);
    }

    const params = new URLSearchParams();
    params.append('customer', customerId);
    params.append('return_url', returnUrl);

    const stripeRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const portal = await stripeRes.json();
    if (portal.url) {
      return Response.redirect(portal.url, 302);
    }

    return Response.redirect(returnUrl, 302);
  } catch {
    return new Response(JSON.stringify({ message: 'Portal redirect error' }), { status: 500 });
  }
}
