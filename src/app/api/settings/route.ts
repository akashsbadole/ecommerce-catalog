import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

// Settings keys that should never be exposed to the public
const SENSITIVE_KEYS = [
  'smtp_password',
  'jwt_secret',
  'api_key',
  'secret_key',
  'access_token',
  'private_key',
];

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      // Skip sensitive keys in public response
      if (SENSITIVE_KEYS.some(sk => s.key.toLowerCase().includes(sk))) {
        continue;
      }
      settingsMap[s.key] = s.value;
    }
    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body as { settings: Record<string, string> };

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        db.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    return NextResponse.json({ settings: results });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await db.siteSetting.findMany();
    const getSetting = (key: string) =>
      settings.find((s) => s.key === key)?.value || '';

    const siteEmail = getSetting('site_email') || getSetting('email_from') || 'admin@store.com';
    const siteName = getSetting('site_name') || 'Store';

    const success = await sendEmail(
      siteEmail,
      `Test Email from ${siteName}`,
      `<h2>Test Email</h2><p>This is a test email from <strong>${siteName}</strong>. Your SMTP settings are working correctly.</p>`
    );

    if (success) {
      return NextResponse.json({ message: 'Test email sent successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email. Check SMTP settings.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
