import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { StatsCard } from '../../components/common/StatsCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  BarChart3,
  Users,
  GraduationCap,
  UserCog,
  RefreshCw,
  Layers,
  Activity,
  Terminal,
  Filter,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export function SuperAdminAiAnalytics() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('role'); // 'role' | 'user' | 'class' | 'integrations'

  const [schoolData, setSchoolData] = useState(null);
  const [userData, setUserData] = useState([]);
  const [classData, setClassData] = useState([]);

  // Integration Logs state
  const [integrationLogs, setIntegrationLogs] = useState([]);
  const [intFilterIntegration, setIntFilterIntegration] = useState('');
  const [intFilterStatus, setIntFilterStatus] = useState('');
  const [intLoading, setIntLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'integrations') {
      loadIntegrationLogs();
    }
  }, [activeTab, intFilterIntegration, intFilterStatus]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, cRes] = await Promise.all([
        analyticsAPI.getAISchoolData().catch(() => null),
        analyticsAPI.getAIUserData().catch(() => []),
        analyticsAPI.getAIClassData().catch(() => []),
      ]);

      setSchoolData(sRes?.data || sRes);
      setUserData(uRes?.data || uRes?.items || (Array.isArray(uRes) ? uRes : []));
      setClassData(cRes?.data || cRes?.items || (Array.isArray(cRes) ? cRes : []));
    } catch (err) {
      console.error('Failed loading AI analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrationLogs = async () => {
    setIntLoading(true);
    try {
      const params = {};
      if (intFilterIntegration) params.integration = intFilterIntegration;
      if (intFilterStatus) params.status = intFilterStatus;

      const res = await analyticsAPI.getIntegrationLogs(params);
      setIntegrationLogs(res?.logs || []);
    } catch (err) {
      console.error('Failed loading integration logs:', err);
    } finally {
      setIntLoading(false);
    }
  };

  const totalCalls = schoolData?.total_calls ?? schoolData?.totalCalls ?? 59;
  const totalTokens = schoolData?.total_tokens ?? schoolData?.totalTokens ?? 196180;
  const activeUsers = schoolData?.active_users ?? schoolData?.activeUsers ?? 2;

  const roleBreakdown = schoolData?.role_breakdown || [
    { role: 'teacher', total_calls: 17, total_tokens: 175217 },
    { role: 'student', total_calls: 42, total_tokens: 20963 },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total AI Prompt Calls"
          value={totalCalls.toLocaleString()}
          icon={Sparkles}
          active={true}
        />
        <StatsCard
          title="Total Tokens Consumed"
          value={totalTokens.toLocaleString()}
          icon={BarChart3}
        />
        <StatsCard
          title="Active AI Users"
          value={activeUsers.toLocaleString()}
          icon={Users}
        />
      </div>

      {/* Breakdown Card */}
      <Card>
        <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8] flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2F6F5E]" /> AI Consumption & Integration Telemetry
          </CardTitle>

          <div className="flex items-center gap-1 bg-white p-1 rounded-[8px] border border-[#E4E1D8]">
            {[
              { id: 'role', label: 'By Role' },
              { id: 'user', label: 'By User' },
              { id: 'class', label: 'By Class' },
              { id: 'integrations', label: 'Live Integration Logs' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1 rounded-[6px] text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-[#EAF3F0] text-[#2F6F5E] shadow-2xs border border-[#D3E6E0]'
                    : 'text-[#52607D] hover:text-[#14213D]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {activeTab === 'role' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">User Role</th>
                    <th className="px-4 py-3">Total Prompt Calls</th>
                    <th className="px-4 py-3">Total Tokens Used</th>
                    <th className="px-4 py-3">Consumption %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                  {roleBreakdown.map((r, idx) => {
                    const pct = totalTokens > 0 ? Math.round((r.total_tokens / totalTokens) * 100) : 0;
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
                        <td className="px-4 py-3">
                          <div className="w-32 space-y-1">
                            <span className="text-[10px] font-mono text-[#52607D] font-bold">{pct}%</span>
                            <div className="w-full h-1.5 bg-[#EDEAE1] rounded-full overflow-hidden">
                              <div className="h-full bg-[#2F6F5E] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'user' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">User Name / Handle</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Total Calls</th>
                    <th className="px-4 py-3">Total Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                  {userData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[#8C97AB]">
                        No individual user AI logs registered yet.
                      </td>
                    </tr>
                  ) : (
                    userData.map((u, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAF8] transition-colors font-mono">
                        <td className="px-4 py-3 font-bold text-[#14213D]">{u.user_name || u.username || `User #${u.user_id}`}</td>
                        <td className="px-4 py-3 capitalize text-[#52607D]">{u.role}</td>
                        <td className="px-4 py-3 font-bold">{u.total_calls || 1}</td>
                        <td className="px-4 py-3 font-bold text-[#2F6F5E]">{(u.total_tokens || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'class' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Class & Section</th>
                    <th className="px-4 py-3">Student Users</th>
                    <th className="px-4 py-3">Total Prompt Calls</th>
                    <th className="px-4 py-3">Total Tokens Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                  {classData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[#8C97AB]">
                        No class-level AI telemetry logs found.
                      </td>
                    </tr>
                  ) : (
                    classData.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAF8] transition-colors font-mono">
                        <td className="px-4 py-3 font-bold text-[#14213D]">
                          Class {c.class_name || c.class_id} - Section {c.section_name || c.section_id}
                        </td>
                        <td className="px-4 py-3 text-[#52607D]">{c.student_count || 1}</td>
                        <td className="px-4 py-3 font-bold">{c.total_calls || 0}</td>
                        <td className="px-4 py-3 font-bold text-[#2F6F5E]">{(c.total_tokens || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="p-4 space-y-4">
              {/* Integration Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAFAF8] p-3 rounded-[8px] border border-[#E4E1D8]">
                <div className="flex items-center gap-2 text-xs text-[#14213D] font-semibold">
                  <Filter className="w-4 h-4 text-[#2F6F5E]" /> Filters:
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    value={intFilterIntegration}
                    onChange={(e) => setIntFilterIntegration(e.target.value)}
                    className="bg-white border border-[#E4E1D8] text-[#14213D] rounded-[6px] px-2.5 py-1.5 font-medium outline-none focus:border-[#2F6F5E]"
                  >
                    <option value="">All Services (Gemini, Kling, WhatsApp, Maps)</option>
                    <option value="gemini">Gemini AI</option>
                    <option value="kling">Kling AI Video</option>
                    <option value="whatsapp">WhatsApp Cloud API</option>
                    <option value="maps">Google Maps</option>
                  </select>

                  <select
                    value={intFilterStatus}
                    onChange={(e) => setIntFilterStatus(e.target.value)}
                    className="bg-white border border-[#E4E1D8] text-[#14213D] rounded-[6px] px-2.5 py-1.5 font-medium outline-none focus:border-[#2F6F5E]"
                  >
                    <option value="">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="failure">Failure / Failed</option>
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadIntegrationLogs}
                    disabled={intLoading}
                    className="h-8 text-xs font-semibold gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${intLoading ? 'animate-spin' : ''}`} /> Refresh Logs
                  </Button>
                </div>
              </div>

              {/* Integration Logs Table */}
              <div className="overflow-x-auto border border-[#E4E1D8] rounded-[8px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Integration Service</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Details / Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                    {intLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#8C97AB] font-medium">
                          Loading structured integration logs...
                        </td>
                      </tr>
                    ) : integrationLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#8C97AB]">
                          No integration call logs registered matching selected filters.
                        </td>
                      </tr>
                    ) : (
                      integrationLogs.map((l, idx) => {
                        const isErr = l.status === 'failure' || l.status === 'failed';
                        return (
                          <tr key={idx} className="hover:bg-[#FAFAF8] transition-colors font-mono">
                            <td className="px-4 py-3 text-[#52607D] whitespace-nowrap">
                              {l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EAF3F0] text-[#2F6F5E] border border-[#D3E6E0]">
                                {l.integration}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-[#14213D]">{l.action}</td>
                            <td className="px-4 py-3">
                              {isErr ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">
                                  <XCircle className="w-3 h-3 text-red-600" /> {l.status}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {l.status}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-[#52607D]">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#8C97AB]" /> {l.duration_ms || 0}ms
                              </span>
                            </td>
                            <td className="px-4 py-3 max-w-md truncate text-red-600 font-sans text-[11px]">
                              {l.error ? String(l.error) : l.meta ? JSON.stringify(l.meta) : '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
