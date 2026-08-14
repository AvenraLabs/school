import React, { useState, useEffect } from 'react';
import { schoolAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Select } from '../../components/ui/Input';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Building2,
  MessageSquare,
  Sparkles,
  Video,
  BookOpen,
  DollarSign,
  Bus,
  Bot,
  Wand2,
  CheckCircle2,
  XCircle,
  Sliders,
} from 'lucide-react';

export function SuperAdminSchoolSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);

  const [modules, setModules] = useState({
    transport: true,
    library: true,
    finance: true,
    ai_tutor: true,
    ai_tools: true,
    ai_video: true,
    whatsapp: true,
  });

  const moduleDefinitions = [
    {
      key: 'transport',
      label: 'Transport & Bus GPS Tracking',
      icon: Bus,
      desc: 'Bus routes, vehicles, driver profiles, student allocations, live GPS tracking.',
    },
    {
      key: 'library',
      label: 'Library Management System',
      icon: BookOpen,
      desc: 'Book cataloging, issue/return loans, overdue tracking, fine rules.',
    },
    {
      key: 'finance',
      label: 'Fees & Expense Management',
      icon: DollarSign,
      desc: 'Fee structures, student ledgers, concessions, receipts, expense vouchers.',
    },
    {
      key: 'ai_tutor',
      label: 'Student AI Tutor Chat',
      icon: Bot,
      desc: 'Student RAG AI tutor assistant and textbook chapter context search.',
    },
    {
      key: 'ai_tools',
      label: 'Teacher AI Tools & Quizzes',
      icon: Wand2,
      desc: 'AI Question Paper Generator, Lesson Planner, Homework Quizzes, Kahoot games.',
    },
    {
      key: 'ai_video',
      label: 'Google Veo 3 Video Generation',
      icon: Video,
      desc: '3D Educational video generation using Google Vertex AI Veo 3.',
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp Cloud API Alerts (Paid API)',
      icon: MessageSquare,
      desc: 'Meta WhatsApp absentee alerts and fee receipts dispatches.',
    },
  ];

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const res = await schoolAPI.list();
      const rawList = res.items || (Array.isArray(res) ? res : [res]);
      setSchools(rawList);
      if (rawList.length > 0) {
        const first = rawList[0];
        setSelectedSchoolId(first.id);
        setSelectedSchool(first);
        if (first.enabled_modules) {
          setModules({
            transport: true,
            library: true,
            finance: true,
            ai_tutor: true,
            ai_tools: true,
            ai_video: true,
            whatsapp: true,
            ...first.enabled_modules,
          });
        }
      }
    } catch (err) {
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSchool = (schoolId) => {
    setSelectedSchoolId(schoolId);
    const found = schools.find((s) => String(s.id) === String(schoolId));
    if (found) {
      setSelectedSchool(found);
      setModules({
        transport: true,
        library: true,
        finance: true,
        ai_tutor: true,
        ai_tools: true,
        ai_video: true,
        whatsapp: true,
        ...(found.enabled_modules || {}),
      });
    }
  };

  const handleToggleModule = async (moduleKey, value, label) => {
    if (!selectedSchool) return;
    const updatedModules = { ...modules, [moduleKey]: value };
    setModules(updatedModules);

    // Optimistically update local school item
    const updatedSchools = schools.map((s) =>
      s.id === selectedSchool.id ? { ...s, enabled_modules: updatedModules } : s
    );
    setSchools(updatedSchools);
    setSelectedSchool((prev) => (prev ? { ...prev, enabled_modules: updatedModules } : null));

    try {
      await schoolAPI.updateModules(selectedSchool.id, updatedModules);
      toast.success(`Module "${label}" ${value ? 'enabled' : 'disabled'} for ${selectedSchool.school_name || selectedSchool.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update module "${label}"`);
      setModules((prev) => ({ ...prev, [moduleKey]: !value }));
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#8C97AB] text-xs">
        Loading school system settings...
      </div>
    );
  }

  const schoolName = selectedSchool?.school_name || selectedSchool?.name || 'Selected School';
  const schoolCode = selectedSchool?.code || selectedSchool?.id || '1';
  const schoolBoard = selectedSchool?.board || 'CBSE';
  const schoolStatus = selectedSchool?.status || 'active';

  return (
    <div className="space-y-6">
      {/* Top Toolbar / School Selector */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold font-display border border-[#D3E6E0] shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-[#14213D]">Licensed Modules & Feature Access</h2>
            <p className="text-xs text-[#52607D]">Select an institution to enable or restrict licensed ERP feature modules.</p>
          </div>
        </div>

        {/* School Dropdown */}
        <div className="w-72">
          <Select
            value={selectedSchoolId}
            onChange={(e) => handleSelectSchool(e.target.value)}
            className="w-full text-xs"
          >
            {schools.map((s) => {
              const sName = s.school_name || s.name || `School #${s.id}`;
              const sCode = s.code ? `Code: ${s.code}` : `ID: ${s.id}`;
              return (
                <option key={s.id} value={s.id}>
                  {sName} ({sCode})
                </option>
              );
            })}
          </Select>
        </div>
      </div>

      {/* Feature Modules Checklist */}
      <Card>
        <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <CardTitle className="text-sm font-bold text-[#14213D] flex items-center justify-between">
            <span>Licensed Feature Modules</span>
            <span className="text-xs font-normal text-[#8C97AB] font-mono">
              {Object.values(modules).filter(Boolean).length} of {moduleDefinitions.length} modules active
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-3">
            {moduleDefinitions.map((mod) => {
              const isEnabled = Boolean(modules[mod.key]);
              const Icon = mod.icon;

              return (
                <div
                  key={mod.key}
                  onClick={() => handleToggleModule(mod.key, !isEnabled, mod.label)}
                  className={`p-3 rounded-[8px] border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isEnabled
                      ? 'bg-[#F2F8F6] border-[#D3E6E0] shadow-xs'
                      : 'bg-white border-[#E4E1D8] opacity-75 hover:opacity-100 hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-[6px] ${
                        isEnabled ? 'bg-[#2F6F5E] text-white' : 'bg-[#EDEAE1] text-[#52607D]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-[#14213D] text-xs">{mod.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => handleToggleModule(mod.key, e.target.checked, mod.label)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded text-[#2F6F5E] focus:ring-[#2F6F5E] accent-[#2F6F5E] cursor-pointer"
                    />
                    <span className={`text-[11px] font-mono font-bold ${isEnabled ? 'text-[#2F6F5E]' : 'text-[#8C97AB]'}`}>
                      {isEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SuperAdminSchoolSettings;
