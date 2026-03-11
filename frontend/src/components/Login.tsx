import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AlertModal from "./AlertModal";
import { GoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../services/api";
import { useStore } from "../store/useStore";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => setOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for authentication logic
    console.log("Login attempt with:", { email, password });

    // Simulate a failed API response
    const simulatedApiResponse = {
      status: "failed",
      message: "Invalid email or password",
    };

    if (simulatedApiResponse.status === "failed") {
      setErrorMessage(simulatedApiResponse.message);
      setOpen(true);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        const response = await googleAuth(
          credentialResponse.credential,
          credentialResponse.clientId,
        );
        setUser(response.user);
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
    <div className="min-h-screen bg-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-pink-600">
            Welcome to KIDS-OWN
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Sign In
            </button>
          </div>
        </form>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            setErrorMessage("Google Login Failed");
            setOpen(true);
          }}
        />
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-pink-600 hover:text-pink-500"
          >
            Sign up
          </Link>
        </p>
      </div>
      <AlertModal open={open} onClose={handleClose} message={errorMessage} />
    </div>
  );
};

export default Login;
