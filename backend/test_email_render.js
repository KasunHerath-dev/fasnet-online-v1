const fs = require('fs');
const path = require('path');

// Mock logger
const logger = {
    info: console.log,
    warn: console.warn,
    error: console.error
};

// Mock dependencies
const studentName = "Test Student";
const otpCode = "123456";

const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
const logoUrl = `${baseUrl}/uploads/site-logo.png`;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kodchasan:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Kodchasan', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f7f5; margin: 0; padding: 0; color: #151313; }
    .container { max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 2rem; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { background-color: #151313; padding: 40px 20px; text-align: center; }
    .logo { width: 64px; height: 64px; border-radius: 1rem; margin-bottom: 15px; }
    .header h1 { color: #fccc42; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.05em; }
    .header p { color: #be94f5; margin: 5px 0 0; font-size: 14px; }
    .content { padding: 40px 30px; text-align: center; }
    .title { font-size: 22px; font-weight: 700; margin-bottom: 20px; color: #151313; }
    .otp-container { background-color: #f7f7f5; padding: 25px; border-radius: 1.5rem; margin: 30px 0; border: 2px dashed #ff5734; }
    .otp-code { font-size: 42px; font-weight: 700; color: #ff5734; letter-spacing: 8px; margin: 0; }
    .footer { padding: 20px 30px; background-color: #f8fafc; text-align: center; border-top: 1px solid #f1f5f9; }
    .footer p { color: #64748b; font-size: 12px; margin: 0; }
    .accent-orange { color: #ff5734; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="FASNET Logo" class="logo">
      <h1>FASNET PORTAL</h1>
      <p>Faculty of Applied Sciences</p>
    </div>
    <div class="content">
      <div class="title">Hello, ${studentName}!</div>
      <p>Welcome to the <span class="accent-orange font-bold">FASNET student portal</span>. Your account activation code is ready.</p>
      <p>Use the 6-digit code below to verify your identity and set up your password.</p>
      
      <div class="otp-container">
        <div class="otp-code">${otpCode}</div>
      </div>
      
      <p style="font-size: 14px; color: #64748b;">This verification code is valid for <strong>15 minutes</strong>. If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} FASNET.ONLINE. All rights reserved.</p>
      <p style="margin-top: 5px;">Empowering Higher Education through Technology</p>
    </div>
  </div>
</body>
</html>
`;

const outputPath = path.join(__dirname, 'test_email.html');
fs.writeFileSync(outputPath, html);
console.log(`Test email rendered to: ${outputPath}`);
