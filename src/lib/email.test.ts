import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSmtpStatus } from './email';

// Mock the db module
vi.mock('./db', () => ({
  db: {
    siteSetting: {
      findMany: vi.fn().mockResolvedValue([
        { key: 'smtp_host', value: 'db-smtp.example.com' },
        { key: 'smtp_user', value: 'db-user' },
      ]),
    },
  },
}));

describe('email service configuration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should resolve to resend configuration when EMAIL_SERVICE is resend', async () => {
    process.env.EMAIL_SERVICE = 'resend';
    process.env.RESEND_API_KEY = 're_123456';

    const status = await getSmtpStatus();
    expect(status.configured).toBe(true);
    expect(status.host).toBe('Resend API');
    expect(status.user).toBe('API Key Configured');
  });

  it('should show unconfigured for resend if RESEND_API_KEY is missing', async () => {
    process.env.EMAIL_SERVICE = 'resend';
    delete process.env.RESEND_API_KEY;

    const status = await getSmtpStatus();
    expect(status.configured).toBe(false);
    expect(status.host).toBe('Resend API');
    expect(status.user).toBe('Missing API Key');
  });

  it('should use SMTP environment variables when EMAIL_SERVICE is smtp', async () => {
    process.env.EMAIL_SERVICE = 'smtp';
    process.env.SMTP_HOST = 'smtp.zoho.com';
    process.env.SMTP_USER = 'zoho-user@example.com';

    const status = await getSmtpStatus();
    expect(status.configured).toBe(true);
    expect(status.host).toBe('smtp.zoho.com');
    expect(status.user).toBe('zoho-user@example.com');
  });

  it('should fallback to database site settings if SMTP env variables are missing', async () => {
    process.env.EMAIL_SERVICE = 'smtp';
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;

    const status = await getSmtpStatus();
    expect(status.configured).toBe(true);
    expect(status.host).toBe('db-smtp.example.com');
    expect(status.user).toBe('db-user');
  });
});
