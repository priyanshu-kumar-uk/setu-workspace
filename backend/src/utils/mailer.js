import config from '../config/config.js';

export const transporter = {
    sendMail: async (mailOptions) => {
        if (!config.BREVO_API_KEY) {
            throw new Error("BREVO_API_KEY is missing in environment variables.");
        }

        const toList = typeof mailOptions.to === 'string' 
            ? mailOptions.to.split(',').map(email => ({ email: email.trim() }))
            : mailOptions.to.map(email => ({ email: email.trim() }));
        
        let senderName = "Setu Security";
        let senderEmail = config.APP_EMAIL;
        
        if (mailOptions.from) {
            const match = mailOptions.from.match(/"?([^"]*)"?\s*<([^>]+)>/);
            if (match) {
                senderName = match[1].trim();
                senderEmail = match[2].trim();
            } else {
                senderEmail = mailOptions.from.trim();
            }
        }

        const data = {
            sender: { email: senderEmail, name: senderName },
            to: toList,
            subject: mailOptions.subject,
            htmlContent: mailOptions.html
        };

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'api-key': config.BREVO_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Brevo API Error: ${response.status} ${errorText}`);
        }
        
        const responseData = await response.json();
        console.log("Email sent successfully via Brevo API:", responseData);
        return responseData;
    }
};