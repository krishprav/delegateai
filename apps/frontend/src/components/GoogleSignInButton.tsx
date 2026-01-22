import { useEffect, useCallback, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "@/config/api";
import { Button } from "@/components/ui/button";

interface GoogleSignInButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface GoogleCredentialResponse {
  credential: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
          }) => void;
          prompt: (notification?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          renderButton: (element: HTMLElement, config: {
            theme: string;
            size: string;
            text?: string;
          }) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({
  text = "signin_with",
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const hiddenButtonRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    try {
      setLoading(true);
      const result = await axios.post(
        `${BACKEND_URL}/api/v1/auth/google-verify`,
        {
          credential: response.credential,
        },
        {
          withCredentials: true,
        }
      );

      if (result.data) {
        onSuccess?.();
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Google sign-in failed";
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate, onSuccess, onError]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error("VITE_GOOGLE_CLIENT_ID is not defined in environment variables");
      onError?.("Google Client ID not configured");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        if (hiddenButtonRef.current) {
          window.google.accounts.id.renderButton(hiddenButtonRef.current, {
            theme: "outline",
            size: "large",
          });
        }

        setIsInitialized(true);
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleCredentialResponse, onError]);

  const handleClick = () => {
    if (hiddenButtonRef.current && isInitialized) {
      const googleButton = hiddenButtonRef.current.querySelector('div[role="button"]') as HTMLElement;
      if (googleButton) {
        googleButton.click();
      }
    }
  };

  const buttonText = {
    signin_with: "Sign in with Google",
    signup_with: "Sign up with Google",
    continue_with: "Continue with Google",
    signin: "Sign in with Google",
  }[text];

  return (
    <>
      <div ref={hiddenButtonRef} className="hidden"></div>

      <Button
        type="button"
        variant="outline"
        className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 flex items-center justify-center gap-3 transition-all font-medium shadow-sm hover:shadow-md h-11"
        onClick={handleClick}
        disabled={loading || !isInitialized}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {loading ? "Signing in..." : buttonText}
      </Button>
    </>
  );
}
