import { useState } from "react";
import { useLocation } from "wouter";
import logo from "@assets/cqa-logo-with-text_1775832971845.png";
import SignupAnimation from "@/components/SignupAnimation";

export default function LoginPage() {
  const [email, setEmail] = useState("sean.bridgeman@halight.com");
  const [password, setPassword] = useState("••••••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">
      {/* Background animation — full page */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <SignupAnimation />
      </div>

      {/* Header — floats over animation */}
      <header className="absolute top-0 left-0 right-0 px-6 py-4 flex items-center gap-2 z-20 bg-white/70 backdrop-blur-md">
        <img src={logo} alt="ContextQA" className="h-12 w-auto" />
      </header>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex pt-20">
        {/* Left side - Hero text */}
        <div className="flex-1 flex flex-col justify-center px-16 pb-32">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 inline-flex flex-col max-w-md">
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight max-w-md">
            Say goodbye to{" "}
            <span className="text-indigo-600">backlogs</span>{" "}
            without compromising quality
          </h1>
          <p className="mt-6 text-gray-600 text-base">
            If you don't have an account,{" "}
            <a href="#" className="text-indigo-600 font-semibold hover:underline">
              Request for a Free Trial
            </a>
          </p>
          </div>
        </div>

        {/* Right side - Sign In card */}
        <div className="w-96 flex flex-col justify-center pr-16 pb-16 z-10 relative">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-80">
            <h2 className="cqa-h1 mb-6">Sign In</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
                  placeholder="Email"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 rounded flex items-center justify-center"
                >
                  <span className="text-white text-xs">···</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-20"
                  placeholder="Password"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    type="button"
                    className="w-6 h-6 bg-red-500 rounded flex items-center justify-center"
                  >
                    <span className="text-white text-xs">···</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <a href="#" className="text-sm text-gray-500 hover:text-indigo-600">
                  Forgot Password
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold text-base bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-xl font-semibold text-base border border-indigo-400 bg-white text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* reCAPTCHA badge placeholder */}
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-500 shadow-sm flex items-center gap-1">
        <div className="w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-400 rounded-sm" />
        </div>
        reCAPTCHA
      </div>
    </div>
  );
}
