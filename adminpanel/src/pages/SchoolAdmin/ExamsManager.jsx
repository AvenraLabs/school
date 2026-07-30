import React, { useEffect, useMemo, useState } from 'react';
import { examsAPI, classesAPI, subjectsAPI, reportCardsAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Select, Input, Textarea } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Lock,
  Pencil,
  Plus,
  Trash2,
  Unlock,
  HelpCircle,
} from 'lucide-react';
import { formatDate } from '../../utils/date';

const getExamName = (exam) => exam?.name || exam?.master?.name || exam?.exam_master?.name || `Exam #${exam?.id}`;
const getSubjectSlots = (exam) => [...(exam?.exam_subjects || exam?.examSubjects || [])]
  .sort((a, b) => String(a.exam_date || '').localeCompare(String(b.exam_date || '')));
const getSubjectName = (slot) => slot?.subject?.name || slot?.Subject?.name || `Subject #${slot?.subject_id}`;

export function ExamsManager() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]); // full school catalog (fallback)
  const [classSubjects, setClassSubjects] = useState([]); // subjects filtered for selected class/section
  const [exams, setExams] = useState([]);
  const [scheduleExams, setScheduleExams] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [createForm, setCreateForm] = useState({ class_id: '', section_id: '', name: '' });
  const [scheduleForm, setScheduleForm] = useState({
    class_id: '',
    exam_id: '',
    subject_id: '',
    exam_date: '',
    syllabus: '',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [showGradingScales, setShowGradingScales] = useState(false);
  const [gradingScales, setGradingScales] = useState([]);
  const [loadingScales, setLoadingScales] = useState(false);
  const [savingScales, setSavingScales] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadExams(selectedClass, selectedSection);
      loadClassSubjects(selectedClass, selectedSection);
    } else {
      setExams([]);
      setClassSubjects([]);
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (scheduleForm.class_id) {
      loadScheduleExams(scheduleForm.class_id);
      loadClassSubjects(scheduleForm.class_id, selectedSection);
    } else {
      setScheduleExams([]);
    }
  }, [scheduleForm.class_id]);

  const selectedClassObj = useMemo(
    () => classes.find((item) => String(item.id) === String(selectedClass)),
    [classes, selectedClass]
  );
  const selectedClassName = selectedClassObj?.class_name || '';
  const availableSections = selectedClassObj?.sections || [];
  const selectedSectionName = availableSections.find((s) => String(s.id) === String(selectedSection))?.name || '';

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch (e) {
      toast.error('Failed to load classes');
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await subjectsAPI.list();
      setSubjects(res.items || []);
    } catch (e) {
      toast.error('Failed to load subjects');
    }
  };

  const loadClassSubjects = async (classId, sectionId = '') => {
    if (!classId) { setClassSubjects([]); return; }
    try {
      if (sectionId) {
        const res = await subjectsAPI.getSubjectsForSection(Number(classId), Number(sectionId));
        setClassSubjects(res.items || []);
      } else {
        const res = await subjectsAPI.getClassSubjects(Number(classId));
        setClassSubjects(res.items || []);
      }
    } catch {
      setClassSubjects([]); // fallback to full catalog
    }
  };

  const loadExams = async (classId = selectedClass, sectionId = selectedSection) => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await examsAPI.list(Number(classId), sectionId ? Number(sectionId) : null);
      setExams(res.items || []);
    } catch (e) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleExams = async (classId) => {
    try {
      const res = await examsAPI.list(Number(classId), selectedSection ? Number(selectedSection) : null);
      setScheduleExams(res.items || []);
      if (scheduleForm.exam_id && !(res.items || []).some((exam) => String(exam.id) === String(scheduleForm.exam_id))) {
        setScheduleForm((prev) => ({ ...prev, exam_id: '' }));
      }
    } catch (e) {
      setScheduleExams([]);
      toast.error('Failed to load exams for this class');
    }
  };

  const openGradingScales = async () => {
    setShowGradingScales(true);
    setLoadingScales(true);
    try {
      const res = await reportCardsAPI.getGradingScales();
      setGradingScales(res.data || []);
    } catch (e) {
      toast.error('Failed to load grading scales');
    } finally {
      setLoadingScales(false);
    }
  };

  const handleSaveGradingScales = async (e) => {
    e.preventDefault();
    setSavingScales(true);
    try {
      await reportCardsAPI.saveGradingScales(gradingScales);
      toast.success('Grading scales updated successfully');
      setShowGradingScales(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save grading scales');
    } finally {
      setSavingScales(false);
    }
  };

  const handleScaleChange = (index, field, value) => {
    const updated = [...gradingScales];
    if (field === 'min_percentage') {
      updated[index][field] = value === '' ? '' : Number(value);
    } else {
      updated[index][field] = value;
    }
    setGradingScales(updated);
  };

  const addGradingRow = () => {
    setGradingScales((prev) => [
      ...prev,
      { grade_name: '', min_percentage: '', is_pass: true, color_code: '#2F6F5E' },
    ]);
  };

  const removeGradingRow = (index) => {
    setGradingScales((prev) => prev.filter((_, i) => i !== index));
  };

  const openCreateExam = () => {
    setCreateForm({ class_id: selectedClass || '', section_id: selectedSection || '', name: '' });
    setShowCreateExam(true);
  };

  const openSchedule = (exam = null, slot = null) => {
    let defaultDate = slot?.exam_date || '';
    if (!defaultDate && exam) {
      const existingSlots = getSubjectSlots(exam);
      if (existingSlots.length > 0) {
        const latestSlotDate = existingSlots[existingSlots.length - 1]?.exam_date;
        if (latestSlotDate && !isNaN(new Date(latestSlotDate).getTime())) {
          const nextDate = new Date(latestSlotDate);
          nextDate.setDate(nextDate.getDate() + 1);
          if (nextDate.getDay() === 0) nextDate.setDate(nextDate.getDate() + 1);
          defaultDate = nextDate.toISOString().split('T')[0];
        }
      }
      if (!defaultDate) {
        const today = new Date();
        if (today.getDay() === 0) today.setDate(today.getDate() + 1);
        defaultDate = today.toISOString().split('T')[0];
      }
    }

    setScheduleForm({
      class_id: exam?.class_id || selectedClass || '',
      exam_id: exam?.id || '',
      subject_id: slot?.subject_id || '',
      exam_date: defaultDate,
      syllabus: slot?.syllabus || '',
    });
    setShowSchedule(true);
  };

  const handleCreateExam = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await examsAPI.create(
        Number(createForm.class_id),
        createForm.name.trim(),
        [],
        createForm.section_id ? Number(createForm.section_id) : null
      );
      toast.success('Exam created');
      setShowCreateExam(false);
      if (String(createForm.class_id) === String(selectedClass)) await loadExams(createForm.class_id, selectedSection);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create exam');
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleSubject = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await examsAPI.upsertSubject(
        Number(scheduleForm.exam_id),
        Number(scheduleForm.subject_id),
        scheduleForm.exam_date,
        scheduleForm.syllabus.trim() || null
      );
      toast.success('Test schedule saved');
      setShowSchedule(false);
      if (String(scheduleForm.class_id) === String(selectedClass)) await loadExams(scheduleForm.class_id);
      await loadScheduleExams(scheduleForm.class_id);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const toggleLock = async (exam) => {
    try {
      await examsAPI.lock(exam.id, !exam.is_locked);
      toast.success(`Exam ${!exam.is_locked ? 'locked' : 'unlocked'}`);
      await loadExams(selectedClass);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update exam lock');
    }
  };

  const removeSubject = async (exam, slot) => {
    try {
      await examsAPI.removeSubject(exam.id, slot.subject_id);
      toast.success('Subject schedule removed');
      await loadExams(selectedClass);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to remove subject');
    }
  };

  const handleAutoPopulateSubjects = async (examObj) => {
    const examId = typeof examObj === 'object' ? examObj.id : examObj;
    const targetExam = typeof examObj === 'object' ? examObj : exams.find((e) => e.id === examId);
    const classId = targetExam?.class_id || selectedClass;
    const sectionId = targetExam?.section_id || selectedSection;

    let subjectPool = classSubjects;
    if (sectionId) {
      try {
        const res = await subjectsAPI.getSubjectsForSection(Number(classId), Number(sectionId));
        subjectPool = res.items || [];
      } catch { /* fallback */ }
    }
    if (subjectPool.length === 0) subjectPool = subjects;

    if (!examId || !classId || subjectPool.length === 0) {
      toast.error('No subjects available to auto-populate. Set up subjects in the Subjects manager first.');
      return;
    }
    setSaving(true);
    try {
      let count = 0;
      const existingSlots = getSubjectSlots(targetExam);
      let startDate = new Date();
      if (existingSlots.length > 0) {
        const latestSlotDate = existingSlots[existingSlots.length - 1]?.exam_date;
        if (latestSlotDate && !isNaN(new Date(latestSlotDate).getTime())) {
          startDate = new Date(latestSlotDate);
          startDate.setDate(startDate.getDate() + 1);
        }
      }

      let currentDate = new Date(startDate);

      for (const sub of subjectPool) {
        // Skip Sunday
        if (currentDate.getDay() === 0) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        try {
          await examsAPI.upsertSubject(
            Number(examId),
            Number(sub.id),
            dateStr,
            'Full Syllabus'
          );
          count++;
        } catch (e) {
          console.error('Failed adding subject slot:', sub.name, e);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      toast.success(`Auto-populated ${count} subject exam slots with consecutive dates!`);
      loadExams(classId, selectedSection);
    } catch (e) {
      toast.error('Failed to auto-populate exam schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14213D]">Exams & Marks Catalog</span>
            {selectedClass && (
              <>
                <span className="text-[#8C97AB]">|</span>
                <span className="text-[#52607D]">Class {selectedClassName}</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={HelpCircle}
              onClick={() => setShowHelp(!showHelp)}
            />
            <Button
              variant="outline"
              size="sm"
              icon={ClipboardList}
              onClick={openGradingScales}
            >
              Grading Scales
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={CalendarDays}
              onClick={() => {
                setScheduleForm((prev) => ({
                  ...prev,
                  class_id: selectedClass || prev.class_id,
                }));
                setShowSchedule(true);
              }}
            >
              Schedule Test
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setCreateForm((prev) => ({
                  ...prev,
                  class_id: selectedClass || prev.class_id,
                }));
                setShowCreateExam(true);
              }}
            >
              Create Exam Term
            </Button>
          </div>
        </div>
      </Card>

      {showHelp && (
        <div className="p-4 bg-[#EAF3F0] border border-[#D3E6E0] rounded-[8px] text-xs text-[#2F6F5E] space-y-2">
          <h4 className="font-bold flex items-center gap-1.5 text-sm">
            <HelpCircle className="w-4 h-4" /> How Grading Scales Work
          </h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Enter the minimum percentage required for each grade threshold.</li>
            <li>Any score below your lowest defined threshold will automatically evaluate as <strong>Fail</strong>.</li>
          </ul>
        </div>
      )}

      {/* Class & Section Selector Bar */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-3 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#52607D]">Class:</span>
            <Select
              className="w-40"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection('');
              }}
            >
              <option value="">Select class...</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>Class {item.class_name}</option>
              ))}
            </Select>
          </div>

          {selectedClass && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#52607D]">Section:</span>
              <Select
                className="w-44"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">All Sections (Default)</option>
                {availableSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>Section {sec.name}</option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {selectedClassName && (
          <span className="text-xs font-semibold text-[#2F6F5E] bg-[#EAF3F0] px-3 py-1 rounded-full border border-[#D3E6E0]">
            Viewing exams for Class {selectedClassName} {selectedSectionName ? `- Sec ${selectedSectionName}` : '(All Sections)'}
          </span>
        )}
      </div>

      {/* Exams Grid */}
      {!selectedClass ? (
        <Card className="p-12">
          <EmptyState
            icon={FileText}
            title="Select a class"
            description="Choose a grade level above to view exam schedules and subject tests."
          />
        </Card>
      ) : loading ? (
        <Card className="p-8 text-center text-xs text-[#8C97AB]">
          Loading exam configuration...
        </Card>
      ) : exams.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={FileText}
            title="No exams created yet"
            description="Create your first exam for this class to start scheduling subject tests."
            actionLabel="Create First Exam"
            onAction={openCreateExam}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => {
            const slots = getSubjectSlots(exam);
            return (
              <Card key={exam.id} className="flex flex-col justify-between">
                <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <CardTitle className="text-sm font-bold text-[#14213D]">
                        {getExamName(exam)}
                      </CardTitle>
                      {exam.section ? (
                        <span className="text-[10px] font-bold text-[#2F6F5E] bg-[#EAF3F0] px-2 py-0.5 rounded border border-[#D3E6E0]">
                          Sec {exam.section.name}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-[#52607D] bg-[#F0EDE6] px-2 py-0.5 rounded border border-[#E4E1D8]">
                          All Sections
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#8C97AB] mt-0.5">
                      {slots.length} subject test{slots.length === 1 ? '' : 's'} scheduled
                    </p>
                  </div>
                  <StatusBadge status={exam.is_locked ? 'inactive' : 'active'} size="sm" />
                </CardHeader>

                <CardContent className="p-4 space-y-2 flex-1">
                  {slots.length === 0 ? (
                    <p className="text-xs text-[#8C97AB] text-center py-4">
                      No subject tests scheduled yet.
                    </p>
                  ) : (
                    slots.map((slot) => (
                      <div
                        key={slot.id || slot.subject_id}
                        className="p-2.5 rounded-[6px] bg-[#FAFAF8] border border-[#EDEAE1] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#14213D]">{getSubjectName(slot)}</span>
                          {!exam.is_locked && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openSchedule(exam, slot)}
                                className="text-[#8C97AB] hover:text-[#2F6F5E] p-1 cursor-pointer"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => removeSubject(exam, slot)}
                                className="text-[#8C97AB] hover:text-[#B0403A] p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-[#52607D] flex items-center gap-1">
                          <CalendarDays className="w-3 h-3 text-[#2F6F5E]" />
                          <span>{formatDate(slot.exam_date)}</span>
                        </p>
                        {slot.syllabus && (
                          <p className="text-[11px] text-[#52607D] italic border-t border-[#EDEAE1] pt-1 mt-1">
                            Syllabus: {slot.syllabus}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>

                <div className="p-3 bg-[#FAFAF8] border-t border-[#E4E1D8] flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Plus}
                      disabled={exam.is_locked}
                      onClick={() => openSchedule(exam)}
                    >
                      Add Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exam.is_locked || saving}
                      onClick={() => handleAutoPopulateSubjects(exam)}
                      title="Auto-fill all class/section subjects into this exam"
                    >
                      Auto-Fill Subjects
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={exam.is_locked ? Unlock : Lock}
                      onClick={() => toggleLock(exam)}
                    >
                      {exam.is_locked ? 'Unlock' : 'Lock'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#B0403A] hover:bg-[#FDF2F1]"
                      disabled={exam.is_locked}
                      onClick={() => handleDeleteExam(exam)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Create Exam */}
      <Modal isOpen={showCreateExam} onClose={() => setShowCreateExam(false)} title="Create New Exam">
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Target Class *</label>
              <Select
                required
                value={createForm.class_id}
                onChange={(e) => setCreateForm({ ...createForm, class_id: e.target.value, section_id: '' })}
              >
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>Class {item.class_name}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Section Scope (Optional)</label>
              <Select
                value={createForm.section_id}
                onChange={(e) => setCreateForm({ ...createForm, section_id: e.target.value })}
                disabled={!createForm.class_id}
              >
                <option value="">All Sections (Entire Grade)</option>
                {(classes.find((c) => String(c.id) === String(createForm.class_id))?.sections || []).map((sec) => (
                  <option key={sec.id} value={sec.id}>Section {sec.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Exam Name *</label>
            <Input
              required
              placeholder="e.g. Unit Test 1, Midterm Exam, Science Stream Assessment"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowCreateExam(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>Create Exam</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Schedule Subject Test */}
      <Modal isOpen={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule Subject Test">
        <form onSubmit={handleScheduleSubject} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Class *</label>
              <Select
                required
                value={scheduleForm.class_id}
                onChange={(e) => setScheduleForm({ ...scheduleForm, class_id: e.target.value, exam_id: '' })}
              >
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>{item.class_name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Exam *</label>
              <Select
                required
                value={scheduleForm.exam_id}
                onChange={(e) => setScheduleForm({ ...scheduleForm, exam_id: e.target.value })}
                disabled={!scheduleForm.class_id}
              >
                <option value="">Select exam</option>
                {scheduleExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>{getExamName(exam)}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">
                Subject * {classSubjects.length > 0 && <span className="text-[10px] text-[#2F6F5E] font-normal">(class-filtered)</span>}
              </label>
              <Select
                required
                value={scheduleForm.subject_id}
                onChange={(e) => setScheduleForm({ ...scheduleForm, subject_id: e.target.value })}
              >
                <option value="">Select subject</option>
                {(classSubjects.length > 0 ? classSubjects : subjects).map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Exam Date *</label>
              <Input
                type="date"
                required
                value={scheduleForm.exam_date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, exam_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Syllabus Details (Optional)</label>
            <Textarea
              placeholder="e.g. Chapters 1-4, Algebra & Geometry"
              value={scheduleForm.syllabus}
              onChange={(e) => setScheduleForm({ ...scheduleForm, syllabus: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowSchedule(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>Save Schedule</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Grading Scales */}
      <Modal isOpen={showGradingScales} onClose={() => setShowGradingScales(false)} title="Configure Grading Scales">
        {loadingScales ? (
          <div className="p-8 text-center text-xs text-[#8C97AB]">Loading grading scales...</div>
        ) : (
          <form onSubmit={handleSaveGradingScales} className="space-y-4">
            <p className="text-xs text-[#52607D]">
              Configure institutional grade boundaries based on percentage thresholds.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {gradingScales.map((scale, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    required
                    placeholder="Grade Name (e.g. A+)"
                    value={scale.grade_name}
                    onChange={(e) => handleScaleChange(index, 'grade_name', e.target.value)}
                  />
                  <Input
                    type="number"
                    required
                    min={0}
                    max={100}
                    className="w-24 font-mono"
                    placeholder="Min %"
                    value={scale.min_percentage}
                    onChange={(e) => handleScaleChange(index, 'min_percentage', e.target.value)}
                  />
                  <input
                    type="color"
                    value={scale.color_code || '#2F6F5E'}
                    onChange={(e) => handleScaleChange(index, 'color_code', e.target.value)}
                    className="w-9 h-9 border border-[#E4E1D8] rounded-[6px] p-1 cursor-pointer"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#B0403A] hover:bg-[#FDF2F1]"
                    onClick={() => removeGradingRow(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="secondary" size="sm" icon={Plus} onClick={addGradingRow}>
              Add Grade Range
            </Button>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
              <Button variant="outline" type="button" onClick={() => setShowGradingScales(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={savingScales}>Save Grading Scale</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
