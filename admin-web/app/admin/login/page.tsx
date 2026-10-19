"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Eye, EyeOff, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/admin/dashboard"), 800);
  };

  const fillDemo = () => {
    setEmail("admin@lapasan.gov.ph");
    setPassword("admin2026");
    setRole("Secretary");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex w-1/2 apila-gradient flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">APILA</span>
          </div>
          <p className="text-white/60 text-sm">Admin Portal · Barangay Lapasan</p>
        </div>
        <div className="relative z-10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Barangay Administration
            <br />
            Management Portal
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            Manage programs, review registrations, monitor residents, and generate
            community participation reports.
          </p>
        </div>
        <div className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} Barangay Lapasan — APILA Admin System
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-muted/30">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-apila-blue flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-apila-blue">APILA Admin</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Sign In</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Authorized Barangay Lapasan personnel only.
            </p>
          </div>

          <Card className="border-border/60">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-role">Role</Label>
                  <Select value={role} onValueChange={(val) => setRole(val || "")} required>
                    <SelectTrigger id="admin-role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Captain">Barangay Captain</SelectItem>
                      <SelectItem value="Secretary">Barangay Secretary</SelectItem>
                      <SelectItem value="Program Officer">Program Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="admin-email">Email Address</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@lapasan.gov.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-apila-blue" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin Sign In
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-xs text-blue-700 font-medium mb-1">Demo Credentials</p>
            <p className="text-xs text-blue-600">
              Role: <code>Barangay Secretary</code> · Email:{" "}
              <code>admin@lapasan.gov.ph</code> · Password: <code>admin2026</code>
            </p>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-blue-700 mt-1"
              onClick={fillDemo}
            >
              Fill demo credentials
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
