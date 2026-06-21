const nodemailer = require('nodemailer');

module.exports.handler = async (event, context) => {
    // Cross-origin handshake responses
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ success: false }) };
    }

    try {
        const body = JSON.parse(event.body);
        const { game, quantity, amount, timeSlot, screenshot, competitors } = body;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sherazsubhan961@gmail.com',
                pass: 'iqmfwgpthgxgsoah' 
            }
        });

        const cleanBase64 = screenshot ? screenshot.split(';base64,').pop() : '';
        const securePayload = { game, quantity, amount, timeSlot, competitors };
        const encryptedToken = Buffer.from(JSON.stringify(securePayload)).toString('base64');

        // Dynamically track your Netlify deployment domain signature
        const currentDomain = event.headers.host ? `https://${event.headers.host}` : 'https://cyber-clash-v2.netlify.app';
        const approveLink = `${currentDomain}/api/approve?action=approve&token=${encryptedToken}`;
        const rejectLink = `${currentDomain}/api/approve?action=reject`;

        let rows = "";
        if (competitors && Array.isArray(competitors)) {
            competitors.forEach((c, idx) => {
                rows += `<tr style="border-bottom:1px solid #334155;"><td style="padding:10px;color:#fff;">Slot #${idx+1}: ${c.name}</td><td style="padding:10px;color:#38BDF8;">${c.email}</td><td style="padding:10px;color:#FBBF24;">${c.phone}</td></tr>`;
            });
        }

        const emailHtml = `
        <div style="background:#0f172a;color:#e2e8f0;font-family:sans-serif;max-width:600px;margin:0 auto;border:2px solid #38BDF8;border-radius:12px;padding:25px;">
            <h2 style="color:#38BDF8;border-bottom:2px solid #1e293b;padding-bottom:10px;margin-top:0;">🔍 VERIFICATION REQUEST</h2>
            <p><strong>Game:</strong> ${game} | <strong>Seats:</strong> ${quantity} | <strong>Fee:</strong> Rs. ${amount}</p>
            <table style="width:100%;border-collapse:collapse;background:#020617;text-align:left;margin-bottom:25px;">
                <thead><tr style="background:#1e293b;color:#94a3b8;"><th style="padding:10px;">Name</th><th style="padding:10px;">Email</th><th style="padding:10px;">WhatsApp</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
            <div style="text-align:center;padding:15px;background:#020617;border-radius:8px;">
                <a href="${approveLink}" style="background:#10B981;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:6px;margin-right:10px;display:inline-block;">✅ APPROVE & SEND TICKETS</a>
                <a href="${rejectLink}" style="background:#F43F5E;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:6px;display:inline-block;">❌ REJECT</a>
            </div>
        </div>`;

        await transporter.sendMail({
            from: '"Cyber Clash System" <sherazsubhan961@gmail.com>',
            to: 'sherazsubhan961@gmail.com',
            subject: `🔔 APPROVAL REQUIRED: ${game} [Rs. ${amount}]`,
            html: emailHtml,
            attachments: cleanBase64 ? [{ filename: 'voucher.png', content: cleanBase64, encoding: 'base64' }] : []
        });

        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    } catch (err) {
        return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: err.toString() }) };
    }
};
