import nodemailer from 'nodemailer';
import { db } from './db';

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const settings = await db.siteSetting.findMany();
    const getSetting = (key: string) =>
      settings.find((s) => s.key === key)?.value || '';

    const host = getSetting('smtp_host');
    if (!host) {
      console.log('SMTP not configured, skipping email');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(getSetting('smtp_port') || '587'),
      secure: false,
      auth: {
        user: getSetting('smtp_user'),
        pass: getSetting('smtp_pass'),
      },
    });

    const from = getSetting('email_from') || 'noreply@store.com';
    await transporter.sendMail({ from, to, subject, html });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

export async function sendEnquiryNotification(enquiry: {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
}) {
  const settings = await db.siteSetting.findMany();
  const siteEmail =
    settings.find((s) => s.key === 'site_email')?.value || 'admin@store.com';
  const siteName =
    settings.find((s) => s.key === 'site_name')?.value || 'Store';

  const html = `
    <h2>New ${enquiry.type} enquiry from ${siteName}</h2>
    <p><strong>Name:</strong> ${enquiry.name}</p>
    <p><strong>Email:</strong> ${enquiry.email}</p>
    <p><strong>Subject:</strong> ${enquiry.subject}</p>
    <p><strong>Message:</strong></p>
    <p>${enquiry.message.replace(/\n/g, '<br>')}</p>
  `;

  return sendEmail(
    siteEmail,
    `New ${enquiry.type} enquiry: ${enquiry.subject}`,
    html
  );
}
