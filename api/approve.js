const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action, token } = req.query;

    if (action === 'reject') {
        return res.status(200).send(`
            <div style="font-family:sans-serif; text-align:center; padding:50px; background:#0f172a; color:#fff; height:100vh; margin:0; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                <h1 style="color:#F43F5E; font-size:36px; margin-bottom:10px;">🚨 Registration Rejected</h1>
                <p style="color:#94a3b8; font-size:18px;">You denied this order request. No ticket assets were issued to the fields.</p>
            </div>
        `);
    }

    if (action === 'approve') {
        if (!token) {
            return res.status(400).send("Missing security validation tokens.");
        }

        try {
            const decodedString = Buffer.from(token, 'base64').toString('utf-8');
            const registrationData = JSON.parse(decodedString);
            const { game, amount, timeSlot, competitors } = registrationData;

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'sherazsubhan961@gmail.com',
                    pass: 'iqmfwgpthgxgsoah'
                }
            });

            for (let i = 0; i < competitors.length; i++) {
                const currentCompetitor = competitors[i];
                const passSecurityToken = `CC-2026-${Math.floor(100000 + Math.random() * 900000)}`;

                const premiumHTMLTicketLayout = `
                <div style="background: #030712; color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 3px solid #10B981; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 35px rgba(16, 185, 129, 0.25);">
                    <div style="background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); text-align: center; padding: 30px; border-bottom: 3px solid #10B981;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 30px; letter-spacing: 4px; text-transform: uppercase; text-shadow: 0 0 10px #10B981;">CYBER CLASH 2026</h1>
                        <div style="display: inline-block; background: #10B981; color: #fff; font-size: 11px; font-weight: bold; padding: 5px 14px; border-radius: 20px; margin-top: 10px; letter-spacing: 1.5px; text-transform: uppercase;">Payment Verified & Confirmed</div>
                    </div>
                    
                    <div style="padding: 30px; background: radial-gradient(circle at 50% 50%, #0f172a 0%, #030712 100%); line-height: 1.6;">
                        <p style="margin: 0 0 20px 0; font-size: 15px; color: #9CA3AF; text-align: center;">Your Zindagi wallet transfer has been confirmed by management. Your tournament entry pass is now fully active.</p>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
                            <tr>
                                <td style="padding: 10px 0; color: #4B5563; font-weight: bold; text-transform: uppercase; width: 42%;">Target Competitor:</td>
                                <td style="padding: 10px 0; color: #F3F4F6; font-weight: bold; font-size: 16px;">${currentCompetitor.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #4B5563; font-weight: bold; text-transform: uppercase;">Bracket Category:</td>
                                <td style="padding: 10px 0; color: #38BDF8; font-weight: bold;">${game}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #4B5563; font-weight: bold; text-transform: uppercase;">Match Time-Slot:</td>
                                <td style="padding: 10px 0; color: #10B981; font-weight: bold;">${timeSlot}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #4B5563; font-weight: bold; text-transform: uppercase;">Championship Arena:</td>
                                <td style="padding: 10px 0; color: #E5E7EB;">The Dynasty Complex</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #4B5563; font-weight: bold; text-transform: uppercase;">Total Fee Verified:</td>
                                <td style="padding: 10px 0; color: #FBBF24; font-weight: bold;">Rs. ${amount}</td>
                            </tr>
                        </table>

                        <div style="background: #030712; border: 2px dashed #10B981; text-align: center; padding: 18px; border-radius: 10px; margin-top: 15px;">
                            <span style="display: block; font-size: 11px; color: #4B5563; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Official Entry Gate Security Token</span>
                            <span style="font-size: 24px; font-weight: 900; letter-spacing: 3px; color: #10B981; text-shadow: 0 0 8px rgba(16,185,129,0.4);">${passSecurityToken}</span>
                        </div>
                    </div>
                </div>
                `;

                await transporter.sendMail({
                    from: '"Cyber Clash Tournament Logistics" <sherazsubhan961@gmail.com>',
                    to: currentCompetitor.email,
                    subject: `🎟️ OFFICIAL TICKET ISSUED: Cyber Clash 2026 Pass Active [${currentCompetitor.name}]`,
                    html: premiumHTMLTicketLayout
                });
            }

            return res.status(200).send(`
                <div style="font-family:sans-serif; text-align:center; padding:50px; background:#0f172a; color:#fff; height:100vh; margin:0; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <h1 style="color:#10B981; font-size:36px; margin-bottom:10px;">✅ Verification Successful!</h1>
                    <p style="color:#94a3b8; font-size:18px;">All tickets have been safely generated and sent out to the competitors' email addresses.</p>
                </div>
            `);
        } catch (error) {
            console.error(error);
            return res.status(500).send("Error compiling execution payload parameters.");
        }
    }
}
