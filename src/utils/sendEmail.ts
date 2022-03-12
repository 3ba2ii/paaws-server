import sgMail from '@sendgrid/mail';
// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(
  to: string,
  html: string,
  subject: string,
  _template?: string
): Promise<boolean> {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

  sgMail.setApiKey(SENDGRID_API_KEY || '');
  const msg = {
    to,
    from: 'nodejscourseemail@gmail.com', // Change to your verified sender
    subject,
    html,
  };
  const response = await sgMail.send(msg);
  console.log(
    `🚀 ~ file: sendEmail.ts ~ line 16 ~ sendEmail ~ response`,
    response
  );
  return !!response;
}
