// Cloudflare Pages Function: POST /api/pass/cancel
// Cancels a subscription at period end in Stripe so the user keeps access until expiration
// but prevents future auto-renewal.

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    let subscriptionId = body.subscriptionId || null;

    const stripeKey = env.STRIPE_SECRET_KEY;

    // Developer / Mock fallback
    if (
      !stripeKey ||
      stripeKey.includes('sample') ||
      stripeKey === 'placeholder' ||
      subscriptionId === 'dev_pass_override' ||
      (subscriptionId && (subscriptionId.startsWith('dev_') || subscriptionId.startsWith('mock_')))
    ) {
      return new Response(
        JSON.stringify({
          success: true,
          mock: true,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: Date.now() + 365 * 86400 * 1000,
          message: 'Auto-renewal canceled (dev mode). Access remains active through current period.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If subscriptionId wasn't sent, look up by email
    if (!subscriptionId && email) {
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
          subscriptionId = activeSub.id;
        }
      }
    }

    if (!subscriptionId) {
      return new Response(
        JSON.stringify({
          message: 'Could not find an active subscription. Please contact pass@minty.red for assistance.',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set cancel_at_period_end = true on Stripe subscription
    const cancelRes = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'cancel_at_period_end=true',
    });

    const subResult = await cancelRes.json();

    if (!cancelRes.ok) {
      return new Response(
        JSON.stringify({ message: subResult.error?.message || 'Failed to cancel subscription with Stripe.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update Cloudflare KV if available
    if (env.PASS_STORE && email) {
      const raw = await env.PASS_STORE.get(`pass:${email}`);
      if (raw) {
        const record = JSON.parse(raw);
        record.cancelAtPeriodEnd = true;
        record.updatedAt = Date.now();
        await env.PASS_STORE.put(`pass:${email}`, JSON.stringify(record));
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: subResult.current_period_end ? subResult.current_period_end * 1000 : null,
        message: 'Auto-renewal has been successfully canceled. You retain full access until your billing year ends.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
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
