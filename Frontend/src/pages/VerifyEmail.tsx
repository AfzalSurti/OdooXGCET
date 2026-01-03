import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, RefreshCw, MailCheck } from 'lucide-react';
import { authAPI } from '@/lib/api';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pendingEmail, verifyOtp, resendOtp } = useAuth();

  const locationState = location.state as { email?: string; token?: string } | null;
  const initialEmail = locationState?.email || pendingEmail || '';
  const initialToken = locationState?.token || '';
  const [email] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!email) {
      // If no email is pending, send back to signup
      navigate('/signup', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => setCooldown(c => c - 1), 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const verificationToken = token || (e.target as any).token?.value;
    if (!verificationToken) {
      setError('Verification token is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.verifyEmail(verificationToken);
      if (response.success) {
        setIsVerified(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.message || 'Invalid token. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setCooldown(30);
    await resendOtp();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-border mb-4 overflow-hidden animate-scale-in">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Verify your email</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Enter the code</CardTitle>
            <CardDescription>For security, please confirm your email before continuing.</CardDescription>
          </CardHeader>
          <CardContent>
            {isVerified ? (
              <Alert className="animate-scale-in">
                <MailCheck className="h-4 w-4" />
                <AlertDescription>
                  Email verified successfully! Redirecting to login...
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="animate-scale-in">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="token">Verification Token</Label>
                  <Input
                    id="token"
                    name="token"
                    placeholder="Enter verification token from email"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="h-11"
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Check your email for the verification token
                  </p>
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <MailCheck className="mr-2 h-4 w-4" />
                      Verify & Continue
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
              <Link to="/signup" className="hover:text-foreground">Change email</Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={handleResend}
                disabled={cooldown > 0 || isLoading}
              >
                <RefreshCw className="w-4 h-4" />
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


