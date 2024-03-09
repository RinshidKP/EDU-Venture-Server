import nodemailer from 'nodemailer';

const  sendMail = async (toEmail, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: toEmail,
      subject: 'Otp Validation',
      text: `Please Use The OTP to Verify Your Email: ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(info);
  } catch (error) {
    console.error(error);
    throw new Error('Error sending email');
  }
};

export default sendMail