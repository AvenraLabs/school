import React, { useState, useEffect } from 'react';
import { classesAPI, subjectsAPI, schoolAPI, bellSchedulesAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Calendar, Wand2, Save, BookOpen, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';

export function SubjectPeriodsManager() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const [subjectsList, setSubjectsList] = useState([]);
  const [academicPeriods, setAcademicPeriods] = useState({});   // id -> periods_per_week
  const [coCurricularPeriods, setCoCurricularPeriods] = useState({});
  const [subjectExamScores, setSubjectExamScores] = useState({});

  const [periodBudget, setPeriodBudget] = useState(null);  // derived from bell schedule
  const [bellTemplate, setBellTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);

  const toast = useToast();

  useEffect(() => { loadClasses(); }, []);

  useEffect(() => {
    if (selectedClass) {
      loadSubjects();
    } else {
      setSubjectsList([]);
      setAcademicPeriods({});
      setCoCurricularPeriods({});
      setSubjectExamScores({});
      setBellTemplate(null);
      setPeriodBudget(null);
      setAiSuggested(false);
    }
  }, [selectedClass, selectedSection]);

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch {
      toast.error('Failed to load classes');
    }
  };

  const loadSubjects = async () => {
    if (!selectedClass) return;
    setLoading(true);
    setAiSuggested(false);
    try {
      let rawItems = [];
      if (selectedSection) {
        const res = await subjectsAPI.getSubjectsForSection(Number(selectedClass), Number(selectedSection));
        rawItems = res.items || [];
      } else {
        const res = await subjectsAPI.getClassSubjects(Number(selectedClass));
        rawItems = res.items || [];
      }

      const resolved = rawItems.map((item) => {
        const subObj = item.subject ? item.subject : item;
        return {
          id: subObj.id || item.subject_id || item.id,
          name: subObj.name || item.name || '',
          code: subObj.code || item.code || '',
          subject_type: subObj.subject_type || item.subject_type || 'academic',
          periods_per_week: item.periods_per_week ?? subObj.periods_per_week ?? null,
        };
      }).filter((s) => s.id && s.name);

      setSubjectsList(resolved);

      const acadMap = {};
      const coMap = {};
      resolved.forEach((sub) => {
        const p = sub.periods_per_week ?? 0;
        if (sub.subject_type === 'co_curricular') coMap[sub.id] = p;
        else acadMap[sub.id] = p;
      });
      setAcademicPeriods(acadMap);
      setCoCurricularPeriods(coMap);

      // Derive budget from the class's assigned bell schedule template
      try {
        const classObj = classes.find((c) => String(c.id) === String(selectedClass));
        const templateId = classObj?.bellScheduleTemplate?.id ?? classObj?.bell_schedule_template_id ?? null;
        if (templateId) {
          const tplRes = await bellSchedulesAPI.getById(templateId);
          const tpl = tplRes.data || tplRes.template || tplRes;
          setBellTemplate(tpl);
          const slots = tpl.periods || [];
          const academicSlotsPerDay = slots.filter((s) => !s.is_break).length;
          const workingDays = tpl.working_days_per_week || classObj?.bellScheduleTemplate?.working_days_per_week || 5;
          const computed = academicSlotsPerDay * workingDays;
          setPeriodBudget(computed > 0 ? computed : null);
        } else {
          setBellTemplate(null);
          setPeriodBudget(null);
        }
      } catch {
        setBellTemplate(null);
        setPeriodBudget(null);
      }

      // Load exam averages for AI weighting
      if (selectedClass && selectedSection) {
        try {
          const analyticsRes = await schoolAPI.getSchoolAnalytics(Number(selectedClass), Number(selectedSection));
          const averages = analyticsRes?.data?.subject_averages || [];
          const scoreMap = {};
          averages.forEach((item) => { scoreMap[item.subject] = item.average ?? item.score ?? null; });
          setSubjectExamScores(scoreMap);
        } catch {
          setSubjectExamScores({});
        }
      } else {
        setSubjectExamScores({});
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load subject configuration');
    } finally {
      setLoading(false);
    }
  };

  const selectedSections = classes.find((c) => String(c.id) === String(selectedClass))?.sections || [];

  // Combined total across ALL subjects
  const totalAllPeriods =
    Object.values(academicPeriods).reduce((a, b) => a + (Number(b) || 0), 0) +
    Object.values(coCurricularPeriods).reduce((a, b) => a + (Number(b) || 0), 0);

  const getPeriod = (sub) =>
    sub.subject_type === 'co_curricular'
      ? coCurricularPeriods[sub.id] ?? 0
      : academicPeriods[sub.id] ?? 0;

  const handlePeriodChange = (sub, value) => {
    const num = Math.max(0, parseInt(value || '0', 10));
    const isCo = sub.subject_type === 'co_curricular';

    // Cap: combined total must not exceed budget
    if (periodBudget !== null) {
      const nextAcad = { ...academicPeriods };
      const nextCo = { ...coCurricularPeriods };
      if (isCo) nextCo[sub.id] = num;
      else nextAcad[sub.id] = num;
      const newTotal =
        Object.values(nextAcad).reduce((a, b) => a + (Number(b) || 0), 0) +
        Object.values(nextCo).reduce((a, b) => a + (Number(b) || 0), 0);
      if (newTotal > periodBudget) {
        toast.error(`Cannot exceed ${periodBudget} total periods/week (from Daily Schedule template)`);
        return;
      }
    }

    if (isCo) setCoCurricularPeriods((prev) => ({ ...prev, [sub.id]: num }));
    else setAcademicPeriods((prev) => ({ ...prev, [sub.id]: num }));
  };

  const handleSuggestAIDistribution = () => {
    const acadSubjects = subjectsList.filter((s) => s.subject_type !== 'co_curricular');
    const coSubjects = subjectsList.filter((s) => s.subject_type === 'co_curricular');

    if (subjectsList.length === 0) {
      toast.error('No subjects found for this class.');
      return;
    }

    const budget = periodBudget || 30;

    // Reserve 1 period per co-curricular, distribute remainder to academic
    const coReserved = coSubjects.length;
    const acadBudget = Math.max(0, budget - coReserved);

    const newCoMap = {};
    coSubjects.forEach((sub) => { newCoMap[sub.id] = 1; });
    setCoCurricularPeriods(newCoMap);

    if (acadSubjects.length === 0) {
      setAiSuggested(true);
      toast.success('Set 1 period/week for each co-curricular activity.');
      return;
    }

    const scoreEntries = acadSubjects.map((sub) => ({
      id: sub.id,
      name: sub.name,
      score: subjectExamScores[sub.name] ?? null,
    }));
    const hasExamScores = scoreEntries.some((s) => s.score !== null);
    const newAcadMap = {};

    if (hasExamScores) {
      const weights = scoreEntries.map((s) => ({
        id: s.id,
        weight: Math.max(5, 100 - (s.score !== null ? s.score : 60) + 5),
      }));
      const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
      let allocated = 0;
      weights.forEach((w, idx) => {
        if (idx === weights.length - 1) {
          newAcadMap[w.id] = Math.max(1, acadBudget - allocated);
        } else {
          const p = Math.max(1, Math.round((w.weight / totalWeight) * acadBudget));
          newAcadMap[w.id] = p;
          allocated += p;
        }
      });
    } else {
      const base = Math.floor(acadBudget / acadSubjects.length);
      let rem = acadBudget % acadSubjects.length;
      acadSubjects.forEach((sub) => {
        newAcadMap[sub.id] = Math.max(1, base + (rem-- > 0 ? 1 : 0));
      });
    }

    setAcademicPeriods(newAcadMap);
    setAiSuggested(true);
    toast.success(
      hasExamScores
        ? `AI distributed ${acadBudget} periods by exam averages, 1 each for activities.`
        : `Even split across ${acadSubjects.length} subjects, 1 period each for activities.`
    );
  };

  const handleSave = async () => {
    if (!selectedClass) { toast.error('Please select a class first'); return; }
    if (periodBudget !== null && totalAllPeriods > periodBudget) {
      toast.error(`Total periods (${totalAllPeriods}) exceeds the budget (${periodBudget}). Please reduce before saving.`);
      return;
    }

    setSaving(true);
    try {
      const periodEntries = subjectsList.map((sub) => ({
        subject_id: Number(sub.id),
        periods_per_week: Number(getPeriod(sub)),
      }));
      await subjectsAPI.savePeriods({
        class_id: Number(selectedClass),
        section_id: selectedSection ? Number(selectedSection) : undefined,
        periods: periodEntries,
      });
      toast.success('Period allocations saved successfully!');
      setAiSuggested(false);
      loadSubjects();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save period allocations');
    } finally {
      setSaving(false);
    }
  };

  const overBudget = periodBudget !== null && totalAllPeriods > periodBudget;
  const atBudget = periodBudget !== null && totalAllPeriods === periodBudget;

  return (
    <div className="space-y-4 text-xs">
      {/* Top Action Bar */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#EAF3F0] rounded-lg text-[#2F6F5E]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-[#14213D]">Weekly Subject Period Allocations</h2>
            <p className="text-gray-500 text-xs">Set required weekly periods per subject with AI exam-average suggestions</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-40">
            <Select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(''); }}
              options={[
                { value: '', label: 'Select Class...' },
                ...classes.map((c) => ({ value: c.id, label: c.class_name })),
              ]}
            />
          </div>
          <div className="w-44">
            <Select
              disabled={!selectedClass}
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              options={[
                { value: '', label: 'All Sections (Class Default)' },
                ...selectedSections.map((s) => ({ value: s.id, label: `Section ${s.name}` })),
              ]}
            />
          </div>
          {selectedClass && (
            <Button
              variant="primary"
              disabled={saving || loading || overBudget}
              onClick={handleSave}
              className="bg-[#2F6F5E] hover:bg-[#245749] text-white"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? 'Saving...' : 'Save Allocation'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {!selectedClass ? (
        <Card className="p-12">
          <EmptyState icon={Calendar} title="Select a Class" description="Choose a class from the dropdown above to configure subject periods per week." />
        </Card>
      ) : loading ? (
        <Card className="p-8 text-center text-gray-500">Loading subject details...</Card>
      ) : subjectsList.length === 0 ? (
        <EmptyState icon={AlertCircle} title="No Subjects Assigned" description="No subjects have been assigned to this class yet. Assign subjects in Subjects Manager first." />
      ) : (
        <div className="space-y-4">
          {/* AI Toolbar */}
          <Card className="border-[#E4E1D8] bg-[#FAFAF8] shadow-xs">
            <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-800">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#14213D] text-xs">Weak-Subject AI Period Allocation Engine</h3>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {periodBudget !== null && (
                  <span className="text-xs text-[#52607D] bg-white border border-[#E4E1D8] px-3 py-1.5 rounded-lg">
                    <span className="font-bold text-[#14213D]">{periodBudget}</span> periods / week
                  </span>
                )}
                <Button onClick={handleSuggestAIDistribution} className="bg-[#14213D] hover:bg-[#1E2D4A] text-white">
                  <Wand2 className="w-4 h-4 mr-1.5 text-amber-400" />
                  Suggest AI Distribution
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Unified Subject List */}
          <Card className="border-[#E4E1D8]">
            <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8] flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2F6F5E]" />
                <CardTitle className="text-sm font-bold text-[#14213D]">
                  All Subjects ({subjectsList.length})
                </CardTitle>
                {subjectsList.some((s) => s.subject_type === 'co_curricular') && (
                  <span className="text-[10px] text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded font-medium">
                    violet = activity
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-gray-500">Total Periods:</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  overBudget ? 'bg-red-100 text-red-800'
                    : atBudget ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {totalAllPeriods}{periodBudget !== null ? ` / ${periodBudget}` : ''} periods/wk
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#E4E1D8]">
                {subjectsList.map((sub) => {
                  const isCo = sub.subject_type === 'co_curricular';
                  const examScore = !isCo ? (subjectExamScores[sub.name] ?? null) : null;
                  const currentP = getPeriod(sub);

                  return (
                    <div
                      key={sub.id}
                      className={`p-3 flex items-center justify-between transition-colors ${isCo ? 'hover:bg-violet-50/40' : 'hover:bg-[#FAFAF8]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded font-mono font-bold text-[11px] flex items-center justify-center ${
                          isCo ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {sub.code || (sub.name?.substring(0, 3) || 'SUB').toUpperCase()}
                        </span>
                        <div>
                          <h4 className="font-bold text-[#14213D] text-xs flex items-center gap-1.5">
                            {sub.name}
                            {isCo && (
                              <span className="text-[9px] font-normal text-violet-700 bg-violet-50 border border-violet-200 px-1 py-0.5 rounded">
                                Activity
                              </span>
                            )}
                          </h4>
                          {!isCo && (
                            <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                              {examScore !== null ? (
                                <span className={`px-1.5 py-0.5 rounded font-medium ${examScore < 50 ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                  Exam Avg: {examScore}%
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">No Exam Marks</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {aiSuggested && (
                          <span className="text-[10px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> AI
                          </span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={0}
                            max={periodBudget ?? 99}
                            value={currentP}
                            onChange={(e) => handlePeriodChange(sub, e.target.value)}
                            className={`w-16 text-center font-bold text-sm py-1 ${
                              isCo ? 'border-violet-200 focus:border-violet-500' : 'border-[#E4E1D8] focus:border-[#2F6F5E]'
                            }`}
                          />
                          <span className="text-gray-500 font-medium">p/wk</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {overBudget && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-[11px] font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Total exceeds the {periodBudget} period/week budget from your Daily Schedule template. Reduce periods before saving.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
