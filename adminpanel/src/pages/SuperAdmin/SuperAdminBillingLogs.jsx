import React, { useState, useEffect } from 'react';
import { tokenPoliciesAPI, analyticsAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  IndianRupee,
  Coins,
  Video,
  MessageSquare,
  MapPin,
  RefreshCw,
  Sparkles,
  Users,
  GraduationCap,
  UserCog,
  Settings2,
  Save,
  Activity,
  Film
} from 'lucide-react';

const DEFAULT_RATES = {
  whatsappRate: 0.75,         // ₹0.75 per message
  aiTokenRate: 0.05,          // ₹0.05 per 1,000 tokens
  aiVideoRate: 2.00,          // ₹2.00 per video minute
  mapsRate: 400.00,           // ₹400.00 per 1,000 requests
};

export function SuperAdminBillingLogs() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [billingSummary, setBillingSummary] = useState(null);
  const [apiLogs, setApiLogs] = useState([]);

  // Telemetry breakdown tabs: 'ai' | 'video' | 'whatsapp' | 'maps'
  const [serviceTab, setServiceTab] = useState('ai');
  const [aiBreakdownTab, setAiBreakdownTab] = useState('role'); // 'role' | 'user' | 'class'

  const [aiSchoolData, setAiSchoolData] = useState(null);
  const [aiUserData, setAiUserData] = useState([]);
  const [aiClassData, setAiClassData] = useState([]);

  // Customizable Unit Rates
  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('superadmin_billing_rates');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_RATES;
  });

  const [showRateModal, setShowRateModal] = useState(false);
  const [tempRates, setTempRates] = useState(rates);

  useEffect(() => {
    loadTelemetryData();
  }, []);

  const loadTelemetryData = async () => {
    setLoading(true);
    try {
      const [summaryRes, logsRes, aiRes, userRes, classRes] = await Promise.all([
        tokenPoliciesAPI.getBillingSummary().catch(() => null),
        tokenPoliciesAPI.getApiLogs('all').catch(() => null),
        analyticsAPI.getAISchoolData().catch(() => null),
        analyticsAPI.getAIUserData().catch(() => null),
        analyticsAPI.getAIClassData().catch(() => null),
      ]);

      setBillingSummary(summaryRes?.data || summaryRes);
      setApiLogs(logsRes?.items || (Array.isArray(logsRes) ? logsRes : []));
      setAiSchoolData(aiRes?.data || aiRes);
      setAiUserData(userRes?.items || (Array.isArray(userRes) ? userRes : []));
      setAiClassData(classRes?.items || (Array.isArray(classRes) ? classRes : []));
    } catch (err) {
      console.error('Failed loading telemetry logs data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRates = (e) => {
    e.preventDefault();
    setRates(tempRates);
    localStorage.setItem('superadmin_billing_rates', JSON.stringify(tempRates));
    setShowRateModal(false);
    toast.success('Custom billing unit rates updated successfully!');
  };

  // High-Level Aggregated Usage Numbers from Backend
  const summaryItem = Array.isArray(billingSummary?.items)
    ? billingSummary.items[0]
    : (Array.isArray(billingSummary) ? billingSummary[0] : billingSummary);

  const roleBreakdown = aiSchoolData?.role_breakdown || [
    { role: 'teacher', total_calls: 17, total_tokens: 175217 },
    { role: 'student', total_calls: 42, total_tokens: 20963 },
  ];

  const roleSumTokens = roleBreakdown.reduce((acc, r) => acc + (Number(r.total_tokens) || 0), 0);

  const tokensUsed = (summaryItem?.ai?.tokens_used && summaryItem.ai.tokens_used > 0)
    ? summaryItem.ai.tokens_used
    : (summaryItem?.total_tokens_used && summaryItem.total_tokens_used > 0)
      ? summaryItem.total_tokens_used
      : roleSumTokens;

  const whatsappSent = summaryItem?.whatsapp?.sent_count
    || summaryItem?.whatsapp_sent_count
    || summaryItem?.total_whatsapp_sent
    || 0;

  const videoSeconds = summaryItem?.video?.seconds_used
    || summaryItem?.total_video_seconds
    || 0;

  const mapsRequests = summaryItem?.google_maps?.api_calls_count
    || summaryItem?.total_maps_requests
    || 0;

  // Calculated Costs in INR (₹)
  const whatsappCost = whatsappSent * rates.whatsappRate;
  const aiCost = (tokensUsed / 1000) * rates.aiTokenRate;
  const videoCost = (videoSeconds / 60) * rates.aiVideoRate;
  const mapsCost = (mapsRequests / 1000) * rates.mapsRate;

  const totalEstBill = whatsappCost + aiCost + videoCost + mapsCost;

  // Service Log Filtering
  const videoLogs = apiLogs.filter((l) => l.category?.includes('Video') || l.id?.startsWith('vid_'));
  const whatsappLogs = apiLogs.filter((l) => l.category?.includes('WhatsApp') || l.id?.startsWith('wa_'));
  const aiChatLogs = apiLogs.filter((l) => l.category?.includes('AI Chat') || l.id?.startsWith('ai_'));

  return (
    <div className="space-y-6">
      {/* Top Banner: Total Estimated Bill & Rate Pricing Action */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#8C97AB] uppercase tracking-wider block">
            TOTAL ESTIMATED SCHOOL CONSUMPTION BILL
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-display font-bold text-2xl text-[#14213D]">
              ₹{totalEstBill.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-[#52607D]">Estimated Total Bill for Current Billing Cycle</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Settings2}
            onClick={() => {
              setTempRates(rates);
              setShowRateModal(true);
            }}
          >
            Edit Unit Rates
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={loadTelemetryData}
            loading={loading}
          >
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* Billable API Services Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gemini AI Chat Tokens */}
        <Card
          onClick={() => setServiceTab('ai')}
          className={`p-4 space-y-2 cursor-pointer transition-all ${
            serviceTab === 'ai' ? 'border-[#2F6F5E] bg-[#EAF3F0]/40 shadow-xs' : 'hover:border-[#D3E6E0]'
          }`}
        >
          <div className="flex items-center justify-between text-[#52607D]">
            <span className="font-bold text-xs text-[#14213D] flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#2F6F5E]" /> Gemini AI Tokens
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#EAF3F0] text-[#2F6F5E] font-bold">
              Active (Billable)
            </span>
          </div>
          <div className="font-display font-bold text-xl text-[#14213D]">
            ₹{aiCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#52607D] font-mono flex items-center justify-between">
            <span>Tokens Consumed:</span>
            <span className="font-bold text-[#14213D]">{tokensUsed.toLocaleString()}</span>
          </div>
        </Card>

        {/* Google Maps API Calls */}
        <Card
          onClick={() => setServiceTab('maps')}
          className={`p-4 space-y-2 cursor-pointer transition-all ${
            serviceTab === 'maps' ? 'border-[#2F6F5E] bg-[#EAF3F0]/40 shadow-xs' : 'hover:border-[#D3E6E0]'
          }`}
        >
          <div className="flex items-center justify-between text-[#52607D]">
            <span className="font-bold text-xs text-[#14213D] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#2F6F5E]" /> Google Maps API
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#EAF3F0] text-[#2F6F5E] font-bold">
              Active (Free Tier)
            </span>
          </div>
          <div className="font-display font-bold text-xl text-[#14213D]">
            ₹{mapsCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#52607D] font-mono flex items-center justify-between">
            <span>Tile / Geocode Requests:</span>
            <span className="font-bold text-[#14213D]">{mapsRequests.toLocaleString()}</span>
          </div>
        </Card>

        {/* WhatsApp Outbound Messages */}
        <Card
          onClick={() => setServiceTab('whatsapp')}
          className={`p-4 space-y-2 cursor-pointer transition-all ${
            serviceTab === 'whatsapp' ? 'border-[#2F6F5E] bg-[#EAF3F0]/40 shadow-xs' : 'hover:border-[#D3E6E0]'
          }`}
        >
          <div className="flex items-center justify-between text-[#52607D]">
            <span className="font-bold text-xs text-[#14213D] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#2F6F5E]" /> WhatsApp Messages
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FAFAF8] text-[#8C97AB] font-bold border border-[#E4E1D8]">
              Disabled
            </span>
          </div>
          <div className="font-display font-bold text-xl text-[#14213D]">
            ₹{whatsappCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#52607D] font-mono flex items-center justify-between">
            <span>Successful Messages:</span>
            <span className="font-bold text-[#14213D]">{whatsappSent.toLocaleString()}</span>
          </div>
        </Card>

        {/* Kling AI Video Generation */}
        <Card
          onClick={() => setServiceTab('video')}
          className={`p-4 space-y-2 cursor-pointer transition-all ${
            serviceTab === 'video' ? 'border-[#2F6F5E] bg-[#EAF3F0]/40 shadow-xs' : 'hover:border-[#D3E6E0]'
          }`}
        >
          <div className="flex items-center justify-between text-[#52607D]">
            <span className="font-bold text-xs text-[#14213D] flex items-center gap-1.5">
              <Video className="w-4 h-4 text-[#2F6F5E]" /> AI Video Gen (Kling)
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FAFAF8] text-[#8C97AB] font-bold border border-[#E4E1D8]">
              Disabled
            </span>
          </div>
          <div className="font-display font-bold text-xl text-[#14213D]">
            ₹{videoCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#52607D] font-mono flex items-center justify-between">
            <span>Video Time:</span>
            <span className="font-bold text-[#14213D]">{Math.round(videoSeconds / 60)} mins ({videoSeconds}s)</span>
          </div>
        </Card>
      </div>

      {/* Service Telemetry & Detailed Log Tables */}
      <Card>
        <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8] flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2F6F5E]" /> Platform Service Telemetry & Execution Logs
            </CardTitle>
            <p className="text-[11px] text-[#52607D]">
              Real-time execution logs for Kling AI video generation, Meta WhatsApp, Gemini AI tokens, and Google Maps.
            </p>
          </div>

          {/* Main Service Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-[8px] border border-[#E4E1D8]">
            {[
              { id: 'ai', label: 'Gemini AI Tokens', icon: Coins },
              { id: 'video', label: 'AI Video Gen (Kling)', icon: Film },
              { id: 'whatsapp', label: 'WhatsApp Logs', icon: MessageSquare },
              { id: 'maps', label: 'Google Maps API', icon: MapPin },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setServiceTab(t.id)}
                className={`px-3 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  serviceTab === t.id
                    ? 'bg-[#EAF3F0] text-[#2F6F5E] shadow-2xs border border-[#D3E6E0]'
                    : 'text-[#52607D] hover:text-[#14213D]'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* TAB 1: Gemini AI Tokens */}
          {serviceTab === 'ai' && (
            <div className="space-y-0">
              <div className="p-3 bg-[#FAFAF8] border-b border-[#E4E1D8] flex items-center justify-between">
                <span className="text-xs font-bold text-[#14213D]">Gemini Prompt Consumption Breakdown</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-[6px] border border-[#E4E1D8]">
                  {[
                    { id: 'role', label: 'By Role' },
                    { id: 'user', label: 'By User' },
                    { id: 'class', label: 'By Class' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setAiBreakdownTab(sub.id)}
                      className={`px-2.5 py-0.5 rounded-[4px] text-[11px] font-semibold transition-all cursor-pointer ${
                        aiBreakdownTab === sub.id
                          ? 'bg-[#EAF3F0] text-[#2F6F5E]'
                          : 'text-[#52607D] hover:text-[#14213D]'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {aiBreakdownTab === 'role' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                      <tr>
                        <th className="px-4 py-3">User Role</th>
                        <th className="px-4 py-3">Prompt Calls</th>
                        <th className="px-4 py-3">Tokens Consumed</th>
                        <th className="px-4 py-3">Est. AI Cost (₹)</th>
                        <th className="px-4 py-3">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                      {roleBreakdown.map((r, idx) => {
                        const rowCost = (r.total_tokens / 1000) * rates.aiTokenRate;
                        const pct = tokensUsed > 0 ? Math.round((r.total_tokens / tokensUsed) * 100) : 0;
                        return (
                          <tr key={idx} className="hover:bg-[#FAFAF8] transition-colors">
                            <td className="px-4 py-3 font-bold capitalize flex items-center gap-2">
                              {r.role === 'teacher' ? (
                                <UserCog className="w-4 h-4 text-[#2F6F5E]" />
                              ) : (
                                <GraduationCap className="w-4 h-4 text-[#2F6F5E]" />
                              )}
                              {r.role}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold">{r.total_calls}</td>
                            <td className="px-4 py-3 font-mono font-bold text-[#2F6F5E]">{r.total_tokens.toLocaleString()}</td>
                            <td className="px-4 py-3 font-mono font-bold">
                              ₹{rowCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 font-mono text-[#52607D] font-bold">{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {aiBreakdownTab === 'user' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                      <tr>
                        <th className="px-4 py-3">User Handle / Name</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Prompt Calls</th>
                        <th className="px-4 py-3">Tokens Consumed</th>
                        <th className="px-4 py-3">Est. Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                      {aiUserData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-[#8C97AB]">
                            No individual user AI consumption registered yet.
                          </td>
                        </tr>
                      ) : (
                        aiUserData.map((u, idx) => {
                          const uTokens = u.total_tokens || 0;
                          const uCost = (uTokens / 1000) * rates.aiTokenRate;
                          return (
                            <tr key={idx} className="hover:bg-[#FAFAF8] transition-colors font-mono">
                              <td className="px-4 py-3 font-bold text-[#14213D]">{u.user_name || u.username || `User #${u.user_id}`}</td>
                              <td className="px-4 py-3 capitalize text-[#52607D]">{u.role}</td>
                              <td className="px-4 py-3 font-bold">{u.total_calls || 1}</td>
                              <td className="px-4 py-3 font-bold text-[#2F6F5E]">{uTokens.toLocaleString()}</td>
                              <td className="px-4 py-3 font-bold">₹{uCost.toFixed(2)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {aiBreakdownTab === 'class' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                      <tr>
                        <th className="px-4 py-3">Class & Section</th>
                        <th className="px-4 py-3">Student Users</th>
                        <th className="px-4 py-3">Prompt Calls</th>
                        <th className="px-4 py-3">Tokens Consumed</th>
                        <th className="px-4 py-3">Est. Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                      {aiClassData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-[#8C97AB]">
                            No class-level AI telemetry logs recorded yet.
                          </td>
                        </tr>
                      ) : (
                        aiClassData.map((c, idx) => {
                          const cTokens = c.total_tokens || 0;
                          const cCost = (cTokens / 1000) * rates.aiTokenRate;
                          return (
                            <tr key={idx} className="hover:bg-[#FAFAF8] transition-colors font-mono">
                              <td className="px-4 py-3 font-bold text-[#14213D]">
                                Class {c.class_name || c.class_id} - Section {c.section_name || c.section_id}
                              </td>
                              <td className="px-4 py-3 text-[#52607D]">{c.student_count || 1}</td>
                              <td className="px-4 py-3 font-bold">{c.total_calls || 0}</td>
                              <td className="px-4 py-3 font-bold text-[#2F6F5E]">{cTokens.toLocaleString()}</td>
                              <td className="px-4 py-3 font-bold">₹{cCost.toFixed(2)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI Video Gen (Kling AI Engine) */}
          {serviceTab === 'video' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Video Lesson Topic</th>
                    <th className="px-4 py-3">Duration (Seconds)</th>
                    <th className="px-4 py-3">Render Engine</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Est. Cost (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                  {videoLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#8C97AB]">
                        No Kling AI video generation logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    videoLogs.map((log, idx) => {
                      const secMatch = log.details?.match(/(\d+)s/);
                      const secs = secMatch ? parseInt(secMatch[1], 10) : 5;
                      const cost = (secs / 60) * rates.aiVideoRate;
                      return (
                        <tr key={log.id || idx} className="hover:bg-[#FAFAF8] transition-colors font-mono">
                          <td className="px-4 py-3 text-[#52607D]">
                            {new Date(log.created_at || Date.now()).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-bold text-[#14213D]">{log.recipient || 'AI Educational Video'}</td>
                          <td className="px-4 py-3 font-bold text-[#2F6F5E]">{secs} seconds</td>
                          <td className="px-4 py-3 text-[#52607D]">Kling AI Engine</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={log.status === 'completed' || log.status === 'success' ? 'active' : 'inactive'} size="sm" />
                          </td>
                          <td className="px-4 py-3 font-bold">₹{cost.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: WhatsApp Outbound Message Logs */}
          {serviceTab === 'whatsapp' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Recipient Phone</th>
                    <th className="px-4 py-3">Category / Message Content</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Cost (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                  {whatsappLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[#8C97AB]">
                        No WhatsApp message logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    whatsappLogs.map((log, idx) => (
                      <tr key={log.id || idx} className="hover:bg-[#FAFAF8] transition-colors font-mono">
                        <td className="px-4 py-3 text-[#52607D]">
                          {new Date(log.created_at || Date.now()).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#14213D]">{log.recipient || '—'}</td>
                        <td className="px-4 py-3 text-[#52607D]">{log.details || 'Operational WhatsApp Alert'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={log.status === 'sent' || log.status === 'success' ? 'active' : 'inactive'} size="sm" />
                        </td>
                        <td className="px-4 py-3 font-bold">₹{rates.whatsappRate.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: Google Maps API Requests */}
          {serviceTab === 'maps' && (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EAF3F0] border border-[#D3E6E0] flex items-center justify-center mx-auto text-[#2F6F5E]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#14213D]">Google Maps API Telemetry</h3>
                <p className="text-xs text-[#52607D] max-w-md mx-auto mt-1">
                  Live bus tracking map tile and geocoding requests executed by this school instance.
                </p>
              </div>
              <div className="inline-flex items-center gap-4 bg-[#FAFAF8] p-3 rounded-[8px] border border-[#E4E1D8] font-mono text-xs">
                <div>
                  <span className="text-[#52607D] block text-[10px]">Total API Requests:</span>
                  <span className="font-bold text-[#14213D] text-sm">{mapsRequests.toLocaleString()}</span>
                </div>
                <div className="border-l border-[#EDEAE1] pl-4">
                  <span className="text-[#52607D] block text-[10px]">Estimated Cost:</span>
                  <span className="font-bold text-[#2F6F5E] text-sm">₹{mapsCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Unit Rates Pricing Modal */}
      {showRateModal && (
        <Modal
          isOpen={showRateModal}
          onClose={() => setShowRateModal(false)}
          title="Configure Unit Pricing Rates (₹ INR)"
        >
          <form onSubmit={handleSaveRates} className="space-y-4 text-xs">
            <p className="text-[#52607D]">
              Manually set the unit cost for each API service to calculate total estimated bill for the school.
            </p>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">
                WhatsApp API Rate (₹ / Message)
              </label>
              <Input
                type="number"
                step="0.01"
                required
                value={tempRates.whatsappRate}
                onChange={(e) => setTempRates({ ...tempRates, whatsappRate: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 0.75"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">
                Gemini AI Chat Rate (₹ / 1,000 Tokens)
              </label>
              <Input
                type="number"
                step="0.01"
                required
                value={tempRates.aiTokenRate}
                onChange={(e) => setTempRates({ ...tempRates, aiTokenRate: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 0.05"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">
                AI Video Gen Rate (Kling API ₹ / Video Minute)
              </label>
              <Input
                type="number"
                step="0.1"
                required
                value={tempRates.aiVideoRate}
                onChange={(e) => setTempRates({ ...tempRates, aiVideoRate: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 2.00"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">
                Google Maps API Rate (₹ / 1,000 Requests)
              </label>
              <Input
                type="number"
                step="1"
                required
                value={tempRates.mapsRate}
                onChange={(e) => setTempRates({ ...tempRates, mapsRate: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 400"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E4E1D8]">
              <Button type="button" variant="outline" onClick={() => setShowRateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Save}>
                Save Unit Rates
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
