const nodemailer = require('nodemailer');

module.exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Content-Type': 'text/html'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const { action, token } = event.queryStringParameters || {};

    if (action === 'reject') {
        return {
            statusCode: 200,
            headers,
            body: `<div style="background:#0f172a;color:#fff;font-family:sans-serif;text-align:center;padding:50px;height:100vh;margin:0;display:flex;flex-direction:column;justify-content:center;"><h1 style="color:#F43F5E;">🚨 Registration Rejected</h1></div>`
        };
    }

    if (action === 'approve') {
        if (!token) {
            return { statusCode: 400, headers, body: "Validation tracking missing." };
        }

        try {
            const decoded = Buffer.from(token, 'base64').toString('utf-8');
            const data = JSON.parse(decoded);
            const { game, amount, timeSlot, competitors } = data;

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'sherazsubhan961@gmail.com',
                    pass: 'iqmfwgpthgxgsoah'
                }
            });

            if (competitors && Array.isArray(competitors)) {
                for (let i = 0; i < competitors.length; i++) {
                    const player = competitors[i];
                    const ticketKey = `CC-2026-${Math.floor(100000 + Math.random() * 900000)}`;

                    const passLayout = `
                    <div style="background:#030712;color:#fff;font-family:sans-serif;max-width:500px;margin:0 auto;border:3px solid #10B981;border-radius:16px;overflow:hidden;">
                        <div style="background:#064e3b;text-align:center;padding:25px;border-bottom:3px solid #10B981;">
                            <h1 style="margin:0;font-size:26px;letter-spacing:2px;">CYBER CLASH 2026</h1>
                            <div style="background:#10B981;color:#fff;font-size:11px;font-weight:bold;padding:4px 12px;border-radius:20px;margin-top:8px;display:inline-block;">ENTRY PASS ACTIVE</div>
                        </div>
                        <div style="padding:25px;background:#0f172a;line-height:1.6;">
                            <p><strong>Competitor:</strong> ${player.name}</p>
                            <p><strong>Tournament Bracket:</strong> ${game}</p>
                            <p><strong>Arena Time Window:</strong> ${timeSlot}</p>
                            <p><strong>Fee Status:</strong> Rs. ${amount} Verified</p>
                            <div style="background:#030712;border:2px dashed #10B981;text-align:center;padding:15px;border-radius:10px;margin-top:15px;">
                                <span style="display:block;font-size:11px;color:#64748b;text-transform:uppercase;">Gate Check-In Token</span>
                                <span style="font-size:22px;font-weight:bold;color:#10B981;letter-spacing:2px;">${ticketKey}</span>
                            </div>
                        </div>
                    </div>`;

                    await transporter.sendMail({
                        from: '"Cyber Clash Arena" <sherazsubhan961@gmail.com>',
                        to: player.email,
                        subject: `🎟️ CYBER CLASH PASS ACTIVE - [${player.name}]`,
                        html: passLayout
                    });
                }
            }

            return {
                statusCode: 200,
                headers,
                body: `<div style="background:#0f172a;color:#fff;font-family:sans-serif;text-align:center;padding:50px;height:100vh;margin:0;display:flex;flex-direction:column;justify-content:center;"><h1 style="color:#10B981;">✅ Tickets Dispatched Successfully!</h1></div>`
            };

        } catch (err) {
            return { statusCode: 500, headers, body: "Error processing pipeline runtime execution passes." };
        }
    }

    return { statusCode: 400, headers, body: "Bad Request" };
};
