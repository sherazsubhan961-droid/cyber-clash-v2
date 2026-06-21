const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false });

    const { game, quantity, amount, timeSlot, screenshot, competitors } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sherazsubhan961@gmail.com',
            pass: 'iqmfwgpthgxgsoah' 
        }
    });

    const cleanBase64 = screenshot ? screenshot.split(';base64,').pop() : '';

    // Encapsulate payload strings safely inside link tokens
    const securePayload = { game, quantity, amount, timeSlot, competitors };
    const encryptedToken = Buffer.from(JSON.stringify(securePayload)).toString('base64');

    const currentDomain = req.headers.host ? `https://${req.headers.host}` : 'https://cyber-clash-v2.vercel.app';
    const approveLink = `${currentDomain}/api/approve?action=approve&token=${encryptedToken}`;
    const rejectLink = `${currentDomain}/api/approve?action=reject`;

    try {
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

        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false });
    }
}
