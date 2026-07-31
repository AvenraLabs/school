import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { teachersAPI, substitutionAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ChevronLeft,
  UserX,
  Calendar,
  Check,
  Save,
  Search,
  AlertCircle,
  Clock,
  BookOpen,
  Award,
  UserCheck,
  Zap,
} from 'lucide-react';
import { formatDate } from '../../utils/date';

export function SubstituteTeachers({
  selectedClass: propSelectedClass,
  setSelectedClass: propSetSelectedClass,
  selectedSection: propSelectedSection,
  setSelectedSection: propSetSelectedSection,
  isEmbedded = false
} = {}) {
  const navigate = useNavigate();
  const toast = useToast();
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  const [periods, setPeriods] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState('');

  const [candidatesMap, setCandidatesMap] = useState({});
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const [selectedSubstitutes, setSelectedSubstitutes] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const res = await teachersAPI.list();
      const items = res.items || res.data || [];
      setTeachers(items);
    } catch {
      toast.error('Failed to load teachers');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const filteredTeachers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return teachers;
    return teachers.filter((t) => {
      const name = (t.user?.name || t.User?.name || '').toLowerCase();
      const empId = (t.employee_id || '').toLowerCase();
      return name.includes(q) || empId.includes(q);
    });
  }, [teachers, searchQuery]);

  const handleSelectTeacher = async (teacherId) => {
    setSelectedTeacherId(teacherId);
    setSelectedSubstitutes({});
    setCandidatesMap({});
    setPeriods([]);

    try {
      setLoadingPeriods(true);
      const res = await substitutionAPI.getTeacherPeriods(teacherId, todayStr);
      const data = res.data || {};
      const periodItems = data.periods || [];
      setPeriods(periodItems);
      setDayOfWeek(data.day_of_week || '');

      const initialSubs = {};
      periodItems.forEach((p) => {
        if (p.current_substitute?.teacher_id) {
          initialSubs[p.timetable_id] = p.current_substitute.teacher_id;
        }
        // Periods with no existing substitute default to null (explicitly no-sub)
        // — admin must actively pick a teacher to assign one
      });
      setSelectedSubstitutes(initialSubs);

      if (periodItems.length > 0) {
        loadCandidatesForPeriods(periodItems);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load teacher schedule');
    } finally {
      setLoadingPeriods(false);
    }
  };

  const loadCandidatesForPeriods = async (periodItems) => {
    setLoadingCandidates(true);
    const resultMap = {};
    await Promise.all(
      periodItems.map(async (p) => {
        try {
          const res = await substitutionAPI.getAvailableSubstitutes(p.timetable_id, todayStr);
          resultMap[p.timetable_id] = res.data?.candidates || [];
        } catch {
          resultMap[p.timetable_id] = [];
        }
      })
    );
    setCandidatesMap(resultMap);
    setLoadingCandidates(false);
  };

  const handleAssignSubstitute = (timetableId, substituteTeacherId) => {
    setSelectedSubstitutes((prev) => {
      // substituteTeacherId === null means explicitly no substitution for this period
      if (substituteTeacherId === null) {
        const next = { ...prev };
        delete next[timetableId];
        return next;
      }
      // Toggle off if already selected
      if (prev[timetableId] === substituteTeacherId) {
        const next = { ...prev };
        delete next[timetableId];
        return next;
      }
      return { ...prev, [timetableId]: substituteTeacherId };
    });
  };

  const handleAutoAssignAll = () => {
    const autoSubs = {};
    periods.forEach((p) => {
      const candidates = candidatesMap[p.timetable_id] || [];
      if (candidates.length > 0) {
        autoSubs[p.timetable_id] = candidates[0].teacher_id;
      }
    });
    setSelectedSubstitutes(autoSubs);
    toast.success('Auto-assigned top ranked substitutes for all free periods');
  };

  const handleSaveSubstitutions = async () => {
    if (periods.length === 0) return;

    // Only send periods where a substitute was actually selected (not null / no-sub)
    const payload = Object.entries(selectedSubstitutes)
      .filter(([, substitute_teacher_id]) => substitute_teacher_id !== null && substitute_teacher_id !== undefined)
      .map(([timetable_id, substitute_teacher_id]) => ({
        timetable_id: Number(timetable_id),
        substitute_teacher_id: Number(substitute_teacher_id),
      }));

    if (payload.length === 0) {
      toast.error('Select at least one substitute teacher for the periods that need coverage.');
      return;
    }

    try {
      setSaving(true);
      await substitutionAPI.saveSubstitutions(todayStr, payload);
      toast.success('Substitutions saved successfully!');
      navigate('/admin/timetable-hub?tab=schedule');
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('Conflict: One of the selected teachers was assigned elsewhere.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to save substitutions.');
      }
    } finally {
      setSaving(false);
    }
  };

  const selectedTeacherObj = teachers.find((t) => String(t.id) === String(selectedTeacherId));

  return (
    <div className="space-y-4 text-xs">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              icon={ChevronLeft}
              onClick={() => navigate('/admin/timetable-hub?tab=schedule')}
              title="Back to Timetables"
            />
            <span className="font-bold text-[#14213D]">Substitute Desk ({formatDate(todayStr)})</span>
          </div>

          <div className="flex items-center gap-2">
            {periods.length > 0 && (
              <>
                <Button variant="outline" size="sm" icon={Zap} onClick={handleAutoAssignAll}>
                  Auto-Assign Top Candidates
                </Button>
                <Button variant="primary" size="sm" icon={Save} loading={saving} onClick={handleSaveSubstitutions}>
                  Save Substitutions
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Step 1: Select Absent Teacher */}
      <Card>
        <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <CardTitle className="text-xs font-bold uppercase text-[#52607D]">Select Absent Faculty Member</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <Input
            icon={Search}
            placeholder="Search absent teacher by name or employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loadingTeachers ? (
            <p className="text-xs text-[#8C97AB] text-center py-4">Loading teachers list...</p>
          ) : filteredTeachers.length === 0 ? (
            <p className="text-xs text-[#8C97AB] text-center py-4">No active teachers found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {filteredTeachers.map((t) => {
                const isSelected = String(t.id) === String(selectedTeacherId);
                const teacherName = t.user?.name || t.User?.name || `Teacher #${t.id}`;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTeacher(t.id)}
                    className={`p-2.5 rounded-[6px] border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#EAF3F0] border-[#2F6F5E] text-[#2F6F5E] font-semibold'
                        : 'bg-white border-[#E4E1D8] text-[#14213D] hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold text-[10px] shrink-0">
                      {teacherName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{teacherName}</p>
                      <p className="text-[10px] text-[#8C97AB] font-mono">ID: {t.employee_id || '—'}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#2F6F5E] shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Periods & Candidate Ranking */}
      {selectedTeacherId && (
        <Card>
          <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
            <CardTitle className="text-xs font-bold uppercase text-[#52607D]">
              Periods Requiring Coverage for {selectedTeacherObj?.user?.name || 'Faculty Member'} ({dayOfWeek})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {loadingPeriods ? (
              <p className="text-center py-6 text-[#8C97AB]">Loading schedule...</p>
            ) : periods.length === 0 ? (
              <EmptyState icon={UserCheck} title="No periods scheduled today" description="This teacher has no active teaching periods on today's schedule." />
            ) : (
              <div className="space-y-3 divide-y divide-[#EDEAE1]">
                {periods.map((p) => {
                  const candidates = candidatesMap[p.timetable_id] || [];
                  const selectedSubId = selectedSubstitutes[p.timetable_id];

                  return (
                    <div key={p.timetable_id} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#14213D]">{p.subject_name}</span>
                          <span className="text-[#8C97AB] mx-2">·</span>
                          <span className="text-[#52607D] font-medium">Class {p.class_name} (Section {p.section_name})</span>
                        </div>
                        <span className="text-[10px] text-[#8C97AB] font-mono">
                          {p.start_time?.substring(0, 5)} - {p.end_time?.substring(0, 5)}
                        </span>
                      </div>

                      {loadingCandidates ? (
                        <p className="text-[10px] text-[#8C97AB]">Finding available free candidates...</p>
                      ) : candidates.length === 0 ? (
                        <p className="text-[10px] text-[#B0403A]">No free teachers available for this period slot.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {/* No Substitution option — always first */}
                          <button
                            type="button"
                            onClick={() => handleAssignSubstitute(p.timetable_id, null)}
                            className={`px-2.5 py-1.5 rounded-[6px] border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                              !selectedSubId
                                ? 'bg-[#F5F0EB] text-[#8C4A2F] border-[#D4A574]'
                                : 'bg-white text-[#8C97AB] border-[#E4E1D8] hover:bg-[#FAFAF8]'
                            }`}
                            title="Don't assign a substitute for this period"
                          >
                            <span>No Substitution</span>
                          </button>

                          {candidates.map((cand) => {
                            const isSubSelected = String(selectedSubId) === String(cand.teacher_id);
                            return (
                              <button
                                key={cand.teacher_id}
                                type="button"
                                onClick={() => handleAssignSubstitute(p.timetable_id, cand.teacher_id)}
                                className={`px-2.5 py-1.5 rounded-[6px] border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                  isSubSelected
                                    ? 'bg-[#2F6F5E] text-white border-[#2F6F5E]'
                                    : 'bg-white text-[#14213D] border-[#E4E1D8] hover:bg-[#FAFAF8]'
                                }`}
                              >
                                <span>{cand.name}</span>
                                {cand.subject_match && (
                                  <span className={`text-[9px] px-1 rounded font-bold ${isSubSelected ? 'bg-white/20 text-white' : 'bg-[#EAF3F0] text-[#2F6F5E]'}`}>
                                    Subject Match
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
