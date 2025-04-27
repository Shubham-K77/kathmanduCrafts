//Import Node-Mailer:
import mail from "nodemailer";
import dotenv from "dotenv";
//Configuration:
dotenv.config();
const senderMail = process.env.senderMail;
const senderPassKey = process.env.senderPasskey;
const transporter = mail.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: senderMail,
    pass: senderPassKey,
  },
});
//Main Function To Send Mail:
const sendMail = async ({ type, otpValue }, recepientAddress) => {
  let message;
  let subject;
  //Changing The Message According To Type=>
  if (type == "register") {
    subject = "Registration To Platform";
    message = `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f9f7f3; padding: 20px; margin: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e0dcd5; border-radius: 8px;">
      <tr>
        <td style="padding: 30px; text-align: center;">
          <h1 style="color: #8b4513; font-size: 26px; margin-bottom: 10px;">Welcome to Kathmandu-Crafts!</h1>
          <p style="font-size: 16px; color: #333333; line-height: 1.6;">
            Namaste 🙏,<br><br>
            We’re thrilled to welcome you to <strong>Kathmandu-Crafts</strong>, a community where Nepal’s rich artistry and culture come to life through beautiful handmade creations.
          </p>
          <p style="font-size: 16px; color: #333333; line-height: 1.6;">
            Your journey into the world of authentic Nepali craftsmanship starts here. Discover, support, and even sell your unique items in a marketplace built with passion.
          </p>
          <p style="font-size: 16px; color: #333333; line-height: 1.6;">
            Thank you for joining us. We're excited to have you on board!
          </p>
          <p style="font-size: 16px; color: #333333; margin-top: 30px;">
            With gratitude,<br>
            <strong>The Kathmandu-Crafts Team</strong>
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #f1ebe5; text-align: center; padding: 15px; font-size: 13px; color: #888888;">
          &copy; 2025 Kathmandu-Crafts. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
</html>`;
  } else if (type == "verifyOtp") {
    subject = "Veify The Account";
    message = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Verify Your Account - Kathmandu Crafts</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="color: #2e2e2e;">Welcome to Kathmandu Crafts!</h2>
      <p style="font-size: 16px; color: #444444;">
        Thank you for signing up with <strong>Kathmandu-Crafts</strong> — Nepal's very own marketplace for handmade crafts!
      </p>
      <p style="font-size: 16px; color: #444444;">
        We’ve received your request to create an account. To complete your registration, please use the One-Time Password (OTP) below:
      </p>
      <h3 style="font-size: 24px; color: #e63946; text-align: center; margin: 20px 0;">
        <strong>${otpValue}</strong>
      </h3>
      <p style="font-size: 16px; color: #444444;">
        Enter this OTP in the registration page to successfully verify your email address and activate your account.
      </p>
      <p style="font-size: 14px; color: #888888;">
        If you didn’t sign up for Kathmandu-Crafts, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #dddddd; margin: 30px 0;" />
      <p style="font-size: 12px; color: #aaaaaa;">
        &copy; 2025 Kathmandu Crafts. All rights reserved.<br>
        Handmade with ❤️ in Nepal.
      </p>
    </div>
  </body>
</html>`;
  } else if (type == "welcome") {
    subject = "Welcome To Application!";
    message = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Account Verified - Kathmandu Crafts</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="color: #2e2e2e;">Account Successfully Verified!</h2>
      <p style="font-size: 16px; color: #444444;">
        Congratulations! Your email address has been successfully verified with <strong>Kathmandu-Crafts</strong>.
      </p>
      <p style="font-size: 16px; color: #444444;">
        You can now log in using your email address and start exploring the world of handmade crafts. 
        If you have any questions or need assistance, feel free to reach out to us.
      </p>
      <h3 style="font-size: 20px; color: #2e2e2e; text-align: center; margin: 20px 0;">
        You're all set! 🎉
      </h3>
      <p style="font-size: 16px; color: #444444;">
        We look forward to having you on board as part of the Kathmandu-Crafts community!
      </p>
      <hr style="border: none; border-top: 1px solid #dddddd; margin: 30px 0;" />
      <p style="font-size: 12px; color: #aaaaaa;">
        &copy; 2025 Kathmandu Crafts. All rights reserved.<br>
        Handmade with ❤️ in Nepal.
      </p>
    </div>
  </body>
</html>`;
  } else if (type == "resetOtp") {
    subject = "Reset The Credentials";
    message = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Reset Your Account - Kathmandu Crafts</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="color: #2e2e2e;">Account Reset Request</h2>
      <p style="font-size: 16px; color: #444444;">
        We received a request to reset your account password for <strong>Kathmandu-Crafts</strong>. To proceed with the reset, please use the One-Time Password (OTP) below:
      </p>
      <h3 style="font-size: 24px; color: #e63946; text-align: center; margin: 20px 0;">
        <strong>${otpValue}</strong>
      </h3>
      <p style="font-size: 16px; color: #444444;">
        Enter this OTP on the reset page to successfully change your password.
      </p>
      <p style="font-size: 16px; color: #444444;">
        If you didn't request this password reset, please ignore this email. Your account will remain secure.
      </p>
      <hr style="border: none; border-top: 1px solid #dddddd; margin: 30px 0;" />
      <p style="font-size: 12px; color: #aaaaaa;">
        &copy; 2025 Kathmandu Crafts. All rights reserved.<br>
        Handmade with ❤️ in Nepal.
      </p>
    </div>
  </body>
</html>
`;
  } else {
    subject = "Reset Successfull";
    message = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Account Reset Successful - Kathmandu Crafts</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="color: #2e2e2e;">Your Account Has Been Reset!</h2>
      <p style="font-size: 16px; color: #444444;">
        We're happy to inform you that your account has been successfully reset with <strong>Kathmandu-Crafts</strong>.
      </p>
      <p style="font-size: 16px; color: #444444;">
        You can now use your updated password to log in to your account. If you did not initiate this reset, please reach out to our support team immediately.
      </p>
      <h3 style="font-size: 20px; color: #2e2e2e; text-align: center; margin: 20px 0;">
        You're all set! 🎉
      </h3>
      <hr style="border: none; border-top: 1px solid #dddddd; margin: 30px 0;" />
      <p style="font-size: 12px; color: #aaaaaa;">
        &copy; 2025 Kathmandu Crafts. All rights reserved.<br>
        Handmade with ❤️ in Nepal.
      </p>
    </div>
  </body>
</html>
`;
  }
  try {
    //Now Using The Method To Send Mail =>
    const info = await transporter.sendMail({
      from: `"Kathmandu Crafts 🌐" <${senderMail}>`, // sender address
      to: recepientAddress, // list of receiver
      subject,
      html: message,
    });
    //Display Success Message:
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email sending failed");
  }
};

export default sendMail;
