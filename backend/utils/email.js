import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Architect.io" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code - Architect.io',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6366f1;">Verify Your Account</h2>
        <p>Thank you for joining Architect.io! Use the code below to complete your registration:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">&copy; 2026 Architect.io Visual Backend Builder</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"Architect.io" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to the Future of Backend Engineering! 🚀',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #6366f1;">Welcome, ${name}!</h1>
        <p>You're officially an Architect on our platform.</p>
        <p>Start designing your high-performance backends visually and export production-ready code in seconds.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Launch Builder</a>
        </div>
        <p>Happy building!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">The Architect.io Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
