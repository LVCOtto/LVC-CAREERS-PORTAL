import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { usePortalSettings } from '@/lib/portalSettingsContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, ArrowRight } from 'lucide-react';
import lvcLogo from '@assets/image-1_1767968047751.png';

type Step = 'email' | 'code';

export default function Login() {
  const { requestCode, verifyCode } = useAuth();
  const { getSetting } = usePortalSettings();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestCode(trimmedEmail);
      setStep('code');
      setResendCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter the 6-digit code from your email.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyCode(email.trim(), code);
      setLocation('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code. Please try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      await requestCode(email.trim());
      setResendCountdown(60);
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lvc-gradient flex items-center justify-center p-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <img src={lvcLogo} alt="LVC UK" className="h-20 w-auto mx-auto mb-6" />
          <h1 className="font-display text-4xl font-bold text-white mb-3">
            {getSetting('portal.loginHeading')}
          </h1>
          <p className="text-lg text-white/70">
            {getSetting('portal.loginSubheading')}
          </p>
        </div>

        <Card className="bg-card/95 backdrop-blur border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl">Sign In</CardTitle>
            <CardDescription className="text-base">
              {step === 'email'
                ? 'Enter your work email to receive a sign-in code'
                : `Enter the 6-digit code sent to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            {step === 'email' ? (
              <form onSubmit={handleRequestCode} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                    data-testid="input-login-email"
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3" data-testid="text-login-error">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={loading}
                  data-testid="button-send-code"
                >
                  <Mail className="h-4 w-4" />
                  {loading ? 'Sending…' : 'Send Sign-In Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div className="space-y-3">
                  <Label className="block text-center text-sm">Your 6-digit code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={setCode}
                      autoFocus
                      data-testid="input-login-code"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3" data-testid="text-login-error">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={loading || code.length !== 6}
                  data-testid="button-verify-code"
                >
                  <ArrowRight className="h-4 w-4" />
                  {loading ? 'Verifying…' : 'Verify Code'}
                </Button>

                <div className="flex items-center justify-between text-sm pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setCode(''); setError(''); }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCountdown > 0 || loading}
                    className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    data-testid="button-resend-code"
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Contact your administrator if you need account access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
