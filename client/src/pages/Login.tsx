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

type Step = 'email' | 'account' | 'code';
type AccountOption = {
  id: string;
  name: string;
};

export default function Login() {
  const { requestCode, verifyCode, isAuthenticated, isAuthLoading } = useAuth();
  const { getSetting } = usePortalSettings();
  const [location, setLocation] = useLocation();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [accountOptions, setAccountOptions] = useState<AccountOption[]>([]);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || location !== '/') return;
    const redirectTarget = sessionStorage.getItem('postLoginRedirect') || '/dashboard';
    sessionStorage.removeItem('postLoginRedirect');
    setLocation(redirectTarget);
  }, [isAuthenticated, isAuthLoading, location, setLocation]);

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
      const result = await requestCode(trimmedEmail);
      if (result.requiresAccountSelection) {
        setAccountOptions(result.accounts);
        setSelectedAccountId(result.accounts[0]?.id || '');
        setStep('account');
        return;
      }
      setStep('code');
      setResendCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) {
      setError('Please select the account name you want to sign in as.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestCode(email.trim(), selectedAccountId);
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
      await verifyCode(email.trim(), code, selectedAccountId || undefined);
      const redirectTarget = sessionStorage.getItem('postLoginRedirect') || '/dashboard';
      sessionStorage.removeItem('postLoginRedirect');
      setLocation(redirectTarget);
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
      await requestCode(email.trim(), selectedAccountId || undefined);
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
                : step === 'account'
                  ? 'Select which account name you want to sign in as'
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
            ) : step === 'account' ? (
              <form onSubmit={handleSelectAccount} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="account">Account Name</Label>
                  <select
                    id="account"
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    data-testid="select-login-account"
                  >
                    {accountOptions.map((account) => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3" data-testid="text-login-error">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={loading || !selectedAccountId}
                  data-testid="button-send-code-selected-account"
                >
                  <Mail className="h-4 w-4" />
                  {loading ? 'Sending…' : 'Send Code To Selected Account'}
                </Button>

                <div className="flex items-center justify-between text-sm pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setSelectedAccountId('');
                      setAccountOptions([]);
                      setError('');
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Change email
                  </button>
                </div>
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
                    onClick={() => {
                      setStep('email');
                      setCode('');
                      setError('');
                      setSelectedAccountId('');
                      setAccountOptions([]);
                    }}
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
