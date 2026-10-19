"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";

export default function ResidentLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // If empty or demo, route to resident dashboard
    setTimeout(() => {
      router.push("/resident/dashboard");
    }, 600);
  };

  const handleDemoFill = () => {
    setEmail("resident@lapasan.gov.ph");
    setPassword("123456");
  };

  return (
    <div className="min-h-screen w-full bg-[#F5EFE6] relative overflow-x-hidden flex items-center justify-center p-3 sm:p-6 lg:p-8">
      {/* Decorative leaf / organic shapes in corners matching master mockup */}
      <div className="fixed top-0 right-0 w-80 h-72 pointer-events-none opacity-40 z-0">
        <svg viewBox="0 0 300 260" fill="none" className="w-full h-full">
          <path d="M120 -40 C180 30 280 40 320 120 C260 140 180 90 120 -40 Z" fill="#E6D3BE" />
          <path d="M220 20 C270 70 310 130 300 200 C250 170 210 100 220 20 Z" fill="#EAD9C6" />
          <path d="M70 -30 C130 50 190 70 260 80 C180 120 100 60 70 -30 Z" fill="#EDDEC9" />
        </svg>
      </div>
      <div className="fixed top-0 left-0 w-64 h-64 pointer-events-none opacity-30 z-0">
        <svg viewBox="0 0 260 260" fill="none" className="w-full h-full">
          <circle cx="20" cy="20" r="160" fill="#EFE2D1" />
          <circle cx="50" cy="50" r="100" fill="#F4EAE0" />
        </svg>
      </div>
      <div className="fixed bottom-0 right-0 w-72 h-72 pointer-events-none opacity-35 z-0">
        <svg viewBox="0 0 300 300" fill="none" className="w-full h-full">
          <path d="M150 320 C180 230 250 210 320 210 C290 280 220 310 150 320 Z" fill="#E4D0BB" />
          <path d="M100 310 C160 250 210 260 280 290 C220 330 150 330 100 310 Z" fill="#EAD9C6" />
        </svg>
      </div>

      {/* Main Unified Card Container */}
      <div className="relative z-10 w-full max-w-[1020px] bg-[#FAF6EF] rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-[0_25px_70px_rgba(45,25,5,0.09)] border border-[#ECE3D5] flex flex-col lg:flex-row">
        
        {/* LEFT COLUMN: The complete master illustration & brand artwork */}
        <div className="w-full lg:w-[58%] relative min-h-[460px] sm:min-h-[580px] lg:min-h-[660px] flex flex-col justify-end">
          <Image
            src="/assets/login_left_hero_2x.png"
            alt="APILA — Community Programs. Stronger Participation. Barangay Lapasan, CDO"
            fill
            className="object-cover object-left-top select-none"
            priority
          />
        </div>

        {/* RIGHT COLUMN: The pristine white floating login card */}
        <div className="w-full lg:w-[42%] flex items-center justify-center p-6 sm:p-8 lg:p-10 bg-[#FAF6EF]/60 lg:bg-transparent">
          <div className="w-full max-w-[370px] bg-white rounded-[24px] border border-[#ECE7DF] shadow-[0_10px_35px_rgba(20,10,0,0.04),0_1px_2px_rgba(0,0,0,0.03)] p-6 sm:p-8">

            {/* Header */}
            <h1 
              onClick={handleDemoFill}
              title="Click to fill demo account"
              className="text-[25px] sm:text-[27px] font-bold text-[#0F172A] tracking-tight cursor-pointer"
            >
              Welcome Back
            </h1>
            <p className="text-[13px] text-[#667085] mt-1.5 mb-6 leading-relaxed">
              Log in to your APILA account and continue exploring barangay programs.
            </p>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Address */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-xs font-semibold text-[#1E293B] mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-3.5 rounded-xl border border-[#D0D5DD] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#F45113] focus:ring-2 focus:ring-[#F45113]/15 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-xs font-semibold text-[#1E293B] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-10 rounded-xl border border-[#D0D5DD] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#F45113] focus:ring-2 focus:ring-[#F45113]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  className="text-xs font-semibold text-[#F45113] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Log In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] mt-2 rounded-2xl bg-[#F45113] hover:bg-[#DE3E04] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Log In
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#E2E8F0]" />
              <span className="text-[11px] text-[#94A3B8]">or continue with</span>
              <div className="flex-1 h-px bg-[#E2E8F0]" />
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setTimeout(() => router.push("/resident/dashboard"), 400);
              }}
              className="w-full h-[46px] rounded-full border border-[#D0D5DD] bg-white hover:bg-gray-50 flex items-center justify-center gap-2.5 font-semibold text-xs sm:text-[13px] text-[#0F172A] transition-all cursor-pointer shadow-2xs hover:border-gray-300"
            >
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.75-.06-1.5-.195-2.22H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.4 3.665-9.02z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.9 0 12s.45 3.86 1.24 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15C6.23 6.85 8.88 4.75 12 4.75z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Footer */}
            <p className="text-center text-xs text-[#667085] mt-5">
              Don&apos;t have an account?{" "}
              <Link
                href="/resident/register"
                className="font-bold text-[#F45113] hover:underline"
              >
                Register
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
