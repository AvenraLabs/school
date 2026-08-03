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
  Coins,
  Video,
  Image as ImageIcon,
  MessageSquare,
  MapPin,
  RefreshCw,
  Settings2,
  Activity,
  Film
} from 'lucide-react';

const DEFAULT_RATES = {
  whatsappRate: 0.75,         // ₹0.75 per message
  aiTokenRate: 0.05,          // ₹0.05 per 1,000 tokens
  aiVideoRate: 2.00,          // ₹2.00 per video minute
  aiDiagramRate: 1.00,        // ₹1.00 per diagram image
  mapsRate: 400.00,           // ₹400.00 per 1,000 requests
};

export function SuperAdminBillingLogs() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [billingSummary, setBillingSummary] = useState(null);
  const [apiLogs, setApiLogs] = useState([]);

  // Telemetry breakdown tabs: 'ai' | 'video' | 'diagram' | 'whatsapp' | 'maps'
  const [serviceTab, setServiceTab] = useState('ai');
  const [aiSchoolData, setAiSchoolData] = useState(null);

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
      const [summaryRes, logsRes, aiRes] = await Promise.all([
        tokenPoliciesAPI.getBillingSummary().catch(() => null),
        tokenPoliciesAPI.getApiLogs('all').catch(() => null),
        analyticsAPI.getAISchoolData().catch(() => null),
      ]);

      setBillingSummary(summaryRes?.data || summaryRes);
      setApiLogs(logsRes?.items || (Array.isArray(logsRes) ? logsRes : []));
      setAiSchoolData(aiRes?.data || aiRes);
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
    toast.success('Custom billing unit rates updated!');
  };

  const topSummary = billingSummary?.summary || billingSummary?.items?.summary || billingSummary?.data?.summary || {};
  const itemsList = Array.isArray(billingSummary?.items) 
    ? billingSummary.items 
    : (Array.isArray(billingSummary?.items?.items)
      ? billingSummary.items.items
      : (Array.isArray(billingSummary) ? billingSummary : []));

  const roleBreakdown = aiSchoolData?.role_breakdown || [];
  const roleSumTokens = roleBreakdown.reduce((acc, r) => acc + (Number(r.total_tokens) || 0), 0);

  const tokensUsed = topSummary?.ai?.tokens_used 
    || itemsList.reduce((acc, sch) => acc + (sch.ai?.tokens_used || 0), 0) 
    || roleSumTokens;

  const whatsappSent = topSummary?.whatsapp?.sent_count 
    || itemsList.reduce((acc, sch) => acc + (sch.whatsapp?.sent_count || 0), 0);

  const videoSeconds = topSummary?.video?.seconds_used 
    || itemsList.reduce((acc, sch) => acc + (sch.video?.seconds_used || 0), 0);

  const diagramCount = topSummary?.diagram?.count 
    || itemsList.reduce((acc, sch) => acc + (sch.diagram?.count || 0), 0);

  const mapsRequests = topSummary?.google_maps?.api_calls_count 
    || itemsList.reduce((acc, sch) => acc + (sch.google_maps?.api_calls_count || 0), 0);

  // Calculated Costs in INR (₹)
  const whatsappCost = whatsappSent * (rates.whatsappRate || 0.75);
  const aiCost = (tokensUsed / 1000) * (rates.aiTokenRate || 0.05);
  const videoCost = (videoSeconds / 60) * (rates.aiVideoRate || 2.00);
  const diagramCost = diagramCount * (rates.aiDiagramRate || 1.00);
  const mapsCost = (mapsRequests / 1000) * (rates.mapsRate || 400.00);

  const totalEstBill = whatsappCost + aiCost + videoCost + diagramCost + mapsCost;

  // Service Log Filtering
  const videoLogs = apiLogs.filter((l) => l.category?.includes('Video') || l.id?.startsWith('vid_'));
  const diagramLogs = apiLogs.filter((l) => l.category?.includes('Diagram') || l.id?.startsWith('dia_'));
  const whatsappLogs = apiLogs.filter((l) => l.category?.includes('WhatsApp') || l.id?.startsWith('wa_'));
  const aiChatLogs = apiLogs.filter((l) => l.category?.includes('AI Chat') || l.id?.startsWith('ai_'));
  const mapsLogs = apiLogs.filter((l) => l.category?.includes('Maps') || l.id?.startsWith('map_'));

  const activeLogs = serviceTab === 'video'
    ? videoLogs
    : serviceTab === 'diagram'
      ? diagramLogs
      : serviceTab === 'whatsapp'
        ? whatsappLogs
        : serviceTab === 'maps'
          ? mapsLogs
          : aiChatLogs;

  return (
    <div className="space-y-4">
      {/* Top Banner: Total Estimated Bill */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#8C97AB] uppercase tracking-wider block">
            ESTIMATED BILLING CYCLE COST
          </span>
          <span className="font-display font-bold text-xl text-[#14213D]">
            ₹{totalEstBill.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
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
            Rates
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={loadTelemetryData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Billable API Services Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Gemini AI Chat Tokens */}
        <Card
          onClick={() => setServiceTab('ai')}
          className={`p-3 space-y-1.5 cursor-pointer transition-all ${
            serviceTab === 'ai' ? 'border-[#2F6F5E] bg-[#EAF3F0]/40 shadow-xs' : 'hover:border-[#D3E6E0]'
          }`}
        >
          <div className="flex items-center justify-between text-[#52607D]">
            <span className="font-bold text-xs text-[#14213D] flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#2F6F5E]" /> AI Tokens
            </span>
          </div>
          <div className="font-display font-bold text-base text-[#14213D]">
            ₹{aiCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#52607D] font-mono">
            {tokensUsed.toLocaleString()} tokens
          </div>
        </Card>

        {/* AI Video Gen */}
        <Card
          onClick={() => setServiceTab('video')}
          className={`p-3 space-y-1.5 cursor-pointer transition-all ${
            serviceTab === 'video' ? 'border-[#2F6F5E] bg-[#EAF3F0]/40 shadow-xs' : 'hover:border-[#D3E6E0]'
          }`}
        >
          <div className="flex items-center justify-between text-[#52607D]">
            <span className="font-bold text-xs text-[#14213D] flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-[#2F6F5E]" /> AI Video
            </span>
          </div>
          <div className="font-display font-bold text-base text-[#14213D]">
            ₹{videoCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#52607D] font-mono">
            {videoSeconds}s rendered
          </div>
        </Card>

        {/* AI Diagram Images */}
        <Card
          onClick={() => setServiceTab('diagram')}
          className={`p-3 space-y-1.5 cursor-pointer transition-all ${
            serviceTab === 'diagram' ? 'border-[#2F6F5E] bg-[#EAF3F0]/40 shadow-xs' : 'hover:border-[#D3E6E0]'
          }`}
        >
          <div className="flex items-center justify-between text-[#52607D]">
            <span className="font-bold text-xs text-[#14213D] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#2F6F5E]" /> Diagrams
            </span>
          </div>
          <div className="font-display font-bold text-base text-[#14213D]">
            ₹{diagramCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#52607D] font-mono">
            {diagramCount.toLocaleString()} images
          </div>
        </Card>

        {/* WhatsApp Outbound Messages */}
        <Card
          onClick={() => setServiceTab('whatsapp')}
          className={`p-3 space-y-1.5 cursor-pointer transition-all ${
            serviceTab === 'whatsapp' ? 'border-[#2F6F5E] bg-[#EAF3F0]/40 shadow-xs' : 'hover:border-[#D3E6E0]'
          }`}
        >
          <div className="flex items-center justify-between text-[#52607D]">
            <span className="font-bold text-xs text-[#14213D] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#2F6F5E]" /> WhatsApp
            </span>
          </div>
          <div className="font-display font-bold text-base text-[#14213D]">
            ₹{whatsappCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#52607D] font-mono">
            {whatsappSent.toLocaleString()} sent
          </div>
        </Card>
      </div>

      {/* Service Telemetry & Detailed Log Tables */}
      <Card>
        <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8] flex items-center justify-between gap-3">
          <CardTitle className="text-xs font-bold text-[#14213D] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2F6F5E]" /> Execution Logs
          </CardTitle>

          {/* Service Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-[8px] border border-[#E4E1D8]">
            {[
              { id: 'ai', label: 'AI Tokens', icon: Coins },
              { id: 'video', label: 'AI Video', icon: Film },
              { id: 'diagram', label: 'Diagrams', icon: ImageIcon },
              { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setServiceTab(t.id)}
                className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  serviceTab === t.id
                    ? 'bg-[#2F6F5E] text-white shadow-2xs'
                    : 'text-[#52607D] hover:text-[#14213D]'
                }`}
              >
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">School</th>
                  <th className="px-4 py-2.5">Recipient / Subject</th>
                  <th className="px-4 py-2.5">Details</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                {activeLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <EmptyState
                        icon={Activity}
                        title="No execution logs"
                        description="Log entries will appear when services are used."
                      />
                    </td>
                  </tr>
                ) : (
                  activeLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-4 py-2.5 font-bold text-[#14213D]">{log.category}</td>
                      <td className="px-4 py-2.5 text-[#52607D]">{log.school_name}</td>
                      <td className="px-4 py-2.5 font-mono text-[#14213D]">{log.recipient}</td>
                      <td className="px-4 py-2.5 text-[#52607D]">{log.details}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={log.status || 'success'} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rate Customization Modal */}
      {showRateModal && (
        <Modal
          isOpen={showRateModal}
          onClose={() => setShowRateModal(false)}
          title="Custom Unit Pricing Rates (INR ₹)"
        >
          <form onSubmit={handleSaveRates} className="space-y-3 text-xs p-1">
            <div>
              <label className="block text-[#52607D] font-medium mb-1">AI Tokens (₹ per 1,000 tokens)</label>
              <Input
                type="number"
                step="0.01"
                value={tempRates.aiTokenRate}
                onChange={(e) => setTempRates({ ...tempRates, aiTokenRate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-[#52607D] font-medium mb-1">AI Video (₹ per minute)</label>
              <Input
                type="number"
                step="0.1"
                value={tempRates.aiVideoRate}
                onChange={(e) => setTempRates({ ...tempRates, aiVideoRate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-[#52607D] font-medium mb-1">AI Diagram (₹ per image)</label>
              <Input
                type="number"
                step="0.1"
                value={tempRates.aiDiagramRate || 1.00}
                onChange={(e) => setTempRates({ ...tempRates, aiDiagramRate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-[#52607D] font-medium mb-1">WhatsApp (₹ per message)</label>
              <Input
                type="number"
                step="0.05"
                value={tempRates.whatsappRate}
                onChange={(e) => setTempRates({ ...tempRates, whatsappRate: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
              <Button variant="outline" type="button" onClick={() => setShowRateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Rates
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
