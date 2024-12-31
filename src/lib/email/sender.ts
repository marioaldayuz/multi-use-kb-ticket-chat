interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  threadId?: string;
}

export async function sendEmail({ to, subject, text, replyTo, threadId }: EmailOptions): Promise<void> {
  // This is a placeholder for the actual email sending implementation
  // You would integrate with your chosen email service (e.g., SendGrid, AWS SES, etc.)
  console.log('Sending email:', {
    to,
    subject,
    text,
    replyTo,
    threadId
  });
}