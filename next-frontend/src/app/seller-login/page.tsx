"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { sellerLogin } from "@/src/services/sellerApi";
import CustomButton from "@/src/components/CustomButton";

const SellerLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await sellerLogin({ email, password });
      if (data.success) {
        router.push("/seller/inventory");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface p-8 rounded-3xl border border-border shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-black text-text-primary mb-2">Seller Panel</h1>
          <p className="text-text-secondary">Please sign in to your seller account</p>
        </div>
        
        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-text-muted mb-2 px-1">
              Email
            </label>
            <input
              type="email"
              className="w-full bg-surface-light border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-text-muted mb-2 px-1">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-surface-light border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <CustomButton type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </CustomButton>
        </form>
      </div>
    </div>
  );
};

export default SellerLogin;

