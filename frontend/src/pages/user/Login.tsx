import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useStore } from "../../store/useStore";
import { googleAuth } from "../../services/api";
import AlertModal from "../../components/AlertModal";
import bgImage from "../../assets/coverImages/kids-own-01.jpg";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => setOpen(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        const response = await googleAuth(
          credentialResponse.credential,
          credentialResponse.clientId,
        );
        const userData = {
          ...response.user,
          token: response.accessToken,
          refreshToken: response.refreshToken,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        // Redirect back to original page or home
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          navigate(redirectPath);
          sessionStorage.removeItem("redirectAfterLogin");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Google Authentication Failed",
      );
      setOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[4px]"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-10 m-4 bg-surface/80 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border text-center transform transition-all">
        <div className="mb-10">
          <h1 className="text-4xl font-serif font-black tracking-widest mb-2">
            ThreadCo
          </h1>
          <div className="h-1 w-12 bg-accent mx-auto rounded-full mb-8"></div>
          <p className="text-xl font-serif mb-2">Welcome Back</p>
          <p className="text-text-secondary text-sm">
            Sign in to access your account and explore our premium collection.
          </p>
        </div>

        <div className="space-y-8 flex flex-col items-center justify-center py-2">
          <div className="w-full flex justify-center transform transition-transform hover:scale-[1.02]">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setErrorMessage("Google Login Failed");
                setOpen(true);
              }}
              useOneTap
              shape="pill"
              theme="filled_black"
              size="large"
              width="320px"
              text="continue_with"
            />
          </div>

          <p className="text-xs text-text-muted max-w-[300px] leading-relaxed">
            By signing in, you agree to our
            <span className="text-accent cursor-pointer hover:underline mx-1">
              Terms of Service
            </span>
            and
            <span className="text-accent cursor-pointer hover:underline mx-1">
              Privacy Policy
            </span>
            .
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-border">
          <p className="text-text-secondary text-sm">
            New to ThreadCo? Just sign in with Google to get started.
          </p>
        </div>
      </div>

      <AlertModal open={open} onClose={handleClose} message={errorMessage} />
    </div>
  );
};

export default Login;
