const nodemailer = require('nodemailer');

module.exports.handler = async (event, context) => {
    // Enable Cross-Origin Resource Sharing (CORS) handshakes
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle browser preflight checks
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: "Method not allowed" }) };
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

        const cleanBase64Data = screenshot.split(';base64,').pop();
        const securePayload = { game, quantity, amount, timeSlot, competitors };
        const encryptedToken = Buffer.from(JSON.stringify(securePayload)).toString('base64');

        // Dynamically track your Netlify domain name
        const host = event.headers.host || 'cyberclash6566.netlify.app';
        const currentDomain = `https://${host}`;
        const approveActionRoute = `${currentDomain}/api/approve?action=approve&token=${encryptedToken}`;
        const rejectActionRoute = `${currentDomain}/api/approve?action=reject`;

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
            <h2 style="color: #38BDF8; margin-top: 0; text-transform: uppercase; border-bottom: 2px solid #1e293b; padding-bottom: 10px;">🔍 VERIFICATION REQUEST</h2>
            
            <div style="background: #020617; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #FBBF24;">
                <p style="margin: 4px 0;"><strong>Game Bracket:</strong> ${game}</p>
                <p style="margin: 4px 0;"><strong>Seats Selected:</strong> ${quantity}</p>
                <p style="margin: 4px 0; font-size:16px;"><strong>Amount Claimed:</strong> <span style="color:#10B981; font-weight:bold;">Rs. ${amount.toLocaleString()}</span></p>
            </div>

            <h3 style="color: #94a3b8; font-size: 14px; text-transform: uppercase;">📋 Roster Details</h3>
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
                <a href="${rejectActionRoute}" style="background-color: #F43F5E; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">❌ REJECT</a>
            </div>
        </div>
        `;

        await transporter.sendMail({
            from: '"Cyber Clash Gatekeeper Router" <sherazsubhan961@gmail.com>',
            to: 'sherazsubhan961@gmail.com',
            subject: `🔔 APPROVAL REQUIRED: ${game} [Rs. ${amount}]`,
            html: adminVerificationHTML,
            attachments: [{ filename: 'user_payment_voucher_proof.png', content: cleanBase64Data, encoding: 'base64' }]
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.toString() })
        };
    }
};
