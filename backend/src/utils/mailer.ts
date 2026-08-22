import nodemailer from 'nodemailer';

// Generate SMTP service account from ethereal.email
let transporter: nodemailer.Transporter | null = null;

const initMailer = async () => {
  if (transporter) return transporter;
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Ethereal Mailer Initialized:', testAccount.user);
    return transporter;
  } catch (error) {
    console.error('Failed to initialize mailer', error);
    return null;
  }
};

export const sendMockEmail = async (to: string, subject: string, text: string, html: string) => {
  try {
    const mailer = await initMailer();
    if (!mailer) return false;

    const info = await mailer.sendMail({
      from: '"SchoolOS System" <no-reply@schoolos.demo>',
      to,
      subject,
      text,
      html,
    });

    console.log(`Preview URL for email to ${to}: %s`, nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error('Failed to send email', error);
    return false;
  }
};
