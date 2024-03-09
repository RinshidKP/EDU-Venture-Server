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
      subject: 'Otp Validation for EduVenture',
      text: `Please Use The OTP to Verify Your Email: ${otp}`,
      html: `<!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Eduventure</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha2/css/bootstrap.min.css">
      <style>
        body {
          background-color: #f8f9fa;
          font-family: Arial, sans-serif;
        }
    
        .container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }
    
        .bg-light {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          padding: 20px;
        }
    
        h1 {
          font-size: 24px;
          color: #333333;
          margin-top: 0;
          margin-bottom: 30px;
        }
    
        p {
          font-size: 16px;
          color: #555555;
          line-height: 1.5;
          margin-bottom: 20px;
        }
    
        .text-center {
          text-align: center;
        }
    
        .mt-4 {
          margin-top: 20px;
        }
    
        .mb-4 {
          margin-bottom: 20px;
        }
    
        .rounded {
          border-radius: 6px;
        }
    
        .company-info {
          font-size: 14px;
          color: #999999;
          margin-top: 40px;
        }
      </style>
    </head>
    
    <body>
      <div class="container">
        <div class="bg-light rounded">
          <h1 class="text-center">Eduventure</h1>
          <p>Dear User,</p>
          <p>Thank you for signing up with Eduventure! To complete your registration, please enter the following One-Time Password (OTP) on our website:</p>
          <h2 class="text-center mt-4">Your OTP: <b>${otp}</b></h2>
          <p>If you did not sign up for an account with Eduventure, please disregard this email.</p>
          <p>Thank you for choosing Eduventure. We look forward to providing you with the latest footwear styles and trends!</p>
        </div>
        <div class="text-center company-info">
          <p>Company Inc, 3 Abbey Road, San Francisco CA 94102</p>
        </div>
      </div>
    </body>
    
    </html>
    `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(info);
  } catch (error) {
    console.error(error);
    throw new Error('Error sending email');
  }
};

export default sendMail