import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { timetableAPI, classesAPI, teacherAssignmentsAPI, subjectsAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Select, Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Calendar, Plus, Trash2, Save, ChevronLeft, UserCheck, AlertTriangle, Check, Printer, Copy } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function Timetables() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [timetable, setTimetable] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDay, setEditDay] = useState(null);
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadTimetable();
      loadAssignments();
    }
  }, [selectedClass, selectedSection]);

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch { /* ignore */ }
  };

  const loadSubjects = async () => {
    try {
      const res = await subjectsAPI.list();
      setSubjects(res.items || []);
    } catch { /* ignore */ }
  };

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const res = await timetableAPI.getSection(Number(selectedClass), Number(selectedSection));
      setTimetable(res.data || {});
    } catch {
      setTimetable({});
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const res = await teacherAssignmentsAPI.getBySection(Number(selectedSection));
      setAssignments(res.data || []);
    } catch { /* ignore */ }
  };

  const selectedSections = classes.find((c) => String(c.id) === String(selectedClass))?.sections || [];

  const openDayEditor = (day) => {
    const dayEntries = timetable[day] || [];
    setEntries(
      dayEntries.length > 0
        ? dayEntries.map((e) => ({
            start_time: e.start_time || '',
            end_time: e.end_time || '',
            teacher_assignment_id: e.teacher_assignment_id || undefined,
            subject_id: e.subject_id || undefined,
            title: e.title || '',
            is_break: e.is_break || false,
            _assignedTeacherName: e.teacher ? (e.teacher.name || e.teacher.user?.name) : null,
            _hasAssignment: !!e.teacher_assignment_id,
          }))
        : [{ start_time: '09:00', end_time: '09:45', teacher_assignment_id: undefined, subject_id: undefined, title: '', is_break: false }]
    );
    setEditDay(day);
  };

  const subjectAssignmentMap = {};
  for (const a of assignments) {
    if (a.subject_id && !a.is_class_teacher) {
      subjectAssignmentMap[a.subject_id] = a;
    }
  }

  const addEntry = () =>
    setEntries([
      ...entries,
      { start_time: '', end_time: '', teacher_assignment_id: '', subject_id: '', title: '', is_break: false },
    ]);

  const removeEntry = (idx) => setEntries(entries.filter((_, i) => i !== idx));

  const updateEntry = (idx, field, value) => {
    const updated = [...entries];
    if (field === 'is_break') {
      updated[idx].is_break = value;
    } else if (field === 'subject_id') {
      const subId = value === '' ? undefined : Number(value);
      updated[idx].subject_id = subId;
      const matched = subId ? subjectAssignmentMap[subId] : null;
      updated[idx].teacher_assignment_id = matched ? matched.id : undefined;
      updated[idx]._assignedTeacherName = matched
        ? (matched.teacher?.user?.name || matched.teacher?.User?.name || matched.teacher?.employee_id || `Teacher #${matched.teacher_id}`)
        : null;
      updated[idx]._hasAssignment = !!matched;
    } else {
      updated[idx][field] = value;
    }
    setEntries(updated);
  };

  const handleSaveDay = async () => {
    const unresolved = entries.filter((e) => !e.is_break && e.subject_id && !e.teacher_assignment_id);
    if (unresolved.length > 0) {
      toast.error('Some subjects have no teacher assigned. Please assign teachers first.');
      return;
    }
    setSaving(true);
    try {
      await timetableAPI.create(
        Number(selectedClass),
        Number(selectedSection),
        editDay,
        entries.map((e) => ({
          start_time: e.start_time,
          end_time: e.end_time,
          teacher_assignment_id: e.teacher_assignment_id ? Number(e.teacher_assignment_id) : undefined,
          subject_id: e.subject_id ? Number(e.subject_id) : undefined,
          title: e.title || undefined,
          is_break: e.is_break,
        }))
      );
      toast.success(`${editDay.charAt(0).toUpperCase() + editDay.slice(1)} timetable saved!`);
      setEditDay(null);
      loadTimetable();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save timetable');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyDayToWeek = async (sourceDay) => {
    const sourceEntries = timetable[sourceDay];
    if (!sourceEntries || sourceEntries.length === 0) {
      toast.error(`No schedule created for ${sourceDay} to copy.`);
      return;
    }
    const otherDays = DAYS.filter((d) => d !== sourceDay);
    setSaving(true);
    try {
      for (const targetDay of otherDays) {
        await timetableAPI.create(
          Number(selectedClass),
          Number(selectedSection),
          targetDay,
          sourceEntries.map((e) => ({
            start_time: e.start_time,
            end_time: e.end_time,
            teacher_assignment_id: e.teacher_assignment_id ? Number(e.teacher_assignment_id) : undefined,
            subject_id: e.subject_id ? Number(e.subject_id) : undefined,
            title: e.title || undefined,
            is_break: e.is_break,
          }))
        );
      }
      toast.success(`Copied ${sourceDay}'s schedule to all other days!`);
      loadTimetable();
    } catch {
      toast.error('Failed to copy schedule across week');
    } finally {
      setSaving(false);
    }
  };

  const selectedClassName = classes.find((c) => String(c.id) === String(selectedClass))?.class_name || '';
  const selectedSectionName = selectedSections.find((s) => String(s.id) === String(selectedSection))?.name || '';

  return (
    <div className="space-y-4 text-xs">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14213D]">Class Timetables & Weekly Schedules</span>
            {selectedClass && selectedSection && (
              <>
                <span className="text-[#8C97AB]">|</span>
                <span className="text-[#2F6F5E] font-semibold">Class {selectedClassName} - Sec {selectedSectionName}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedClass && selectedSection && (
              <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
                Print Schedule
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={UserCheck}
              onClick={() => navigate('/admin/timetables/substitutions')}
            >
              Substitute Teachers
            </Button>
          </div>
        </div>
      </Card>

      {/* Class & Section Selectors */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider mb-1 font-mono">
              Class *
            </label>
            <Select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection('');
                setTimetable({});
                setEditDay(null);
              }}
            >
              <option value="">Select Class...</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>Class {c.class_name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider mb-1 font-mono">
              Section *
            </label>
            <Select
              value={selectedSection}
              onChange={(e) => { setSelectedSection(e.target.value); setEditDay(null); }}
              disabled={!selectedClass}
            >
              <option value="">Select Section...</option>
              {selectedSections.map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Weekly Schedule Display / Day Editor */}
      {!selectedClass || !selectedSection ? (
        <Card className="p-12">
          <EmptyState
            icon={Calendar}
            title="Select Class & Section"
            description="Choose a class and section from the dropdowns above to view or build the weekly master timetable."
          />
        </Card>
      ) : editDay ? (
        <Card>
          <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={ChevronLeft} onClick={() => setEditDay(null)}>
                Back
              </Button>
              <CardTitle className="text-xs font-bold uppercase text-[#14213D]">
                Editing {editDay.toUpperCase()} Schedule — Class {selectedClassName} ({selectedSectionName})
              </CardTitle>
            </div>
            <Button variant="primary" size="sm" icon={Save} disabled={saving} onClick={handleSaveDay}>
              {saving ? 'Saving...' : 'Save Schedule'}
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {entries.map((entry, idx) => (
              <div key={idx} className="p-3 border border-[#E4E1D8] rounded-[8px] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#52607D]">Period #{idx + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={entry.is_break}
                        onChange={(e) => updateEntry(idx, 'is_break', e.target.checked)}
                        className="rounded accent-[#2F6F5E]"
                      />
                      <span>Is Break / Recess</span>
                    </label>
                    <Button variant="ghost" size="icon" onClick={() => removeEntry(idx)} className="text-[#B0403A]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#8C97AB] mb-1">Start Time</label>
                    <Input
                      type="time"
                      value={entry.start_time}
                      onChange={(e) => updateEntry(idx, 'start_time', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8C97AB] mb-1">End Time</label>
                    <Input
                      type="time"
                      value={entry.end_time}
                      onChange={(e) => updateEntry(idx, 'end_time', e.target.value)}
                    />
                  </div>

                  {entry.is_break ? (
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[#8C97AB] mb-1">Break Title</label>
                      <Input
                        placeholder="e.g. Lunch Break, Morning Recess..."
                        value={entry.title}
                        onChange={(e) => updateEntry(idx, 'title', e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[#8C97AB] mb-1">Subject</label>
                      <Select
                        value={entry.subject_id || ''}
                        onChange={(e) => updateEntry(idx, 'subject_id', e.target.value)}
                      >
                        <option value="">Select Subject...</option>
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </Select>
                      {entry.subject_id && (
                        <div className="mt-1 text-[11px]">
                          {entry._hasAssignment ? (
                            <span className="text-[#2F6F5E] font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" /> Teacher: {entry._assignedTeacherName}
                            </span>
                          ) : (
                            <span className="text-[#B0403A] font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> No teacher mapped to this subject!
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <Button variant="outline" size="sm" icon={Plus} onClick={addEntry} className="w-full">
              Add Period Slot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map((day) => {
            const dayEntries = timetable[day] || [];
            return (
              <Card key={day} className="flex flex-col justify-between">
                <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8] flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase text-[#14213D]">
                    {day} ({dayEntries.length} Periods)
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {dayEntries.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={`Copy ${day}'s schedule to all other days`}
                        onClick={() => handleCopyDayToWeek(day)}
                        disabled={saving}
                      >
                        <Copy className="w-3.5 h-3.5 text-[#2F6F5E]" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openDayEditor(day)}>
                      {dayEntries.length > 0 ? 'Edit' : 'Build'}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-3 space-y-2 flex-1">
                  {loading ? (
                    <div className="p-4 text-center text-[#8C97AB]">Loading...</div>
                  ) : dayEntries.length === 0 ? (
                    <div className="p-4 text-center text-[#8C97AB] italic">No periods scheduled</div>
                  ) : (
                    dayEntries.map((period, pIdx) => (
                      <div
                        key={pIdx}
                        className={`p-2 rounded-[6px] border text-xs ${
                          period.is_break
                            ? 'bg-[#FDF8EC] border-[#F8D7D5] text-[#B8860B]'
                            : 'bg-white border-[#E4E1D8]'
                        }`}
                      >
                        <div className="flex justify-between items-center font-mono text-[10px] text-[#52607D]">
                          <span>
                            {period.start_time} - {period.end_time}
                          </span>
                          {period.is_break && <span className="font-semibold uppercase">Recess</span>}
                        </div>
                        {!period.is_break && (
                          <div className="mt-1">
                            <div className="font-semibold text-[#14213D]">{period.subject_name || period.subject?.name || 'Subject'}</div>
                            <div className="text-[10px] text-[#2F6F5E]">
                              {period.teacher_name || period.teacher?.name || 'Assigned Teacher'}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
