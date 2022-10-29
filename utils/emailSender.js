const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: "rsgokulkumar@gmail.com", // sender address
    to: options.receiver, // list of receivers
    subject: options.subject, // Subject line
    text: options.messageBody, // plain text body
    html: `<h1> Forgot Password </h1>
    <p>${options.messageBody}</p`, // html body
  };

  // send mail with defined transport object
  await transporter.sendMail(message);
};

module.exports = sendMail;
