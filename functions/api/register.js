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

        const cleanBase64Data = screenshot.split(';base64,').pop();

        let masterRosterHTMLRows = "";
        if (competitors && Array.isArray(competitors)) {
            for (let i = 0; i < competitors.length; i++) {
                masterRosterHTMLRows += `
                    <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 10px; color: #ffffff;">Slot #${i + 1}: ${competitors[i].name}</td>
                        <td style="padding: 10px; color: #38BDF8;">${competitors[i].email}</td>
                        <td style="padding: 10px; color: #FBBF24;">${competitors[i].phone}</td>
                    </tr>
                `;
            }
        }

        const adminVerificationHTML = `
        <div style="background: #0f172a; color: #e2e8f0; font-family: sans-serif; max-width: 650px; margin: 0 auto; border: 2px solid #38BDF8; border-radius: 12px; padding: 25px;">
            <h2 style="color: #38BDF8; margin-top: 0; text-transform: uppercase; border-bottom: 2px solid #1e293b; padding-bottom: 10px;">🔍 REGISTRATION AUDIT REQUIRED</h2>
            <div style="background: #020617; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #FBBF24;">
                <p><strong>Game Category:</strong> ${game}</p>
                <p><strong>Total Tickets Staged:</strong> ${quantity}</p>
                <p><strong>Payment Route Channel:</strong> ${method || 'Local Mobile App'}</p>
                <p><strong>Total Fee Deposited:</strong> Rs. ${amount.toLocaleString()}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: #020617; text-align: left;">
                <thead>
                    <tr style="background: #1e293b; color: #94a3b8;">
                        <th style="padding: 10px;">Name</th>
                        <th style="padding: 10px;">Email</th>
                        <th style="padding: 10px;">WhatsApp Phone</th>
                    </tr>
                </thead>
                <tbody>${masterRosterHTMLRows}</tbody>
            </table>
        </div>`;

        // Cloudflare-friendly Web Fetch route to forward email data smoothly
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer re_your_free_key', 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'CyberClash <onboarding@resend.dev>',
                to: 'sherazsubhan961@gmail.com',
                subject: `🚨 TICKET RESERVATION APPLICATION: ${game}`,
                html: adminVerificationHTML,
                attachments: [{ filename: 'receipt_proof.png', content: cleanBase64Data }]
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
