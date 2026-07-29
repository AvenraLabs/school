import React, { useState, useEffect } from 'react';
import { tokenPoliciesAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  Coins,
  Video,
  MessageSquare,
  RotateCcw,
  Plus,
  GraduationCap,
  UserCog,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function SuperAdminQuotaTab({ policies = [], schools = [], onSaved }) {
  const toast = useToast();
  const studentPol = policies.find((p) => p.role === 'student');
  const teacherPol = policies.find((p) => p.role === 'teacher');

  const [mode, setMode] = useState('replace'); // 'replace' | 'add'
  const [studentVal, setStudentVal] = useState(studentPol?.annual_tokens ?? 500000);
  const [teacherVal, setTeacherVal] = useState(teacherPol?.annual_tokens ?? 2000000);
  const [teacherVideoVal, setTeacherVideoVal] = useState(teacherPol?.annual_video_seconds ?? 2000);

  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [schoolWhatsAppVal, setSchoolWhatsAppVal] = useState(10000);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);

  useEffect(() => {
    if (schools.length > 0) {
      const s = schools[0];
      setSelectedSchoolId(s.id);
      setSchoolWhatsAppVal(s.whatsapp_annual_limit || 10000);
    }
  }, [schools]);

  useEffect(() => {
    if (mode === 'replace') {
      setStudentVal(studentPol?.annual_tokens ?? 500000);
      setTeacherVal(teacherPol?.annual_tokens ?? 2000000);
      setTeacherVideoVal(teacherPol?.annual_video_seconds ?? 2000);
    } else {
      setStudentVal(0);
      setTeacherVal(0);
      setTeacherVideoVal(0);
    }
  }, [mode, studentPol, teacherPol]);

  const handleSaveGlobalQuotas = async (e) => {
    e.preventDefault();
    setSavingGlobal(true);
    try {
      await tokenPoliciesAPI.updateBoth({
        studentAnnual: Number(studentVal),
        teacherAnnual: Number(teacherVal),
        studentVideoSeconds: 0,
        teacherVideoSeconds: Number(teacherVideoVal),
        mode,
      });
      toast.success(
        mode === 'add'
          ? 'Quotas topped-up across all users successfully!'
          : 'Global AI Text Token & Video limits updated!'
      );
      if (onSaved) onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update global quotas');
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleSaveWhatsAppQuota = async (e) => {
    e.preventDefault();
    if (!selectedSchoolId) {
      toast.error('Please select a target school');
      return;
    }
    setSavingWhatsApp(true);
    try {
      await tokenPoliciesAPI.updateWhatsAppQuota(
        selectedSchoolId,
        Number(schoolWhatsAppVal),
        mode
      );
      toast.success(`WhatsApp message quota updated for selected institution!`);
      if (onSaved) onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update WhatsApp quota');
    } finally {
      setSavingWhatsApp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Banner */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#EDEAE1] pb-3">
          <div>
            <h3 className="font-display font-bold text-sm text-[#14213D] flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#2F6F5E]" /> Platform AI & WhatsApp Quota Policy Engine
            </h3>
            <p className="text-[11px] text-[#52607D]">
              Configure annual token allocations for student AI tutors, teacher lesson generators, video seconds, and WhatsApp notifications.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#FAFAF8] p-1 rounded-[8px] border border-[#E4E1D8]">
            <button
              type="button"
              onClick={() => setMode('replace')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'replace'
                  ? 'bg-white text-[#2F6F5E] shadow-2xs border border-[#E4E1D8]'
                  : 'text-[#52607D] hover:text-[#14213D]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Replace / Set Exact
            </button>
            <button
              type="button"
              onClick={() => setMode('add')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'add'
                  ? 'bg-white text-[#2F6F5E] shadow-2xs border border-[#E4E1D8]'
                  : 'text-[#52607D] hover:text-[#14213D]'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-[#2F6F5E]" /> Top-Up / Add Extra
            </button>
          </div>
        </div>

        <div className={`p-3 rounded-[8px] border text-xs leading-relaxed ${
          mode === 'replace'
            ? 'bg-[#EAF3F0] border-[#D3E6E0] text-[#14213D]'
            : 'bg-[#FDF8EC] border-[#F6E7C1] text-[#14213D]'
        }`}>
          {mode === 'replace' ? (
            <span>
              <strong>Replace Mode:</strong> All active student and teacher user balances will be updated to match these exact numbers.
            </span>
          ) : (
            <span>
              <strong>Top-Up Mode:</strong> The numbers entered will be <u>added on top</u> of every user's current remaining balance (e.g. typing 500 adds 500s video to every teacher).
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Global AI Text & Video Policies */}
        <Card>
          <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
            <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#2F6F5E]" /> Global AI Text Tokens & Video Seconds
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <form onSubmit={handleSaveGlobalQuotas} className="space-y-4">
              {/* Student Section */}
              <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] space-y-2">
                <div className="flex items-center gap-2 text-[#14213D] font-bold">
                  <GraduationCap className="w-4 h-4 text-[#2F6F5E]" /> Student AI Quota
                </div>
                <div>
                  <label className="block text-[#52607D] font-medium mb-1">
                    {mode === 'replace' ? 'Annual AI Text Tokens' : 'Add AI Tokens (+ Amount)'}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={studentVal}
                    onChange={(e) => setStudentVal(e.target.value)}
                  />
                  <span className="text-[10px] text-[#8C97AB] mt-1 block font-mono">
                    Current policy limit: {(studentPol?.annual_tokens ?? 500000).toLocaleString()} tokens
                  </span>
                </div>
              </div>

              {/* Teacher Section */}
              <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] space-y-3">
                <div className="flex items-center gap-2 text-[#14213D] font-bold">
                  <UserCog className="w-4 h-4 text-[#2F6F5E]" /> Teacher AI & Video Quota
                </div>

                <div>
                  <label className="block text-[#52607D] font-medium mb-1">
                    {mode === 'replace' ? 'Annual AI Text Tokens' : 'Add AI Tokens (+ Amount)'}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={teacherVal}
                    onChange={(e) => setTeacherVal(e.target.value)}
                  />
                  <span className="text-[10px] text-[#8C97AB] mt-1 block font-mono">
                    Current policy limit: {(teacherPol?.annual_tokens ?? 2000000).toLocaleString()} tokens
                  </span>
                </div>

                <div>
                  <label className="block text-[#52607D] font-medium mb-1">
                    {mode === 'replace' ? 'Annual AI Video Generation (Seconds)' : 'Add Video Seconds (+ Amount)'}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={teacherVideoVal}
                    onChange={(e) => setTeacherVideoVal(e.target.value)}
                  />
                  <span className="text-[10px] text-[#8C97AB] mt-1 block font-mono">
                    Current video limit: {(teacherPol?.annual_video_seconds ?? 2000).toLocaleString()} seconds
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[#EDEAE1]">
                <Button variant="primary" type="submit" loading={savingGlobal}>
                  Save Global AI Quotas
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Institution WhatsApp Quota Policy */}
        <Card>
          <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
            <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2F6F5E]" /> School WhatsApp Outbound Message Quota
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <form onSubmit={handleSaveWhatsAppQuota} className="space-y-4">
              <div className="p-3 bg-[#EAF3F0] rounded-[8px] border border-[#D3E6E0] space-y-1">
                <span className="text-[10px] text-[#2F6F5E] font-mono font-bold uppercase block">ACTIVE SCHOOL SYSTEM</span>
                <p className="font-bold text-[#14213D] text-sm">
                  {schools[0]?.name || 'Main Campus School'} ({schools[0]?.code || 'SCH-01'})
                </p>
                <p className="text-[11px] text-[#52607D] font-mono">
                  Messages sent this year: <strong>{schools[0]?.whatsapp_sent_count || 0}</strong> messages
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#14213D] mb-1">
                  {mode === 'replace' ? 'Annual WhatsApp Limit (Messages)' : 'Add WhatsApp Messages (+ Amount)'}
                </label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={schoolWhatsAppVal}
                  onChange={(e) => setSchoolWhatsAppVal(e.target.value)}
                />
                <span className="text-[10px] text-[#8C97AB] mt-1 block">
                  Once reached, outbound announcements and automated bus/attendance alerts pause until topped up.
                </span>
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
