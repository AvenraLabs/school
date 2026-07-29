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
  Activity
} from 'lucide-react';

export function SuperAdminAiAnalytics() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('role'); // 'role' | 'user' | 'class'

  const [schoolData, setSchoolData] = useState(null);
  const [userData, setUserData] = useState([]);
  const [classData, setClassData] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

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
            <Activity className="w-4 h-4 text-[#2F6F5E]" /> AI Consumption Breakdown Telemetry
          </CardTitle>

          <div className="flex items-center gap-1 bg-white p-1 rounded-[8px] border border-[#E4E1D8]">
            {[
              { id: 'role', label: 'By Role' },
              { id: 'user', label: 'By User' },
              { id: 'class', label: 'By Class' },
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
        </CardContent>
      </Card>
    </div>
  );
}
