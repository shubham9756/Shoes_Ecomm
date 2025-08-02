const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587 ,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "skarad819@gmail.com",
        pass: "kenc pymx qoia ykfs",
    },
});
async function send_mail(to_mail,subject,Message) {
    const info = await transporter.sendMail({
        from: '"Shubham Karad" <skarad819@gmail.com>',
        to: to_mail,
        subject: subject,
        text:Message, // plain‑text body
        html: Message, // HTML body
    });
    console.log("Message sent:", info.messageId);

}

module.exports = send_mail
