import nodemailer from 'nodemailer';

export async function handler(event, context) {
    // Handle preflight CORS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://time-keeper-track-student.netlify.app',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { to, subject, html } = JSON.parse(event.body);

        // Create transporter with App Password
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Use TLS
            auth: {
                user: 'projectipt00@gmail.com',
                pass: 'vxbx lnmy dxiy znlp' // Replace with your App Password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify transporter configuration
        await transporter.verify();

        const mailOptions = {
            from: '"Group 7 Project" <projectipt00@gmail.com>',
            to,
            subject,
            html // Use HTML content directly
        };

        const info = await transporter.sendMail(mailOptions);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://next-gen-permss.netlify.app',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Email sent successfully',
                messageId: info.messageId
            })
        };
    } catch (error) {
        console.error('Detailed error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': 'https://next-gen-permss.netlify.app',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'Failed to send email',
                details: error.message
            })
        };
    }
}