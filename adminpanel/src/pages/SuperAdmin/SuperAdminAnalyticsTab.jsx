import React, { useState, useEffect } from 'react';
import { tokenPoliciesAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { StatsCard } from '../../components/common/StatsCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  BarChart3,
  Coins,
  Video,
  MessageSquare,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Building2
} from 'lucide-react';

export function SuperAdminAnalyticsTab({ schools = [] }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [billingSummary, setBillingSummary] = useState(null);
  const [apiLogs, setApiLogs] = useState([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const summaryRes = await tokenPoliciesAPI.getBillingSummary();
      setBillingSummary(summaryRes.data || summaryRes);

      const logsRes = await tokenPoliciesAPI.getApiLogs('all');
      setApiLogs(logsRes.data || logsRes.items || []);
    } catch (err) {
      console.error('Failed loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalWhatsAppSent = schools.reduce((acc, s) => acc + (s.whatsapp_sent_count || 0), 0);
  const totalWhatsAppLimit = schools.reduce((acc, s) => acc + (s.whatsapp_annual_limit || 10000), 0);

  return (
    <div className="space-y-6">
      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total AI Tokens Used"
          value={(billingSummary?.total_tokens_used ?? 0).toLocaleString()}
          icon={Coins}
          active={true}
        />
        <StatsCard
          title="AI Video Seconds Renders"
          value={(billingSummary?.total_video_seconds ?? 0).toLocaleString()}
          icon={Video}
        />
        <StatsCard
          title="WhatsApp Outbound Messages"
          value={totalWhatsAppSent.toLocaleString()}
          icon={MessageSquare}
        />
        <StatsCard
          title="Platform Active Schools"
          value={schools.length}
          icon={Building2}
        />
      </div>

      {/* Institutional Consumption Breakdown */}
      <Card>
        <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#2F6F5E]" /> Institutional Telemetry & WhatsApp Quota Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Institution Name</th>
                  <th className="px-4 py-3">Code / Handle</th>
                  <th className="px-4 py-3">WhatsApp Messages Sent</th>
                  <th className="px-4 py-3">Annual WhatsApp Limit</th>
                  <th className="px-4 py-3">Quota Utilization</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                {schools.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <EmptyState
                        icon={Building2}
                        title="No institutional telemetry data"
                        description="Register schools to track platform consumption."
                      />
                    </td>
                  </tr>
                ) : (
                  schools.map((s) => {
                    const sent = s.whatsapp_sent_count || 0;
                    const limit = s.whatsapp_annual_limit || 10000;
                    const pct = Math.min(100, Math.round((sent / limit) * 100));

                    return (
                      <tr key={s.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="px-4 py-3 font-bold text-[#14213D]">{s.name}</td>
                        <td className="px-4 py-3 font-mono text-[#2F6F5E]">{s.code || `SCH-${s.id}`}</td>
                        <td className="px-4 py-3 font-mono font-bold text-[#14213D]">{sent.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-[#52607D]">{limit.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="w-36 space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-[#2F6F5E] font-bold">{pct}%</span>
                              <span className="text-[#8C97AB]">{sent}/{limit}</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#EDEAE1] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  pct >= 90 ? 'bg-[#B0403A]' : pct >= 70 ? 'bg-[#B8860B]' : 'bg-[#2F6F5E]'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={String(s.status || '').toLowerCase() === 'active' || s.is_active ? 'active' : 'inactive'} size="sm" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
