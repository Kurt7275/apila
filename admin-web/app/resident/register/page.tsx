"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  ArrowRight,
  Users,
  BellRing,
  TrendingUp,
  Shield,
} from "lucide-react";

export default function ResidentRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => router.push("/resident/login"), 1800);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5EFE6] relative overflow-x-hidden flex items-center justify-center p-3 sm:p-6 lg:p-8">
      {/* Decorative background blobs */}
      <div className="fixed top-0 right-0 w-80 h-72 pointer-events-none opacity-40 z-0">
        <svg viewBox="0 0 300 260" fill="none" className="w-full h-full">
          <path d="M120 -40 C180 30 280 40 320 120 C260 140 180 90 120 -40 Z" fill="#E6D3BE" />
          <path d="M220 20 C270 70 310 130 300 200 C250 170 210 100 220 20 Z" fill="#EAD9C6" />
        </svg>
      </div>
      <div className="fixed bottom-0 left-0 w-64 h-64 pointer-events-none opacity-30 z-0">
        <svg viewBox="0 0 260 260" fill="none" className="w-full h-full">
          <circle cx="20" cy="240" r="180" fill="#EFE2D1" />
        </svg>
      </div>

      {/* Main Unified Card */}
      <div className="relative z-10 w-full max-w-[1060px] bg-[#FAF6EF] rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-[0_25px_70px_rgba(45,25,5,0.09)] border border-[#ECE3D5] flex flex-col lg:flex-row">

        {/* ─── LEFT: Branding & Illustration ─── */}
        <div className="w-full lg:w-[52%] relative min-h-[380px] sm:min-h-[540px] lg:min-h-[720px] bg-[#FAF6EF] flex flex-col justify-start p-8 sm:p-10 overflow-hidden">

          {/* Warm ambient background from illustration */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Soft orange hill/wave decorations matching design */}
            <svg viewBox="0 0 600 720" fill="none" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
              <ellipse cx="480" cy="180" rx="260" ry="200" fill="#F5C99A" opacity="0.35" />
              <ellipse cx="420" cy="300" rx="300" ry="220" fill="#F0B87E" opacity="0.25" />
              <ellipse cx="350" cy="420" rx="340" ry="250" fill="#EAA966" opacity="0.15" />
            </svg>
          </div>

          <div className="relative z-10">
            {/* APILA Logo */}
            <div className="flex items-center gap-3 mb-8">
              <svg width="40" height="46" viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-sm">
                <path d="M22 2C10.95 2 2 10.95 2 22C2 35.5 22 50 22 50C22 50 42 35.5 42 22C42 10.95 33.05 2 22 2Z" fill="#F45113"/>
                <path d="M22 9C15.37 9 10 14.37 10 21C10 27.63 15.37 33 22 33C28.63 33 34 27.63 34 21C34 14.37 28.63 9 22 9Z" fill="white"/>
                <path d="M22 13L14.5 19.5H16.5V28H20V23.5H24V28H27.5V19.5H29.5L22 13Z" fill="#F45113"/>
              </svg>
              <div className="flex flex-col">
                <span className="font-extrabold text-[26px] tracking-wider text-[#F45113] leading-none">APILA</span>
                <span className="font-bold text-[9.5px] tracking-[0.14em] text-[#1E293B] leading-tight mt-1">BARANGAY LAPASAN, CDO</span>
              </div>
            </div>

            {/* Headline */}
            <div className="mb-4 leading-[1.05]">
              <p className="text-[38px] sm:text-[44px] font-black text-[#0F172A]">Be part of a</p>
              <p className="text-[38px] sm:text-[44px] font-black text-[#F45113]">stronger</p>
              <p className="text-[38px] sm:text-[44px] font-black text-[#F45113]">Lapasan.</p>
            </div>

            {/* Subtitle */}
            <p className="text-[14px] text-[#475467] leading-relaxed max-w-xs mb-8">
              Join APILA and participate in community programs for a safer, healthier, and more united Barangay Lapasan.
            </p>

            {/* 3 Feature Pills */}
            <div className="flex flex-wrap gap-5 mb-6">
              {[
                { icon: Users, label: "Join Programs" },
                { icon: BellRing, label: "Stay Informed" },
                { icon: TrendingUp, label: "Make a Difference" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#F45113]/10 border border-[#F45113]/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#F45113]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#475467] text-center leading-tight max-w-[60px]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom scenic illustration — fills lower half of left panel */}
          <div className="absolute bottom-0 left-0 right-0 h-[320px] sm:h-[380px] lg:h-[420px] pointer-events-none">
            <Image
              src="/assets/login_left_hero_2x.png"
              alt="Barangay Lapasan scenic illustration"
              fill
              className="object-cover object-bottom select-none"
              priority
            />
          </div>
        </div>

        {/* ─── RIGHT: Registration Form Card ─── */}
        <div className="w-full lg:w-[48%] flex items-center justify-center p-5 sm:p-8 lg:p-10 bg-[#FAF6EF]/50 lg:bg-transparent">
          <div className="w-full max-w-[420px] bg-white rounded-[24px] border border-[#ECE7DF] shadow-[0_10px_35px_rgba(20,10,0,0.04)] p-6 sm:p-8">

            {submitted ? (
              /* ── Success State ── */
              <div className="flex flex-col items-center text-center py-4 gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0F172A]">Account Created!</h2>
                  <p className="text-sm text-[#667085] mt-1.5">Redirecting you to login...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <h1 className="text-[24px] sm:text-[26px] font-bold text-[#0F172A] tracking-tight">
                  Create an Account
                </h1>
                <p className="text-[13px] text-[#667085] mt-1.5 mb-5 leading-relaxed">
                  Join APILA and start participating in community programs in Barangay Lapasan.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                      Full Name <span className="text-[#F45113]">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full h-[44px] pl-10 pr-3.5 rounded-xl border border-[#D0D5DD] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#F45113] focus:ring-2 focus:ring-[#F45113]/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email + Mobile side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Email Address <span className="text-[#F45113]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full h-[44px] pl-9 pr-3 rounded-xl border border-[#D0D5DD] bg-white text-[12px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#F45113] focus:ring-2 focus:ring-[#F45113]/15 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="mobile" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Mobile Number <span className="text-[#F45113]">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                        <input
                          id="mobile"
                          name="mobile"
                          type="tel"
                          placeholder="09XX XXX XXXX"
                          value={formData.mobile}
                          onChange={handleChange}
                          required
                          className="w-full h-[44px] pl-9 pr-3 rounded-xl border border-[#D0D5DD] bg-white text-[12px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#F45113] focus:ring-2 focus:ring-[#F45113]/15 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password + Confirm Password side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="password" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Password <span className="text-[#F45113]">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="w-full h-[44px] pl-9 pr-9 rounded-xl border border-[#D0D5DD] bg-white text-[12px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#F45113] focus:ring-2 focus:ring-[#F45113]/15 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
                        >
                          {showPassword ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Confirm Password <span className="text-[#F45113]">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="w-full h-[44px] pl-9 pr-9 rounded-xl border border-[#D0D5DD] bg-white text-[12px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#F45113] focus:ring-2 focus:ring-[#F45113]/15 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
                        >
                          {showConfirmPassword ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                      Address <span className="text-[#F45113]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="Enter your complete address (House No., Street, Barangay, CDO)"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="w-full h-[44px] pl-10 pr-3.5 rounded-xl border border-[#D0D5DD] bg-white text-[12px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#F45113] focus:ring-2 focus:ring-[#F45113]/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* Privacy Notice */}
                  <div className="flex gap-3 bg-[#FFF7ED] border border-[#FFEDD5] rounded-xl px-4 py-3">
                    <Shield className="w-4 h-4 text-[#F45113] shrink-0 mt-0.5" />
                    <p className="text-[11.5px] text-[#78350F] leading-relaxed">
                      Your information will be used only for APILA and barangay program notifications. We respect your privacy.
                    </p>
                  </div>

                  {/* Create Account Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[48px] mt-1 rounded-full bg-[#F45113] hover:bg-[#DE3E04] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[#E2E8F0]" />
                  <span className="text-[11px] text-[#94A3B8]">or continue with</span>
                  <div className="flex-1 h-px bg-[#E2E8F0]" />
                </div>

                {/* Google */}
                <button
                  type="button"
                  onClick={() => router.push("/resident/dashboard")}
                  className="w-full h-[46px] rounded-full border border-[#D0D5DD] bg-white hover:bg-gray-50 flex items-center justify-center gap-2.5 font-semibold text-[13px] text-[#0F172A] transition-all cursor-pointer shadow-2xs hover:border-gray-300"
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
                <p className="text-center text-[13px] text-[#667085] mt-4">
                  Already have an account?{" "}
                  <Link href="/resident/login" className="font-bold text-[#F45113] hover:underline">
                    Log In
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
