import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface GoogleLoginButtonProps {
  onSuccessNavigate?: (user: { role: string }) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

const GoogleLoginButton = ({
  onSuccessNavigate,
  text = 'continue_with',
}: GoogleLoginButtonProps) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;
    try {
      setLoading(true);
      const user = await loginWithGoogle(response.credential);
      if (onSuccessNavigate) {
        onSuccessNavigate(user);
      } else {
        navigate(
          user.role === 'ADMIN' ? '/admin' : user.role === 'VENDOR' ? '/dashboard' : '/'
        );
      }
    } catch {
      // toast handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <p className="text-xs text-center text-muted-foreground py-2">
        Google sign-in is not configured (missing VITE_GOOGLE_CLIENT_ID).
      </p>
    );
  }

  return (
    <div
      className={`w-full flex justify-center [&>div]:w-full [&_iframe]:!w-full ${loading ? 'opacity-60 pointer-events-none' : ''}`}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => undefined}
        theme="outline"
        size="large"
        width={360}
        text={text}
        shape="rectangular"
      />
    </div>
  );
};

export default GoogleLoginButton;
