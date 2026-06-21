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
        let masterRosterHTMLRows = "";

        // 1. DYNAMIC LOOP ENGINE: Deploys tickets clearly marked with Verification Rules
        for (let i = 0; i < competitors.length; i++) {
            const currentCompetitor = competitors[i];
            const passSecurityToken = `CC-2026-${Math.floor(100000 + Math.random() * 900000)}`;

            masterRosterHTMLRows += `
                <tr style="border-bottom: 1px solid #1e293b;">
                    <td style="padding: 10px; color: #ffffff;"><strong>Slot #${i + 1}:</strong> ${currentCompetitor.name}</td>
                    <td style="padding: 10px; color: #38BDF8;">${currentCompetitor.email}</td>
                    <td style="padding: 10px; color: #FBBF24;">${currentCompetitor.phone}</td>
                    <td style="padding: 10px; color: #F43F5E; font-weight: bold;">${passSecurityToken}</td>
                </tr>
            `;

            const premiumHTMLTicketLayout = `
            <div style="background: #030712; color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 3px solid #38BDF8; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 35px rgba(58, 189, 248, 0.25);">
                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); text-align: center; padding: 30px; border-bottom: 3px solid #FBBF24;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 30px; letter-spacing: 4px; text-transform: uppercase; text-shadow: 0 0 10px #38BDF8;">CYBER CLASH 2026</h1>
                    <div style="display: inline-block; background: #FBBF24; color: #030712; font-size: 11px; font-weight: bold; padding: 5px 14px; border-radius: 20px; margin-top: 10px; letter-spacing: 1.5px; text-transform: uppercase;">Seat Reserved - Pending Wallet Review</div>
                </div>
                
                <div style="padding: 30px; background: radial-gradient(circle at 50% 50%, #0f172a 0%, #030712 100%); line-height: 1.6;">
                    <p style="margin: 0 0 20px 0; font-size: 14px; color: #F43F5E; text-align: center; font-weight: bold; background: rgba(244,63,94,0.1); padding: 10px; border-radius: 6px;">
                        ⚠️ NOTICE: Entry pass is active but remains status-locked until management cross-checks your deposited transaction ID against bank logs. Fake screenshots trigger instant roster blacklisting.
                    </p>
                    
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
                            <td style="padding: 10px 0; color: #4B5563; font-weight: bold; text-transform: uppercase;">Total Fee Filed:</td>
                            <td style="padding: 10px 0; color: #FBBF24; font-weight: bold;">Rs. ${amount.toLocaleString()}</td>
                        </tr>
                    </table>

                    <div style="background: #030712; border: 2px dashed #38BDF8; text-align: center; padding: 18px; border-radius: 10px; margin-top: 15px;">
                        <span style="display: block; font-size: 11px; color: #4B5563; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Gate Entry Token Key</span>
                        <span style="font-size: 24px; font-weight: 900; letter-spacing: 3px; color: #38BDF8; text-shadow: 0 0 8px rgba(56,189,248,0.4);">${passSecurityToken}</span>
                    </div>
                </div>

                <div style="background: #0f172a; padding: 18px; text-align: center; font-size: 11px; color: #4B5563; border-top: 1px solid #1f2937;">
                    Executive Production and Coordination by Event Co-Founders:<br>
                    <strong>Khwaja M. Subhan Shiraz & Mian M. Taimur Usman</strong>
                </div>
            </div>
            `;

            const competitorEmailPayload = {
                from: '"Cyber Clash Tournament Logistics" <sherazsubhan961@gmail.com>',
                to: currentCompetitor.email,
                subject: `⚠️ RESERVATION PENDING REVIEW: Cyber Clash 2026 Pass [${currentCompetitor.name}]`,
                html: premiumHTMLTicketLayout,
                attachments: [{ filename: `payment_proof_${currentCompetitor.name.replace(/\s+/g, '_')}.png`, content: cleanBase64Data, encoding: 'base64' }]
            };

            await transporter.sendMail(competitorEmailPayload);
        }

        // 2. MASTER AUDIT ALERT: Sent directly to Shiraz with the image attached
        const adminNotificationHTML = `
        <div style="background: #0f172a; color: #e2e8f0; font-family: sans-serif; max-width: 650px; margin: 0 auto; border: 2px solid #FBBF24; border-radius: 12px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            <h2 style="color: #FBBF24; margin-top: 0; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #1e293b; padding-bottom: 10px;">🚨 NEW UNVERIFIED ORDER LOGGED</h2>
            
            <p style="font-size: 15px;">Hey Shiraz, an applicant has filed an entry form. **Please review the attached screenshot voucher image below against your Zindagi App logs** to confirm authenticity:</p>
            
            <div style="background: #020617; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #38BDF8;">
                <p style="margin: 4px 0;"><strong>Game Category:</strong> <span style="color: #38BDF8;">${game}</span></p>
                <p style="margin: 4px 0;"><strong>Total Seats:</strong> ${quantity} seat(s)</p>
                <p style="margin: 4px 0; font-size: 16px;"><strong>Reported Fee Paid:</strong> <span style="color: #10B981; font-weight: bold;">Rs. ${amount.toLocaleString()}</span></p>
            </div>

            <h3 style="color: #38BDF8; font-size: 15px; text-transform: uppercase;">📋 Registered Competitors List</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: #020617; text-align: left;">
                <thead>
                    <tr style="background: #1e293b; color: #94a3b8;">
                        <th style="padding: 10px;">Name</th>
                        <th style="padding: 10px;">Email Address</th>
                        <th style="padding: 10px;">WhatsApp Contact</th>
                        <th style="padding: 10px;">Issued Token Key</th>
                    </tr>
                </thead>
                <tbody>
                    ${masterRosterHTMLRows}
                </tbody>
            </table>
        </div>
        `;

        const adminEmailPayload = {
            from: '"Cyber Clash Gateway Radar" <sherazsubhan961@gmail.com>',
            to: 'sherazsubhan961@gmail.com',
            subject: `🚨 REVIEW REQUIRED: ${quantity} Pass(es) for ${game} [Rs. ${amount}]`,
            html: adminNotificationHTML,
            attachments: [{ filename: `user_payment_voucher_proof.png`, content: cleanBase64Data, encoding: 'base64' }]
        };

        await transporter.sendMail(adminEmailPayload);

        return res.status(200).json({ success: true, message: "Tickets issued under pending review status tracker parameters." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal registry logging system fault." });
    }
}
