const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: "Method not allowed." });
    }

    const { game, quantity, amount, timeSlot, screenshot, competitors } = req.body;

    if (!game || !quantity || !amount || !timeSlot || !screenshot || !competitors || !Array.isArray(competitors)) {
        return res.status(400).json({ success: false, message: "Malformed parameters or missing combatant details." });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sherazsubhan961@gmail.com',
            pass: 'iqmfwgpthgxgsoah' 
        }
    });

    const cleanBase64Data = screenshot.split(';base64,').pop();

    try {
        // DYNAMIC LOOPING ENGINE - Fires a distinct custom layout pass directly to each individual input email field
        for (let i = 0; i < competitors.length; i++) {
            const currentCompetitor = competitors[i];
            const passSecurityToken = `CC-2026-${Math.floor(100000 + Math.random() * 900000)}`;

            const premiumHTMLTicketLayout = `
            <div style="background: #030712; color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 3px solid #38BDF8; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 35px rgba(58, 189, 248, 0.25);">
                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); text-align: center; padding: 30px; border-bottom: 3px solid #F43F5E;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 30px; letter-spacing: 4px; text-transform: uppercase; text-shadow: 0 0 10px #38BDF8;">CYBER CLASH 2026</h1>
                    <div style="display: inline-block; background: #F43F5E; color: #fff; font-size: 11px; font-weight: bold; padding: 5px 14px; border-radius: 20px; margin-top: 10px; letter-spacing: 1.5px; text-transform: uppercase;">Championship Arena Ticket Pass</div>
                </div>
                
                <div style="padding: 30px; background: radial-gradient(circle at 50% 50%, #0f172a 0%, #030712 100%); line-height: 1.6;">
                    <p style="margin: 0 0 20px 0; font-size: 15px; color: #9CA3AF; text-align: center;">Welcome to the bracket arena console pool. Your transaction details have been verified.</p>
                    
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
                            <td style="padding: 10px 0; color: #10B981; font-weight: bold;">August 23rd, 2026 @ ${timeSlot}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #4B5563; font-weight: bold; text-transform: uppercase;">Championship Arena:</td>
                            <td style="padding: 10px 0; color: #E5E7EB;">The Dynasty Complex</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #4B5563; font-weight: bold; text-transform: uppercase;">Group Order Volume:</td>
                            <td style="padding: 10px 0; color: #FBBF24; font-weight: bold;">${quantity} Total Allocation Pass(es)</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #4B5563; font-weight: bold; text-transform: uppercase;">Escrow Paid Statement:</td>
                            <td style="padding: 10px 0; color: #FBBF24; font-weight: bold;">Rs. ${amount.toLocaleString()}</td>
                        </tr>
                    </table>

                    <div style="background: #030712; border: 2px dashed #38BDF8; text-align: center; padding: 18px; border-radius: 10px; margin-top: 15px;">
                        <span style="display: block; font-size: 11px; color: #4B5563; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Check-In Gate Security Token</span>
                        <span style="font-size: 24px; font-weight: 900; letter-spacing: 3px; color: #F43F5E; text-shadow: 0 0 8px rgba(244,63,94,0.4);">${passSecurityToken}</span>
                    </div>
                </div>

                <div style="background: #0f172a; padding: 18px; text-align: center; font-size: 11px; color: #4B5563; border-top: 1px solid #1f2937;">
                    Executive Production and Coordination by Event Co-Founders:<br>
                    <strong>Khwaja M. Subhan Shiraz & Mian M. Taimur Usman</strong>
                </div>
            </div>
            `;

            const dispatchPayload = {
                from: '"Cyber Clash Tournament Logistics" <sherazsubhan961@gmail.com>',
                to: currentCompetitor.email,
                subject: `💥 CHAMPIONSHIP TICKET ISSUED: Cyber Clash 2026 Pass Locked [${currentCompetitor.name}]`,
                html: premiumHTMLTicketLayout,
                attachments: [
                    {
                        filename: `payment_proof_${currentCompetitor.name.replace(/\s+/g, '_')}.png`,
                        content: cleanBase64Data,
                        encoding: 'base64'
                    }
                ]
            };

            await transporter.sendMail(dispatchPayload);
        }

        return res.status(200).json({ success: true, message: "All dynamic ticket payloads successfully routed." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal runtime server core error." });
    }
}
