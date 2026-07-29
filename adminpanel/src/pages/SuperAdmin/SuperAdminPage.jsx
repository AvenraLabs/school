import React, { useState, useEffect } from 'react';
import { schoolAPI, tokenPoliciesAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';

// Modular Tabs
import { SuperAdminSchoolsTab } from './SuperAdminSchoolsTab';
import { SuperAdminQuotaTab } from './SuperAdminQuotaTab';
import { SuperAdminAnalyticsTab } from './SuperAdminAnalyticsTab';
import { FeedbackManager } from './FeedbackManager';
import { BulkSeeder } from '../SchoolAdmin/BulkSeeder';

// Icons
import {
  School,
  Coins,
  BarChart3,
  MessageSquare,
  Database,
  Building2,
  RefreshCw
} from 'lucide-react';

export function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState('schools');
  const [schools, setSchools] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schoolsRes, policiesRes] = await Promise.all([
        schoolAPI.list(),
        tokenPoliciesAPI.list(),
      ]);

      const schoolsData = schoolsRes.items || (Array.isArray(schoolsRes) ? schoolsRes : [schoolsRes]);
      setSchools(Array.isArray(schoolsData) ? schoolsData : []);

      const policiesData = policiesRes.items || (Array.isArray(policiesRes) ? policiesRes : []);
      setPolicies(Array.isArray(policiesData) ? policiesData : []);
    } catch (err) {
      console.error('Failed to load SuperAdmin details:', err);
      toast.error('Failed to load SuperAdmin platform details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14213D]">SchooliQ Platform Management Console</span>
            <span className="text-[#8C97AB]">|</span>
            <span className="text-[#52607D]">Institutional System Registry</span>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#2F6F5E] hover:text-[#14213D] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-1 border-b border-[#E4E1D8] overflow-x-auto pb-px">
        {[
          { id: 'schools', label: 'Institutional Registry', icon: School },
          { id: 'quotas', label: 'AI & WhatsApp Quotas', icon: Coins },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-[8px] transition-all cursor-pointer border-t border-x outline-none ${
                isActive
                  ? 'bg-white border-[#E4E1D8] border-t-[3px] border-t-[#2F6F5E] text-[#2F6F5E] -mb-px shadow-2xs'
                  : 'bg-transparent border-transparent text-[#52607D] hover:text-[#14213D] hover:bg-[#FAFAF8]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2F6F5E]' : 'text-[#8C97AB]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'schools' && (
        <SuperAdminSchoolsTab schools={schools} loading={loading} onRefresh={loadData} />
      )}

      {activeTab === 'quotas' && (
        <SuperAdminQuotaTab policies={policies} schools={schools} onSaved={loadData} />
      )}
    </div>
  );
}
