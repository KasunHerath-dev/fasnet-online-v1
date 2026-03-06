const fs = require('fs');
const path = require('path');

const studentName = "Kasun Herath";
const otpCode = "582931";
const year = new Date().getFullYear();

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
        <p>&copy; ${year} FASNET.ONLINE • STUDENT ECOSYSTEM</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const outputPath = path.join(__dirname, 'test_email.html');
fs.writeFileSync(outputPath, html);
console.log(`Test email rendered to: ${outputPath}`);
