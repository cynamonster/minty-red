// Cloudflare Pages Function: POST /api/pass/webhook
// Stripe Webhook Listener for real-time subscription lifecycle updates

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const bodyText = await request.text();
    const event = JSON.parse(bodyText);

    const kv = env.PASS_STORE;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data?.object;
        const email = (session?.customer_details?.email || session?.customer_email || '').toLowerCase();
        if (email && kv) {
          const plan = session?.metadata?.arcade_plan || 'annual';
          await kv.put(
            `pass:${email}`,
            JSON.stringify({
              active: true,
              tier: plan,
              customerId: session.customer,
              subscriptionId: session.subscription,
              updatedAt: Date.now(),
            })
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data?.object;
        const status = sub?.status; // 'active', 'past_due', 'canceled'
        // If customer ID is mapped
        if (kv && sub?.customer) {
          // Update status
          const active = status === 'active' || status === 'trialing';
          // Find email associated or save by customerId
          await kv.put(`sub:${sub.id}`, JSON.stringify({ active, status, updatedAt: Date.now() }));
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data?.object;
        if (kv && sub?.customer) {
          await kv.put(`sub:${sub.id}`, JSON.stringify({ active: false, status: 'canceled', updatedAt: Date.now() }));
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
