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
            body: `<div style="background:#0f172a;color:#fff;font-family:sans-serif;text-align:center;padding:50px;height:100vh;margin:0;display:flex;flex-direction:column;justify-content:center;"><h1 style="color:#F43F5E;">🚨 Registration Rejected</h1><p style="color:#94a3b8;">You denied this order request. No assets were issued.</p></div>`
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

            // CRITICAL FIX: Explicitly limit the ticket generator loop to match the real game profile headcount
            let actualAllowedHeadcount = 1; 
            if (game === "PUBG Mobile") {
                actualAllowedHeadcount = 4;
            }

            if (competitors && Array.isArray(competitors)) {
                // The loop stops EXACTLY at the allowed limit, preventing duplicate ticket ghost entries
                for (let i = 0; i < Math.min(competitors.length, actualAllowedHeadcount); i++) {
                    const player = competitors[i];
                    const ticketKey = `CC-2026-${Math.floor(100000 + Math.random() * 900000)}`;

                    const passLayout = `
                    <div style="background:#030712;color:#fff;font-family:sans-serif;max-width:500px;margin:0 auto;border:3px solid #10B981;border-radius:16px;overflow:hidden;box-shadow: 0 12px 35px rgba(16, 185, 129, 0.25);">
                        <div style="background:#064e3b;text-align:center;padding:25px;border-bottom:3px solid #10B981;">
                            <h1 style="margin:0;font-size:26px;letter-spacing:2px;color:#fff;">CYBER CLASH 2026</h1>
                            <div style="background:#10B981;color:#fff;font-size:11px;font-weight:bold;padding:4px 12px;border-radius:20px;margin-top:8px;display:inline-block;">ENTRY PASS ACTIVE</div>
                        </div>
                        <div style="padding:25px;background:#0f172a;line-height:1.6;">
                            <p style="margin:8px 0;color:#94a3b8;"><strong>Competitor Name:</strong> <span style="color:#fff;font-weight:bold;">${player.name}</span></p>
                            <p style="margin:8px 0;color:#94a3b8;"><strong>Tournament Bracket:</strong> <span style="color:#38BDF8;font-weight:bold;">${game}</span></p>
                            <p style="margin:8px 0;color:#94a3b8;"><strong>Arena Time Window:</strong> <span style="color:#10B981;font-weight:bold;">${timeSlot}</span></p>
                            <p style="margin:8px 0;color:#94a3b8;"><strong>Fee Status:</strong> <span style="color:#FBBF24;font-weight:bold;">Rs. ${amount} Verified</span></p>
                            <div style="background:#030712;border:2px dashed #10B981;text-align:center;padding:15px;border-radius:10px;margin-top:20px;">
                                <span style="display:block;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Gate Check-In Token</span>
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
                body: `<div style="background:#0f172a;color:#fff;font-family:sans-serif;text-align:center;padding:50px;height:100vh;margin:0;display:flex;flex-direction:column;justify-content:center;align-items:center;"><h1 style="color:#10B981;font-size:32px;margin-bottom:10px;">✅ Verification Successful!</h1><p style="color:#94a3b8;font-size:16px;">The system checked the game profile rules and dispatched the exact number of paid ticket seats successfully.</p></div>`
            };

        } catch (err) {
            return { statusCode: 500, headers, body: "Error processing pipeline runtime execution passes." };
        }
    }

    return { statusCode: 400, headers, body: "Bad Request" };
};
