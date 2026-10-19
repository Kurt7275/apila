"use client";

import { Shield, Building2, Bell, Lock, User, Save } from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
          System Settings
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Manage Barangay Lapasan administrative configuration and portal preferences.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#ECE7DF] p-6 lg:p-8 shadow-sm space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Barangay Office
              </label>
              <input
                type="text"
                defaultValue="Barangay Lapasan Administration"
                className="w-full px-4 py-3 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm text-[#0F172A] font-medium outline-none focus:border-[#F45113]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Official Contact Email
              </label>
              <input
                type="email"
                defaultValue="admin@lapasan.gov.ph"
                className="w-full px-4 py-3 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm text-[#0F172A] font-medium outline-none focus:border-[#F45113]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Barangay Captain / Head
              </label>
              <input
                type="text"
                defaultValue="Hon. Julito O. Ogsimer"
                className="w-full px-4 py-3 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm text-[#0F172A] font-medium outline-none focus:border-[#F45113]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Barangay Secretary
              </label>
              <input
                type="text"
                defaultValue="Maria Santos"
                className="w-full px-4 py-3 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm text-[#0F172A] font-medium outline-none focus:border-[#F45113]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#ECE7DF] flex items-center justify-between">
            <span className="text-xs text-[#64748B]">
              Changes are logged in the Barangay Lapasan audit trail.
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#F45113] hover:bg-[#e0450b] text-white text-xs font-bold rounded-full transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saved ? "Settings Saved" : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
