const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendOTPEmail = async (toEmail, otpCode, studentName) => {
  // DO NOT log OTP code in plain text for privacy
  logger.info(`[OTP EMAIL] Sending activation code to: ${toEmail}`);

  // If no SMTP credentials configured, just use console logging
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.info(`[MOCK EMAIL] SMTP not configured. OTP: ${otpCode} (Logged ONLY for local development)`);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"FASNET Portal" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Verification Code - FASNET Student Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Kodchasan:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Kodchasan', 'Segoe UI', sans-serif; 
              background-color: #f7f7f5; 
              margin: 0; 
              padding: 0; 
              color: #151313; 
              -webkit-font-smoothing: antialiased;
            }
            .wrapper { 
              padding: 40px 10px; 
              background-color: #f7f7f5; 
            }
            .container { 
              max-width: 500px; 
              margin: 0 auto; 
              background-color: #ffffff; 
              border-radius: 2.5rem; 
              overflow: hidden; 
              box-shadow: 0 20px 40px -10px rgba(21, 19, 19, 0.08); 
              border: 1px solid #e2e8f0; 
            }
            .accent-bar {
              height: 8px;
              background: linear-gradient(90deg, #ff5734, #fccc42, #be94f5);
            }
            .content { 
              padding: 60px 40px; 
              text-align: center; 
            }
            .brand {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 40px;
            }
            .brand-dot {
              width: 12px;
              height: 12px;
              border-radius: 3px;
              background-color: #ff5734;
              margin-right: 8px;
            }
            .brand-text {
              font-weight: 700;
              letter-spacing: 0.1em;
              font-size: 14px;
              text-transform: uppercase;
              color: #151313;
            }
            .title { 
              font-size: 28px; 
              font-weight: 700; 
              margin-bottom: 20px; 
              color: #151313; 
              letter-spacing: -0.02em;
            }
            .message {
              font-size: 16px;
              line-height: 1.6;
              color: #64748b;
              margin-bottom: 40px;
            }
            .otp-box { 
              background-color: #151313; 
              padding: 30px 15px; 
              border-radius: 2rem; 
              margin: 40px 0; 
              box-shadow: 0 10px 20px -5px rgba(255, 87, 52, 0.2);
            }
            .otp-code { 
              font-size: 42px; 
              font-weight: 700; 
              color: #ff5734; 
              letter-spacing: 8px; 
              margin-left: 8px;
              display: inline-block;
            }
            .footer { 
              padding: 40px; 
              background-color: #f8fafc; 
              text-align: center; 
              border-top: 1px solid #f1f5f9; 
            }
            .footer p { 
              color: #94a3b8; 
              font-size: 12px; 
              margin: 0; 
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            .support {
              font-size: 13px;
              color: #94a3b8;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px dashed #e2e8f0;
            }
            .highlight {
              color: #151313;
              font-weight: 700;
            }
            @media only screen and (max-width: 480px) {
              .content { padding: 40px 20px !important; }
              .title { font-size: 24px !important; }
              .otp-code { font-size: 32px !important; letter-spacing: 6px !important; margin-left: 6px !important; }
              .otp-box { padding: 20px 10px !important; }
              .container { border-radius: 1.5rem !important; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="accent-bar"></div>
              <div class="content">
                <div class="brand">
                  <div class="brand-dot"></div>
                  <span class="brand-text">FASNET PORTAL</span>
                </div>
                <div class="title">Verify Identity</div>
                <div class="message">
                  Hello, <span class="highlight">${studentName}</span>! Your request for an activation code was successful. Use the secure code below to finalize your account setup.
                </div>
                
                <div class="otp-box">
                  <div class="otp-code">${otpCode}</div>
                </div>
                
                <div class="support">
                  This code expires in 15 minutes. For assistance, reach out to <span class="highlight">Kasun Herath</span>.
                </div>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} FASNET.ONLINE • STUDENT ECOSYSTEM</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('OTP email sent successfully', { messageId: info.messageId, to: toEmail });
    return true;
  } catch (error) {
    logger.warn('Email sending failed (OTP still valid - check server logs)', { error: error.message });
    return false;
  }
};

const sendWelcomeEmail = async (toEmail, studentName) => {
  logger.info(`[WELCOME EMAIL] Sending to: ${toEmail}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.info(`[MOCK EMAIL] SMTP not configured. Welcome email logged for local development.`);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const loginUrl = 'https://fasnet.online/login';

    const mailOptions = {
      from: `"FASNET Portal" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Account Activated - Welcome to Learnify',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Kodchasan:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Kodchasan', 'Segoe UI', sans-serif; 
              background-color: #f7f7f5; 
              margin: 0; 
              padding: 0; 
              color: #151313; 
              -webkit-font-smoothing: antialiased;
            }
            .wrapper { 
              padding: 40px 10px; 
              background-color: #f7f7f5; 
            }
            .container { 
              max-width: 500px; 
              margin: 0 auto; 
              background-color: #ffffff; 
              border-radius: 2.5rem; 
              overflow: hidden; 
              box-shadow: 0 20px 40px -10px rgba(21, 19, 19, 0.08); 
              border: 1px solid #e2e8f0; 
            }
            .header-banner {
              padding: 60px 40px;
              background-color: #151313;
              color: #ffffff;
              text-align: center;
              position: relative;
            }
            .banner-accent {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 4px;
              background: linear-gradient(90deg, #ff5734, #fccc42);
            }
            .welcome-title {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 12px;
              letter-spacing: -0.03em;
            }
            .welcome-subtitle {
              font-size: 14px;
              color: #be94f5;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.2em;
            }
            .content { 
              padding: 60px 40px; 
              text-align: center; 
            }
            .title { 
              font-size: 24px; 
              font-weight: 700; 
              margin-bottom: 24px; 
              color: #151313; 
            }
            .message {
              font-size: 16px;
              line-height: 1.6;
              color: #64748b;
              margin-bottom: 40px;
            }
            .btn { 
              display: inline-block; 
              background-color: #ff5734; 
              color: #ffffff !important; 
              padding: 20px 40px; 
              border-radius: 1.5rem; 
              text-decoration: none; 
              font-weight: 700; 
              font-size: 16px;
              box-shadow: 0 15px 30px -10px rgba(255, 87, 52, 0.4);
              transition: transform 0.2s ease;
            }
            .footer { 
              padding: 40px; 
              background-color: #f8fafc; 
              text-align: center; 
              border-top: 1px solid #f1f5f9; 
            }
            .footer p { 
              color: #94a3b8; 
              font-size: 12px; 
              margin: 0; 
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            .support {
              font-size: 13px;
              color: #94a3b8;
              margin-top: 40px;
              padding-top: 24px;
              border-top: 1px dashed #e2e8f0;
            }
            .highlight {
              color: #151313;
              font-weight: 700;
            }
            .confetti {
              color: #fccc42;
              font-size: 24px;
              margin-bottom: 15px;
            }
            @media only screen and (max-width: 480px) {
              .header-banner { padding: 40px 20px !important; }
              .welcome-title { font-size: 28px !important; }
              .content { padding: 40px 20px !important; }
              .title { font-size: 22px !important; }
              .btn { padding: 15px 30px !important; font-size: 14px !important; }
              .container { border-radius: 1.5rem !important; }
            }
            
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header-banner">
                <div class="banner-accent"></div>
                <div class="confetti">✨</div>
                <div class="welcome-title">Success!</div>
                <div class="welcome-subtitle">Account Activated</div>
              </div>
              <div class="content">
                <div class="title">Congratulations, ${studentName}!</div>
                <div class="message">
                  Your student account is now fully active. You've gained access to your personalized learning dashboard, academic resources, and tracking tools.
                </div>
                
                <a href="${loginUrl}" class="btn">Launch Dashboard</a>
                
                <div class="support">
                  If you have any questions, reach out to <span class="highlight">Kasun Herath</span>.
                </div>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} FASNET.ONLINE • POWERED BY LEARNIFY</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info('Welcome email sent successfully', { to: toEmail });
    return true;
  } catch (error) {
    logger.warn('Welcome email sending failed', { error: error.message });
    return false;
  }
};

const sendPasswordChangeOTPEmail = async (toEmail, otpCode, studentName) => {
  logger.info(`[PASSWORD CHANGE OTP] Sending code to: ${toEmail}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.info(`[MOCK EMAIL] SMTP not configured. OTP: ${otpCode}`);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const mailOptions = {
      from: `"FASNET Portal" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Security Verification - Password Change',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <link href="https://fonts.googleapis.com/css2?family=Kodchasan:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Kodchasan', sans-serif; background-color: #f7f7f5; color: #151313; margin: 0; padding: 0; }
            .container { max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 2.5rem; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
            .content { padding: 60px 40px; text-align: center; }
            .otp-box { background: #151313; padding: 30px; border-radius: 2rem; margin: 30px 0; }
            .otp-code { font-size: 42px; font-weight: 700; color: #ff5734; letter-spacing: 8px; }
            .title { font-size: 24px; font-weight: 700; margin-bottom: 20px; }
            .text { color: #64748b; line-height: 1.6; margin-bottom: 30px; }
            .footer { padding: 30px; background: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div style="height: 8px; background: #ff5734;"></div>
            <div class="content">
              <div class="title">Security Verification</div>
              <p class="text">Hello ${studentName}, you are attempting to change your account password. Please use the verification code below to confirm your identity.</p>
              <div class="otp-box">
                <div class="otp-code">${otpCode}</div>
              </div>
              <p class="text" style="font-size: 13px;">If you did not request this change, please ignore this email or contact support immediately.</p>
            </div>
            <div class="footer">FASNET.ONLINE • SECURE AUTHENTICATION</div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    logger.error('Failed to send password change OTP', { error: error.message });
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordChangeOTPEmail,
};
