import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../api';
import { StatsCard } from '../../components/common/StatsCard';
import { useToast } from '../../context/ToastContext';
import { BarChart3, Cpu, Users, Layers } from 'lucide-react';

export function AIAnalytics() {
  const [schoolData, setSchoolData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadUsers(); }, [roleFilter]);

  const loadData = async () => {
    try {
      const [school, users, classes] = await Promise.all([
        analyticsAPI.getAISchoolData(),
        analyticsAPI.getAIUserData(),
        analyticsAPI.getAIClassData(),
      ]);
      setSchoolData(Array.isArray(school) ? school : []);
      setUserData(Array.isArray(users) ? users : []);
      setClassData(Array.isArray(classes) ? classes : []);
    } catch (e) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await analyticsAPI.getAIUserData(roleFilter || undefined);
      setUserData(Array.isArray(users) ? users : []);
    } catch (e) { /* ignore */ }
  };

  const totalCalls = schoolData.reduce((s, r) => s + (r.total_calls || 0), 0);
  const totalTokens = schoolData.reduce((s, r) => s + (r.total_tokens || 0), 0);

  const tabs = [
    { key: 'overview', label: 'By Role' },
    { key: 'users', label: 'By User' },
    { key: 'classes', label: 'By Class' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Analytics</h1>
          <p className="page-subtitle">Track AI usage across the platform</p>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid mb-8">
        <StatsCard icon={<Cpu className="w-6 h-6" />} label="Total AI Calls" value={loading ? '...' : totalCalls.toLocaleString()} color="indigo" />
        <StatsCard icon={<BarChart3 className="w-6 h-6" />} label="Total Tokens Used" value={loading ? '...' : totalTokens.toLocaleString()} color="violet" />
        <StatsCard icon={<Users className="w-6 h-6" />} label="Active Users" value={loading ? '...' : userData.length} color="emerald" />
      </div>

      {/* Tabs */}
      <div className="tabs mb-6">
        {tabs.map((t) => (
          <button key={t.key} className={`tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading analytics...</div>
        ) : activeTab === 'overview' ? (
          <table className="data-table">
            <thead><tr><th>Role</th><th>Total Calls</th><th>Total Tokens</th></tr></thead>
            <tbody>
              {schoolData.length === 0 ? (
                <tr><td colSpan={3} className="text-center text-slate-400 py-8">No data available</td></tr>
              ) : schoolData.map((r, i) => (
                <tr key={i}>
                  <td className="capitalize font-medium">{r.role}</td>
                  <td>{(r.total_calls || 0).toLocaleString()}</td>
                  <td>{(r.total_tokens || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : activeTab === 'users' ? (
          <>
            <div className="p-4 border-b border-slate-100">
              <select className="select-field w-48" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <table className="data-table">
              <thead><tr><th>User ID</th><th>Role</th><th>Total Calls</th><th>Total Tokens</th></tr></thead>
              <tbody>
                {userData.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-slate-400 py-8">No data</td></tr>
                ) : userData.map((u, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs">{u.user_id}</td>
                    <td className="capitalize">{u.role}</td>
                    <td>{(u.total_calls || 0).toLocaleString()}</td>
                    <td>{(u.total_tokens || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <table className="data-table">
            <thead><tr><th>Class</th><th>Total Calls</th><th>Total Tokens</th></tr></thead>
            <tbody>
              {classData.length === 0 ? (
                <tr><td colSpan={3} className="text-center text-slate-400 py-8">No data</td></tr>
              ) : classData.map((c, i) => (
                <tr key={i}>
                  <td className="font-medium">{c.class_name}</td>
                  <td>{(c.total_calls || 0).toLocaleString()}</td>
                  <td>{(c.total_tokens || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
