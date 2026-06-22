export async function onRequestPost(context) {
    const { request } = context;
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Content-Type': 'application/json'
    };

    try {
        const body = await request.json();
        const { game, quantity, amount, competitors, method, screenshot } = body;

        // If the player selects Visa/Mastercard credit cards, we create a secure Stripe billing item
        if (method === "Card") {
            // Note: In production replace with your active live key
            const stripeSecret = 'sk_test_51P3KxUBy7R7V7vX8...'; 
            const host = request.headers.get('host') || 'cyber-clash.pages.dev';
            const currentDomain = `https://${host}`;

            const itemPriceInCents = (amount / quantity) * 100;

            const stripeSessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${stripeSecret}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'payment_method_types[]': 'card',
                    'mode': 'payment',
                    'success_url': `${currentDomain}/?payment=success`,
                    'cancel_url': `${currentDomain}/`,
                    'line_items[0][price_data][currency]': 'pkr',
                    'line_items[0][price_data][product_data][name]': `Cyber Clash 2026: ${game} registration pass`,
                    'line_items[0][price_data][unit_amount]': itemPriceInCents,
                    'line_items[0][quantity]': quantity
                })
            });

            const sessionData = await stripeSessionResponse.json();
            return new Response(JSON.stringify({ stripeSessionId: sessionData.id }), { status: 200, headers });
        }

        // Standard Wallet Transfer Pipeline Notification Router Logic Block
        const cleanBase64Data = screenshot ? screenshot.split(';base64,').pop() : "";

        let masterRosterHTMLRows = "";
        if (competitors && Array.isArray(competitors)) {
            for (let i = 0; i < competitors.length; i++) {
                masterRosterHTMLRows += `
                    <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 10px; color: #ffffff;">Slot #${i + 1}: ${competitors[i].name}</td>
                        <td style="padding: 10px; color: #38BDF8;">${competitors[i].email}</td>
                        <td style="padding: 10px; color: #FBBF24;">${competitors[i].phone}</td>
                    </tr>`;
            }
        }

        const adminVerificationHTML = `
        <div style="background: #0f172a; color: #e2e8f0; font-family: sans-serif; max-width: 650px; margin: 0 auto; border: 2px solid #38BDF8; border-radius: 12px; padding: 25px;">
            <h2 style="color: #38BDF8; margin-top: 0; text-transform: uppercase; border-bottom: 2px solid #1e293b; padding-bottom: 10px;">🔍 REGISTRATION AUDIT REQUIRED</h2>
            <div style="background: #020617; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #FBBF24;">
                <p><strong>Game Category:</strong> ${game}</p>
                <p><strong>Total Tickets Staged:</strong> ${quantity}</p>
                <p><strong>Payment Route Channel:</strong> ${method}</p>
                <p><strong>Total Fee Deposited:</strong> Rs. ${amount.toLocaleString()}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: #020617; text-align: left;">
                <thead><tr style="background: #1e293b; color: #94a3b8;"><th style="padding: 10px;">Name</th><th style="padding: 10px;">Email</th><th style="padding: 10px;">WhatsApp Phone</th></tr></thead>
                <tbody>${masterRosterHTMLRows}</tbody>
            </table>
        </div>`;

        // Dispatches manual receipt voucher metadata securely via Resend transaction delivery endpoints
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer re_your_free_key', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: 'CyberClash <onboarding@resend.dev>',
                to: 'sherazsubhan961@gmail.com',
                subject: `🚨 TICKET RESERVATION APPLICATION: ${game}`,
                html: adminVerificationHTML,
                attachments: screenshot ? [{ filename: 'receipt_proof.png', content: cleanBase64Data }] : []
            })
        });

        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.toString() }), { status: 500, headers });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST,OPTIONS'
        }
    });
}
