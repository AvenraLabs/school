import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { schoolAPI, analyticsAPI, tokenPoliciesAPI } from '../../api';
import { StatsCard } from '../../components/common/StatsCard';
import { School, BarChart3, Coins, Users, ArrowRight } from 'lucide-react';

export function SuperAdminDashboard() {
  const [stats, setStats] = useState({ schools: 0, aiCalls: 0, totalTokens: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [schoolsRes, aiRes] = await Promise.allSettled([
        schoolAPI.list(100, 0),
        analyticsAPI.getAISchoolData(),
      ]);

      const schoolCount = schoolsRes.status === 'fulfilled' ? (schoolsRes.value?.count || schoolsRes.value?.rows?.length || 0) : 0;
      const aiData = aiRes.status === 'fulfilled' ? (Array.isArray(aiRes.value) ? aiRes.value : []) : [];
      const totalCalls = aiData.reduce((sum, r) => sum + (r.total_calls || 0), 0);
      const totalTokens = aiData.reduce((sum, r) => sum + (r.total_tokens || 0), 0);

      setStats({ schools: schoolCount, aiCalls: totalCalls, totalTokens });
    } catch (e) {
      console.error('Failed to load stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { to: '/super-admin/schools', icon: <School className="w-5 h-5" />, label: 'Manage Schools', desc: 'Create & manage school admin accounts' },
    { to: '/super-admin/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'AI Analytics', desc: 'View AI usage across schools' },
    { to: '/super-admin/tokens', icon: <Coins className="w-5 h-5" />, label: 'Token Policies', desc: 'Set monthly token limits' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Super Admin Dashboard</h1>
          <p className="page-subtitle">System overview and quick actions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-8">
        <StatsCard
          icon={<School className="w-6 h-6" />}
          label="Total Schools"
          value={loading ? '...' : stats.schools}
          color="indigo"
        />
        <StatsCard
          icon={<BarChart3 className="w-6 h-6" />}
          label="Total AI Calls"
          value={loading ? '...' : stats.aiCalls.toLocaleString()}
          color="violet"
        />
        <StatsCard
          icon={<Coins className="w-6 h-6" />}
          label="Total Tokens Used"
          value={loading ? '...' : stats.totalTokens.toLocaleString()}
          color="amber"
        />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to} className="card-hover group flex items-center gap-5" style={{ padding: '20px 24px' }}>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-[15px] leading-snug">{action.label}</h3>
              <p className="text-sm text-slate-400 mt-1 leading-snug">{action.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-0.5 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
