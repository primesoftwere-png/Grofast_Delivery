'use client';

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bike, Mail, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const router = useRouter();
  const { verifyEmail } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validation
    if (!email.trim()) {
      setErrorMessage("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Invalid email format");
      return;
    }

    if (!otp.trim()) {
      setErrorMessage("OTP is required");
      return;
    }

    if (otp.length !== 6) {
      setErrorMessage("OTP must be 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyEmail(email, otp);
      setSuccessMessage(response.message || "Email verified successfully!");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message || "Verification failed. Please check your OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Bike className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-3xl font-display font-bold text-foreground">
            Verify Email
          </h1>

          <p className="text-muted-foreground mt-1">
            Enter the OTP sent to your email
          </p>
        </div>

        {/* Card */}
        <div className="shadow-lg border border-border/50 rounded-xl">

          {/* Header */}
          <div className="p-6 pb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Email Verification
            </h2>
            <p className="text-sm text-muted-foreground">
              Check your inbox for the verification code
            </p>
          </div>

          {/* Form */}
          <div className="p-6 pt-0">
            <form onSubmit={handleVerify} className="space-y-4">

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage("");
                    }}
                    className="pl-10 pr-3 py-2 w-full text-sm border border-border rounded-lg bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {/* OTP */}
              <div className="space-y-2">
                <label
                  htmlFor="otp"
                  className="text-sm font-medium text-foreground"
                >
                  OTP Code
                </label>

                <input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setErrorMessage("");
                  }}
                  className="px-3 py-2 w-full text-sm border border-border rounded-lg bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              {/* Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
                <p className="font-medium">Testing Note:</p>
                <p>For testing purposes, use OTP: <strong>123456</strong></p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already verified?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
