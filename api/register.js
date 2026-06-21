const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: "Method not allowed." });

    const { game, quantity, amount, timeSlot, screenshot, competitors } = req.body;

    if (!game || !quantity || !amount || !timeSlot || !screenshot || !competitors) {
        return res.status(400).json({ success: false, message: "Missing metadata fields." });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sherazsubhan961@gmail.com',
            pass: 'iqmfwgpthgxgsoah' 
        }
    });

    const cleanBase64Data = screenshot.split(';base64,').pop();

    // Package all essential user data safely so it travels directly inside the URL string
    const securePayload = { game, quantity, amount, timeSlot, competitors };
    const encryptedToken = Buffer.from(JSON.stringify(securePayload)).toString('base64');

    const currentDomain = req.headers.host ? `https://${req.headers.host}` : 'https://cyber-clash-v2.vercel.app';
    const approveActionRoute = `${currentDomain}/api/approve?action=approve&token=${encryptedToken}`;
    const rejectActionRoute = `${currentDomain}/api/approve?action=reject`;

    try {
        let masterRosterHTMLRows = "";
        for (let i = 0; i < competitors.length; i++) {
            masterRosterHTMLRows += `
                <tr style="border-bottom: 1px solid #1e293b;">
                    <td style="padding: 10px; color: #ffffff;">Slot #${i + 1}: ${competitors[i].name}</td>
                    <td style="padding: 10px; color: #38BDF8;">${competitors[i].email}</td>
                    <td style="padding: 10px; color: #FBBF24;">${competitors[i].phone}</td>
                </tr>
            `;
        }

        const adminVerificationHTML = `
        <div style="background: #0f172a; color: #e2e8f0; font-family: sans-serif; max-width: 650px; margin: 0 auto; border: 2px solid #38BDF8; border-radius: 12px; padding: 25px;">
            <h2 style="color: #38BDF8; margin-top: 0; text-transform: uppercase; border-bottom: 2px solid #1e293b; padding-bottom: 10px;">🔍 VERIFICATION REQUEST</h2>
            <p>Review this payment voucher attachment image against your Zindagi account balance:</p>
            
            <div style="background: #020617; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #FBBF24;">
                <p style="margin: 4px 0;"><strong>Game Bracket:</strong> ${game}</p>
                <p style="margin: 4px 0;"><strong>Seats Selected:</strong> ${quantity}</p>
                <p style="margin: 4px 0; font-size:16px;"><strong>Amount Claimed:</strong> <span style="color:#10B981; font-weight:bold;">Rs. ${amount.toLocaleString()}</span></p>
            </div>

            <h3 style="color: #94a3b8; font-size: 14px; text-transform: uppercase;">📋 Roster List</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: #020617; text-align: left; margin-bottom:30px;">
                <thead>
                    <tr style="background: #1e293b; color: #94a3b8;">
                        <th style="padding: 10px;">Name</th>
                        <th style="padding: 10px;">Email</th>
                        <th style="padding: 10px;">WhatsApp</th>
                    </tr>
                </thead>
                <tbody>${masterRosterHTMLRows}</tbody>
            </table>

            <div style="text-align: center; margin: 30px 0; padding: 20px; background:#020617; border-radius:8px;">
                <a href="${approveActionRoute}" style="background-color: #10B981; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; margin-right: 15px; display: inline-block;">✅ APPROVE & SEND TICKETS</a>
                <a href="${rejectActionRoute}" style="background-color: #F43F5E; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">❌ REJECT REGISTRATION</a>
            </div>
        </div>
        `;

        const adminEmailPayload = {
            from: '"Cyber Clash Gatekeeper Router" <sherazsubhan961@gmail.com>',
            to: 'sherazsubhan961@gmail.com',
            subject: `🔔 APPROVAL REQUIRED: ${quantity} Pass(es) for ${game} [Rs. ${amount}]`,
            html: adminVerificationHTML,
            attachments: [{ filename: `user_payment_voucher_proof.png`, content: cleanBase64Data, encoding: 'base64' }]
        };

        await transporter.sendMail(adminEmailPayload);
        return res.status(200).json({ success: true, message: "Application filed securely." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server registry error." });
    }
}
