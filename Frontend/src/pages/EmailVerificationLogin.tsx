import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { n8nService } from '@/lib/n8n-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, RefreshCw, MailCheck, ArrowLeft } from 'lucide-react';

export default function EmailVerificationLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const locationState = location.state as { email?: string; isLoginFlow?: boolean } | null;
  const [email] = useState(locationState?.email || '');
  const [userCode, setUserCode] = useState('');
  const [fetchedCode, setFetchedCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCode, setIsFetchingCode] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Auto-fetch verification code from webhook.site
  useEffect(() => {
    const autoFetchCode = async () => {
      if (email && !fetchedCode && !isFetchingCode) {
        setIsFetchingCode(true);
        try {
          console.log('Fetching verification code from webhook.site...');
          const code = await n8nService.getVerificationCodeFromWebhookSite(email, 5, 1000);
          if (code) {
            setFetchedCode(code);
            setUserCode(code); // Auto-fill the code
            console.log('Verification code fetched successfully:', code);
          }
        } catch (err) {
          console.warn('Failed to fetch code automatically, user will need to enter manually:', err);
        } finally {
          setIsFetchingCode(false);
        }
      }
    };

    autoFetchCode();
  }, [email, fetchedCode, isFetchingCode]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userCode) {
      setError('Please enter the verification code');
      return;
    }

    if (!fetchedCode) {
      setError('Verification code not found. Please fetch it from email first.');
      return;
    }

    setIsLoading(true);
    try {
      // Verify the code matches
      if (userCode.trim() !== fetchedCode.trim()) {
        setError('Verification code does not match. Please check and try again.');
        setIsLoading(false);
        return;
      }

      // Code is verified - create temporary user session to complete verification
      // For login flow, we'll store a temporary flag and redirect to a verification completion endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/complete-login-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        localStorage.setItem('zarvo_token', data.data.token);
        setSuccess(true);
        
        const redirectTo = data.data?.redirectTo || '/dashboard';
        setTimeout(() => {
          navigate(redirectTo);
        }, 1500);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualFetch = async () => {
    setError('');
    setIsFetchingCode(true);
    try {
      console.log('Manually fetching verification code...');
      const code = await n8nService.getVerificationCodeFromWebhookSite(email);
      if (code) {
        setFetchedCode(code);
        setUserCode(code);
        console.log('Code fetched successfully');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch verification code');
    } finally {
      setIsFetchingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-border mb-4 overflow-hidden animate-scale-in">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {success ? 'Logged In!' : 'Verify your email to continue'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {success ? 'You will be redirected to dashboard shortly...' : `Verification code sent to ${email}`}
          </p>
        </div>

        {success ? (
          <Card>
            <CardContent className="pt-8 pb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <MailCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <p className="text-center text-foreground font-medium">
                Email verified and logged in successfully!
              </p>
              <p className="text-center text-muted-foreground text-sm mt-2">
                Redirecting to dashboard...
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Verify Email</CardTitle>
              <CardDescription>
                {isFetchingCode ? 'Fetching verification code...' : 'Enter the code from your email to continue'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="animate-scale-in">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isFetchingCode && (
                  <Alert className="animate-scale-in bg-blue-50 border-blue-200">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription className="text-blue-800">Fetching your verification code...</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    placeholder="Enter code from email"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="h-11 text-lg tracking-widest"
                    disabled={isLoading || isFetchingCode}
                  />
                  {fetchedCode && (
                    <p className="text-xs text-green-600">✓ Code fetched from email</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={isLoading || isFetchingCode}
                >
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

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleManualFetch}
                  disabled={isLoading || isFetchingCode}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {isFetchingCode ? 'Fetching...' : 'Fetch Code from Email'}
                </Button>
              </form>

              <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
                <Link to="/login" className="inline-flex items-center gap-1 hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
