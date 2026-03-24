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
        const userWithToken = { ...response.user, token: response.token };
        setUser(userWithToken);
        localStorage.setItem("user", JSON.stringify(userWithToken));
        navigate("/");
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Google Authentication Failed",
      );
      setOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-pink-50">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-pink-900/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 m-4 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 text-center transform transition-all hover:scale-[1.01]">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-pink-600 tracking-tight mb-2">
            KIDS-OWN
          </h1>
          <div className="h-1 w-20 bg-pink-400 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-700 text-lg font-medium">
            Discover the Joy of Childhood
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Sign in to explore our collection
          </p>
        </div>

        <div className="space-y-6 flex flex-col items-center justify-center py-4">
          <div className="w-full flex justify-center transform transition-transform hover:scale-105">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setErrorMessage("Google Login Failed");
                setOpen(true);
              }}
              useOneTap
              shape="pill"
              theme="filled_blue"
              size="large"
              text="continue_with"
            />
          </div>
          
          <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed">
            By signing in, you agree to our 
            <span className="text-pink-500 cursor-pointer hover:underline mx-1">Terms of Service</span> 
            and 
            <span className="text-pink-500 cursor-pointer hover:underline mx-1">Privacy Policy</span>.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-gray-600 text-sm">
            Fast, secure, and easy access with Google.
          </p>
        </div>
      </div>

      <AlertModal open={open} onClose={handleClose} message={errorMessage} />
    </div>
  );
};

export default Login;
