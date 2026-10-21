"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { adminLogin } from "@/lib/services/auth";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminLogin(email, password);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Login failed. Please check your connection and try again.");
      }
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("admin@lapasan.gov.ph");
    setPassword("admin2026");
  };

  const isEmailValid = email.includes("@") && email.includes(".");

  return (
    <div className="min-h-screen bg-[#FFF9F3] text-[#0F172A] flex flex-col justify-between selection:bg-[#F45113]/15 selection:text-[#F45113]">
      {/* ── Top Header / Brand Mark ── */}
      <header className="w-full px-8 lg:px-14 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-black tracking-tight text-[#F45113] lowercase">
            apila<span className="text-[#0F172A]">.</span>
          </span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-[#F45113]/10 text-[#F45113] border border-[#F45113]/20">
            Admin Portal
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <ShieldCheck className="w-4 h-4 text-[#F45113]" />
          <span className="hidden sm:inline">Barangay Lapasan, CDO</span>
        </div>
      </header>

      {/* ── Main Hero Section ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 py-4 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        
        {/* Left: Premium Vector Illustration (Inspired by reference) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-md lg:max-w-lg aspect-[4/3] relative flex items-center justify-center">
            <svg
              viewBox="0 0 600 450"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto drop-shadow-sm select-none"
            >
              <defs>
                <linearGradient id="deskGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FB923C" />
                  <stop offset="55%" stopColor="#F45113" />
                  <stop offset="100%" stopColor="#C2410C" />
                </linearGradient>
                <linearGradient id="panelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EA580C" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#9A3412" />
                </linearGradient>
                <linearGradient id="warmSun" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F45113" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#F45113" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FDBA74" />
                  <stop offset="50%" stopColor="#F45113" />
                  <stop offset="100%" stopColor="#9A3412" />
                </linearGradient>
              </defs>

              {/* Ambient Background Glow */}
              <circle cx="300" cy="225" r="190" fill="url(#warmSun)" />

              {/* Floor Base Guidelines */}
              <line x1="20" y1="365" x2="580" y2="365" stroke="#F45113" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="80" y1="375" x2="260" y2="375" stroke="#FB923C" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" />
              <line x1="340" y1="375" x2="480" y2="375" stroke="#FB923C" strokeWidth="2" strokeDasharray="8 6" strokeLinecap="round" />

              {/* Background Spark Accents */}
              <g stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
                <circle cx="215" cy="150" r="1.5" fill="#F45113" />
                <path d="M215 140v-4M215 160v4M205 150h-4M225 150h4" />
                <circle cx="435" cy="255" r="1.5" fill="#F45113" />
                <path d="M435 247v-3M435 263v3M427 255h-3M443 255h3" />
              </g>

              {/* Staff Member Behind Desk */}
              <g id="staff">
                {/* Hair back */}
                <path d="M216 195c-15 0-25 15-22 45 6 1 18 1 24-2 3-15 4-30-2-43z" fill="#0F172A" />
                {/* Body/Blouse */}
                <path d="M205 240c-18 6-30 25-32 50h72c-2-25-14-44-32-50z" fill="#0F172A" />
                {/* Neck */}
                <rect x="220" y="215" width="12" height="15" rx="3" fill="#FED7AA" />
                {/* Head */}
                <circle cx="226" cy="195" r="18" fill="#FED7AA" />
                {/* Hair front */}
                <path d="M210 190c4-12 18-16 28-10 6 4 10 12 11 20-4-3-12-6-20-4-6 2-12 8-19-6z" fill="#0F172A" />
                {/* Face feature hint */}
                <path d="M233 194c2 0 4 2 4 4" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M231 202c3 2 7 2 9 0" stroke="#F45113" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* The Modern Office / Service Desk Counter */}
              <g id="counter">
                {/* Main Desk Block */}
                <path
                  d="M130 240 L380 240 C382 240 384 242 384 244 L384 365 L130 365 Z"
                  fill="url(#deskGrad)"
                />
                {/* Desk Counter Top Trim */}
                <rect x="125" y="235" width="264" height="7" rx="3" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1" />
                {/* Subtle Modern Geometric Facet on Desk */}
                <path
                  d="M130 240 L384 300 L384 365 L130 365 Z"
                  fill="url(#panelGrad)"
                />

                {/* Laptop on desk */}
                <rect x="175" y="218" width="55" height="17" rx="3" fill="#0F172A" />
                <rect x="178" y="221" width="49" height="11" rx="1.5" fill="#FED7AA" />
                <rect x="170" y="233" width="65" height="4" rx="2" fill="#ECE7DF" />
              </g>

              {/* Potted Leaf Plant on Desk Counter */}
              <g id="desk-plant">
                <rect x="305" y="210" width="22" height="12" rx="3" fill="#0F172A" />
                <path d="M303 207h26v4h-26z" fill="#334155" rx="1.5" />
                <path d="M316 207v-12" stroke="#F45113" strokeWidth="2" strokeLinecap="round" />
                <circle cx="316" cy="190" r="4" fill="#F45113" />
                <circle cx="309" cy="197" r="3.5" fill="#FB923C" />
                <circle cx="323" cy="197" r="3.5" fill="#F97316" />
              </g>

              {/* Tall Floor Plant beside Desk */}
              <g id="floor-plant">
                {/* Planter Pot */}
                <path d="M375 320 L370 365 L415 365 L410 320 Z" fill="#0F172A" />
                <ellipse cx="392" cy="320" rx="20" ry="4" fill="#334155" />
                {/* Big Organic Sculptural Leafy Plant */}
                <path
                  d="M392 320 C375 280 340 240 365 190 C385 150 425 180 435 220 C445 260 415 300 392 320 Z"
                  fill="url(#leafGrad)"
                />
                <path
                  d="M392 320 C382 270 380 230 400 185"
                  stroke="#FFF7ED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.75"
                />
              </g>

              {/* Citizen / Resident at the Counter */}
              <g id="citizen">
                {/* Briefcase/Portfolio bag */}
                <rect x="68" y="280" width="45" height="34" rx="3" fill="#EA580C" />
                <path d="M83 280v-8a4 4 0 0 1 4-4h7a4 4 0 0 1 4 4v8" stroke="#9A3412" strokeWidth="2.5" fill="none" />
                <line x1="68" y1="298" x2="113" y2="298" stroke="#9A3412" strokeWidth="1.5" />

                {/* Left arm holding bag */}
                <path d="M102 215 L88 285" stroke="#FBBF24" strokeWidth="14" strokeLinecap="round" />
                {/* Hand */}
                <circle cx="87" cy="285" r="5" fill="#FED7AA" />

                {/* Legs (Navy pants) */}
                <line x1="94" y1="295" x2="90" y2="365" stroke="#334155" strokeWidth="11" strokeLinecap="round" />
                <line x1="122" y1="295" x2="124" y2="365" stroke="#1E293B" strokeWidth="11" strokeLinecap="round" />
                {/* Shoes */}
                <path d="M82 365h15v4h-15z" fill="#F45113" rx="2" />
                <path d="M117 365h15v4h-15z" fill="#F45113" rx="2" />

                {/* Torso / Mustard Yellow Sweater */}
                <path d="M92 205 L135 205 L130 295 L95 295 Z" fill="#F59E0B" rx="4" />

                {/* Right Arm leaning on counter */}
                <path d="M125 210 L160 238 L195 238" stroke="#F59E0B" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="196" cy="238" r="5" fill="#FED7AA" />

                {/* Neck */}
                <rect x="110" y="188" width="10" height="15" rx="3" fill="#FED7AA" />

                {/* Head Profile */}
                <rect x="108" y="165" width="22" height="24" rx="7" fill="#FED7AA" />
                {/* Hair */}
                <path d="M103 170c-2-12 10-18 25-15 5 1 10 5 11 11-4-1-10 1-13 4-4 4-5 8-23 0z" fill="#1E293B" />
              </g>
            </svg>
          </div>
        </div>

        {/* Right: Clean, Airy Sign-in Card Form (Reference layout) */}
        <div className="w-full lg:w-1/2 max-w-md flex flex-col justify-center">
          
          {/* Greeting */}
          <div className="mb-7 text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A]">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
              To manage barangay programs and resident participation, please sign in with your administrator account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Unified Clean Form Input Group (Matching reference rounded card with divider) */}
            <div className="rounded-2xl bg-white border border-[#ECE7DF] shadow-sm divide-y divide-[#ECE7DF] overflow-hidden focus-within:ring-2 focus-within:ring-[#F45113]/30 focus-within:border-[#F45113] transition-all">
              
              {/* Email Row */}
              <div
                className={`flex items-center px-4 py-3.5 transition-colors ${
                  focusedField === "email" ? "bg-[#FFF9F3]/40" : "bg-white"
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center text-[#94A3B8] flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 px-2">
                  <label
                    htmlFor="email-address"
                    className="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider select-none"
                  >
                    Email Address
                  </label>
                  <input
                    id="email-address"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="admin@lapasan.gov.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent text-sm font-medium text-[#0F172A] placeholder-[#CBD5E1] outline-none"
                  />
                </div>
                {isEmailValid && (
                  <div className="flex-shrink-0 pr-1 text-emerald-500 animate-in fade-in zoom-in-75">
                    <CheckCircle2 className="w-5 h-5 fill-emerald-50 text-emerald-600" />
                  </div>
                )}
              </div>

              {/* Password Row */}
              <div
                className={`flex items-center px-4 py-3.5 transition-colors ${
                  focusedField === "password" ? "bg-[#FFF9F3]/40" : "bg-white"
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center text-[#94A3B8] flex-shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 px-2">
                  <label
                    htmlFor="admin-password"
                    className="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider select-none"
                  >
                    Password
                  </label>
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent text-sm font-medium text-[#0F172A] placeholder-[#CBD5E1] outline-none"
                  />
                </div>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex-shrink-0 p-1 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Remember Me & Quick Demo Fill */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none text-[#64748B] hover:text-[#0F172A] transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#ECE7DF] text-[#F45113] focus:ring-[#F45113] accent-[#F45113] cursor-pointer"
                />
                <span className="font-medium">Remember Me</span>
              </label>

              <button
                type="button"
                onClick={fillDemo}
                className="font-medium text-[#F45113] hover:text-[#d43e06] transition-colors"
              >
                Quick Demo Fill
              </button>
            </div>

            {/* Action Buttons Row (Matching the reference's pill buttons!) */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-[#F45113] hover:bg-[#e0450b] text-white font-semibold text-sm rounded-full flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={fillDemo}
                className="h-12 px-5 bg-white border border-[#ECE7DF] hover:bg-[#FFF9F3] text-[#0F172A] text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Fill Credentials
              </button>
            </div>
          </form>

          {/* Clean Security Info Banner */}
          <div className="mt-8 pt-6 border-t border-[#ECE7DF]/70 flex items-center justify-between text-[11px] text-[#94A3B8]">
            <span>Barangay Lapasan Admin System</span>
            <span className="font-mono">v1.2</span>
          </div>

        </div>

      </main>

      {/* ── Minimal Clean Footer ── */}
      <footer className="w-full py-4 text-center text-xs text-[#94A3B8]">
        Barangay Lapasan, Cagayan de Oro City · Official Personnel Portal
      </footer>
    </div>
  );
}
