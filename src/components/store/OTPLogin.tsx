'use client';

import { useState, useEffect, useCallback } from 'react';
import { Phone, Mail, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAppStore } from '@/lib/store';

type Step = 'identifier' | 'otp';

interface OTPLoginProps {
  onSuccess?: () => void;
}

export function OTPLogin({ onSuccess }: OTPLoginProps) {
  const { login } = useAppStore();
  const [step, setStep] = useState<Step>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startTimer = useCallback(() => {
    setResendTimer(60);
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const isEmail = identifier.includes('@');

  const handleSendOTP = async () => {
    if (!identifier.trim()) {
      toast.error('Please enter your phone number or email');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('OTP sent successfully');
        setStep('otp');
        startTimer();
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), otp }),
      });
      const data = await res.json();
      if (res.ok && data.user && data.token) {
        localStorage.setItem('auth_token', data.token);
        login(data.user, data.token);
        toast.success(`Welcome${data.user.name ? `, ${data.user.name}` : ''}!`);
        onSuccess?.();
      } else {
        toast.error(data.error || 'Invalid OTP');
      }
    } catch {
      toast.error('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    handleSendOTP();
  };

  const handleBack = () => {
    setStep('identifier');
    setOtp('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'identifier') handleSendOTP();
      else if (step === 'otp' && otp.length === 6) handleVerifyOTP();
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          {step === 'identifier' ? 'Login with OTP' : 'Enter OTP'}
        </CardTitle>
        <CardDescription>
          {step === 'identifier'
            ? 'Enter your phone number or email to receive a one-time password'
            : `We sent a 6-digit code to ${identifier}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'identifier' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="otp-identifier">Phone or Email</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {isEmail ? (
                    <Mail className="h-4 w-4" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                </span>
                <Input
                  id="otp-identifier"
                  placeholder="phone number or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                  autoComplete="username"
                />
              </div>
            </div>
            <Button
              onClick={handleSendOTP}
              disabled={sending || !identifier.trim()}
              className="w-full"
            >
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {sending ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-center block">Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  onKeyDown={handleKeyDown}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              onClick={handleVerifyOTP}
              disabled={verifying || otp.length !== 6}
              className="w-full"
            >
              {verifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {verifying ? 'Verifying...' : 'Verify & Login'}
            </Button>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="px-2"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Change
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={resendTimer > 0}
                className="px-2"
              >
                {resendTimer > 0
                  ? `Resend in ${resendTimer}s`
                  : 'Resend OTP'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
