import nodemailer from "nodemailer";

export const mailSender = async (email, title, body) => {
    try {
        // Create a Transporter to send emails
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false,
            requireTLS: false,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false,
            },
        });
        // Send emails to users
        let info = await transporter.sendMail({
            from: process.env.MAIL_FROM_ADDRESS,
            to: email,
            subject: title,
            html: body,
        });
        console.log("Email info: ", info);
        return info;
    } catch (error) {
        console.log(error.message);
    }
};
