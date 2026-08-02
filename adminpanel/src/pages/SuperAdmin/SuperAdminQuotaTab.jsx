import React, { useState, useEffect } from 'react';
import { tokenPoliciesAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  Coins,
  MessageSquare,
  RotateCcw,
  Plus,
  GraduationCap,
  UserCog,
  Building2,
} from 'lucide-react';

export function SuperAdminQuotaTab({ policies = [], schools = [], onSaved }) {
  const toast = useToast();
  const [mode, setMode] = useState('replace'); // 'replace' | 'add'
  const [selectedSchoolId, setSelectedSchoolId] = useState(''); // '' = all schools

  const currentStudentPol =
    policies.find((p) => p.role === 'student' && String(p.school_id || '') === String(selectedSchoolId || '')) ||
    policies.find((p) => p.role === 'student' && !p.school_id);

  const currentTeacherPol =
    policies.find((p) => p.role === 'teacher' && String(p.school_id || '') === String(selectedSchoolId || '')) ||
    policies.find((p) => p.role === 'teacher' && !p.school_id);

  const [studentVal, setStudentVal] = useState(currentStudentPol?.annual_tokens ?? 500000);
  const [teacherVal, setTeacherVal] = useState(currentTeacherPol?.annual_tokens ?? 2000000);
  const [teacherVideoVal, setTeacherVideoVal] = useState(currentTeacherPol?.annual_video_seconds ?? 2000);
  const [teacherImageVal, setTeacherImageVal] = useState(currentTeacherPol?.annual_image_generations ?? 500);

  const [schoolWhatsAppVal, setSchoolWhatsAppVal] = useState(10000);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);

  useEffect(() => {
    if (schools.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(schools[0].id);
      setSchoolWhatsAppVal(schools[0].whatsapp_annual_limit || 10000);
    }
  }, [schools]);

  useEffect(() => {
    if (selectedSchoolId) {
      const found = schools.find((s) => String(s.id) === String(selectedSchoolId));
      if (found) {
        setSchoolWhatsAppVal(found.whatsapp_annual_limit || 10000);
      }
    }
  }, [selectedSchoolId, schools]);

  useEffect(() => {
    if (mode === 'replace') {
      setStudentVal(currentStudentPol?.annual_tokens ?? 500000);
      setTeacherVal(currentTeacherPol?.annual_tokens ?? 2000000);
      setTeacherVideoVal(currentTeacherPol?.annual_video_seconds ?? 2000);
      setTeacherImageVal(currentTeacherPol?.annual_image_generations ?? 500);
    } else {
      setStudentVal(0);
      setTeacherVal(0);
      setTeacherVideoVal(0);
      setTeacherImageVal(0);
    }
  }, [mode, selectedSchoolId, policies]);

  const handleSaveQuotas = async (e) => {
    e.preventDefault();
    setSavingGlobal(true);
    try {
      await tokenPoliciesAPI.updateBoth({
        studentAnnual: Number(studentVal),
        teacherAnnual: Number(teacherVal),
        studentVideoSeconds: 0,
        teacherVideoSeconds: Number(teacherVideoVal),
        studentImageGenerations: 0,
        teacherImageGenerations: Number(teacherImageVal),
        schoolId: selectedSchoolId ? Number(selectedSchoolId) : null,
        mode,
      });
      toast.success(
        mode === 'add' ? 'Quotas topped-up successfully!' : 'Quotas updated successfully!'
      );
      if (onSaved) onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quotas');
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleSaveWhatsAppQuota = async (e) => {
    e.preventDefault();
    if (!selectedSchoolId) {
      toast.error('Select a target school');
      return;
    }
    setSavingWhatsApp(true);
    try {
      await tokenPoliciesAPI.updateWhatsAppQuota(
        selectedSchoolId,
        Number(schoolWhatsAppVal),
        mode
      );
      toast.success('WhatsApp quota updated!');
      if (onSaved) onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update WhatsApp quota');
    } finally {
      setSavingWhatsApp(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Target Selector & Mode Switcher */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Building2 className="w-4 h-4 text-[#2F6F5E]" />
          <span className="text-xs font-bold text-[#14213D]">Target School:</span>
          <select
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value)}
            className="px-2.5 py-1 text-xs border border-[#E4E1D8] rounded-[6px] bg-[#FAFAF8] text-[#14213D] font-semibold outline-none"
          >
            <option value="">All Schools (Global Baseline)</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.school_name || `School #${s.id}`} ({s.code || `SCH-${s.id}`})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-[#FAFAF8] p-1 rounded-[8px] border border-[#E4E1D8]">
          <button
            type="button"
            onClick={() => setMode('replace')}
            className={`px-3 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              mode === 'replace'
                ? 'bg-white text-[#2F6F5E] border border-[#E4E1D8] shadow-2xs'
                : 'text-[#52607D]'
            }`}
          >
            <RotateCcw className="w-3 h-3" /> Set Exact
          </button>
          <button
            type="button"
            onClick={() => setMode('add')}
            className={`px-3 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              mode === 'add'
                ? 'bg-white text-[#2F6F5E] border border-[#E4E1D8] shadow-2xs'
                : 'text-[#52607D]'
            }`}
          >
            <Plus className="w-3 h-3 text-[#2F6F5E]" /> Top-Up
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Quotas */}
        <Card>
          <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
            <CardTitle className="text-xs font-bold text-[#14213D] flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#2F6F5E]" /> AI Quotas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-xs">
            <form onSubmit={handleSaveQuotas} className="space-y-4">
              {/* Student */}
              <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] space-y-2">
                <div className="flex items-center gap-2 text-[#14213D] font-bold">
                  <GraduationCap className="w-4 h-4 text-[#2F6F5E]" /> Student Quotas
                </div>
                <div>
                  <label className="block text-[#52607D] font-medium mb-1">
                    {mode === 'replace' ? 'Annual Tokens' : 'Top-Up Tokens (+)'}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={studentVal}
                    onChange={(e) => setStudentVal(e.target.value)}
                  />
                </div>
              </div>

              {/* Teacher */}
              <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] space-y-3">
                <div className="flex items-center gap-2 text-[#14213D] font-bold">
                  <UserCog className="w-4 h-4 text-[#2F6F5E]" /> Teacher Quotas
                </div>

                <div>
                  <label className="block text-[#52607D] font-medium mb-1">
                    {mode === 'replace' ? 'Annual Tokens' : 'Top-Up Tokens (+)'}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={teacherVal}
                    onChange={(e) => setTeacherVal(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[#52607D] font-medium mb-1">
                    {mode === 'replace' ? 'Video Seconds' : 'Top-Up Video Seconds (+)'}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={teacherVideoVal}
                    onChange={(e) => setTeacherVideoVal(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[#52607D] font-medium mb-1">
                    {mode === 'replace' ? 'Diagram Images' : 'Top-Up Diagrams (+)'}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={teacherImageVal}
                    onChange={(e) => setTeacherImageVal(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[#EDEAE1]">
                <Button variant="primary" type="submit" loading={savingGlobal}>
                  Save Quotas
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* WhatsApp Quotas */}
        <Card>
          <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
            <CardTitle className="text-xs font-bold text-[#14213D] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2F6F5E]" /> WhatsApp Quota
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-xs">
            <form onSubmit={handleSaveWhatsAppQuota} className="space-y-4">
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">
                  {mode === 'replace' ? 'WhatsApp Message Limit' : 'Top-Up Messages (+)'}
                </label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={schoolWhatsAppVal}
                  onChange={(e) => setSchoolWhatsAppVal(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-[#EDEAE1]">
                <Button variant="primary" type="submit" loading={savingWhatsApp} disabled={!selectedSchoolId}>
                  Save WhatsApp Quota
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
