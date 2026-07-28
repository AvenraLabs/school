import { Sparkles, Globe, Mail, ShieldCheck, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export function AboutAdmin() {
  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader className="py-4 px-5 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold font-display text-lg border border-[#D3E6E0]">
                A
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[#14213D]">Avenra Enterprise Systems</CardTitle>
                <p className="text-xs text-[#52607D] mt-0.5">School Management System & Administration Console</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#EAF3F0] text-[#2F6F5E] font-semibold text-xs border border-[#D3E6E0] font-mono">
              v1.0.0 Active
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4 text-xs">
          <div className="space-y-3 divide-y divide-[#EDEAE1]">
            <div className="flex items-center justify-between py-2">
              <span className="font-semibold text-[#52607D]">Engineering & Platform Team</span>
              <span className="font-bold text-[#14213D]">Avenra</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="font-semibold text-[#52607D]">Official Portal</span>
              <a
                href="https://avenra.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#2F6F5E] hover:underline flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" /> avenra.org
              </a>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="font-semibold text-[#52607D]">Technical Support Desk</span>
              <a
                href="mailto:founders@avenra.org"
                className="font-medium text-[#2F6F5E] hover:underline flex items-center gap-1.5 font-mono"
              >
                <Mail className="w-3.5 h-3.5" /> founders@avenra.org
              </a>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="font-semibold text-[#52607D]">Security & Verification</span>
              <span className="text-[#2F6F5E] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Enterprise SSL & Token Authenticated
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="font-semibold text-[#52607D]">License & Copyright</span>
              <span className="text-[#8C97AB]">
                &copy; {new Date().getFullYear()} Avenra. All rights reserved.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
