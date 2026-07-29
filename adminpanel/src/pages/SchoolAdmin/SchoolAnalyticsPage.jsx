import { useState, useEffect } from 'react';
import { schoolAPI, classesAPI, sectionsAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Select, Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/common/Modal';
import { Award, AlertTriangle, TrendingDown, Users, BookOpen, Settings, Sliders, CheckCircle2 } from 'lucide-react';

export function SchoolAnalyticsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [riskAtt, setRiskAtt] = useState(75);
  const [riskAcad, setRiskAcad] = useState(40);
  const [riskDrop, setRiskDrop] = useState(15);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadSections(selectedClass);
    } else {
      setSections([]);
      setSelectedSection('');
    }
  }, [selectedClass]);

  useEffect(() => {
    loadAnalytics();
  }, [selectedClass, selectedSection]);

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch { /* ignore */ }
  };

  const loadSections = async (classId) => {
    try {
      const res = await sectionsAPI.listByClass(classId);
      const raw = res?.items || res?.rows || res?.data || res;
      setSections(Array.isArray(raw) ? raw : []);
    } catch { setSections([]); }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await schoolAPI.getSchoolAnalytics(
        selectedClass || undefined,
        selectedSection || undefined
      );
      const data = res?.data || res || {};
      setAnalytics(data);
      if (data?.thresholds) {
        setRiskAtt(data.thresholds.risk_attendance_cutoff ?? 75);
        setRiskAcad(data.thresholds.risk_academic_cutoff ?? 40);
        setRiskDrop(data.thresholds.risk_grade_drop_margin ?? 15);
      }
    } catch (err) {
      toast.error('Failed to load school analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await schoolAPI.updateMySettings({
        risk_attendance_cutoff: Number(riskAtt),
        risk_academic_cutoff: Number(riskAcad),
        risk_grade_drop_margin: Number(riskDrop),
      });
      toast.success('Risk threshold settings updated successfully');
      setShowSettingsModal(false);
      loadAnalytics();
    } catch {
      toast.error('Failed to update risk threshold settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const passTotal = analytics?.school_pass_fail?.total || 0;
  const passedCount = analytics?.school_pass_fail?.pass || 0;
  const failedCount = analytics?.school_pass_fail?.fail || 0;
  const overallPassRate = passTotal > 0 ? Math.round((passedCount / passTotal) * 100) : 0;

  const subjectDifficulty = analytics?.subject_difficulty || [];
  const hardestSubjectObj = subjectDifficulty.length > 0 ? subjectDifficulty[0] : null;
  const hardestSubjectName = hardestSubjectObj?.subject || 'None';
  const hardestSubjectAvg = hardestSubjectObj?.average ?? 0;

  const atRiskCount = analytics?.academics?.defaultersCount ??
    (analytics?.at_risk_students ? analytics.at_risk_students.length :
    (analytics?.at_risk_by_class ? analytics.at_risk_by_class.reduce((sum, c) => sum + (c.count || 0), 0) : 0));

  const classSectionAverages = (analytics?.section_comparison || []).map((s) => ({
    name: s.label || s.name || 'Section',
    average: Number(s.average || 0),
  }));

  const subjectAverages = (analytics?.subject_difficulty || []).map((s) => ({
    name: s.subject || s.name || 'Subject',
    average: Number(s.average || 0),
  }));

  return (
    <div className="space-y-6 text-xs">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-[#14213D]">Institutional Performance Analytics & Metrics</span>
          <Button
            variant="outline"
            size="sm"
            icon={Sliders}
            onClick={() => setShowSettingsModal(true)}
          >
            Configure Risk Thresholds
          </Button>
        </div>
      </Card>

      {/* Class & Section Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C97AB] mb-1 font-mono">
              CLASS FILTER
            </label>
            <Select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection('');
              }}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>Class {c.class_name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C97AB] mb-1 font-mono">
              SECTION FILTER
            </label>
            <Select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-center text-xs text-[#8C97AB]">Loading analytics data...</Card>
      ) : (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#52607D] font-mono">
                  OVERALL PASS RATE
                </span>
                <div className="font-display font-bold text-2xl text-[#14213D] mt-1">
                  {overallPassRate}%
                </div>
                <p className="text-[11px] text-[#8C97AB] mt-1">
                  {passedCount} passed • {failedCount} failing overall
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#52607D] font-mono">
                  HARDEST SUBJECT
                </span>
                <div className="font-display font-bold text-2xl text-[#14213D] mt-1">
                  {hardestSubjectAvg}%
                </div>
                <p className="text-[11px] text-[#8C97AB] mt-1">
                  {hardestSubjectName}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FDF2F1] text-[#B0403A] flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#52607D] font-mono">
                  AT-RISK STUDENTS
                </span>
                <div className="font-display font-bold text-2xl text-[#14213D] mt-1">
                  {atRiskCount}
                </div>
                <p className="text-[11px] text-[#8C97AB] mt-1">
                  Students flagged below 40% marks or 75% attendance
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FDF8EC] text-[#B8860B] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </Card>
          </div>

          {/* Breakdown Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class-Section Average Comparison */}
            <Card>
              <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
                <CardTitle className="text-xs font-bold text-[#14213D] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#2F6F5E]" /> Class-Section Average Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {classSectionAverages.length === 0 ? (
                  <p className="text-center text-[#8C97AB] py-6 italic text-xs">No exam marks entered for section comparison yet.</p>
                ) : (
                  classSectionAverages.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-[#14213D]">
                        <span>{item.name}</span>
                        <span>{item.average}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#EAF3F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2F6F5E] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, item.average))}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Subject Averages (Lowest First) */}
            <Card>
              <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
                <CardTitle className="text-xs font-bold text-[#14213D] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#2F6F5E]" /> Subject Averages (Lowest First)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {subjectAverages.length === 0 ? (
                  <p className="text-center text-[#8C97AB] py-6 italic text-xs">No exam subject marks recorded yet.</p>
                ) : (
                  subjectAverages.map((sub, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-[#14213D]">
                        <span>{sub.name}</span>
                        <span>{sub.average}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#EAF3F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2F6F5E] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, sub.average))}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Configure Risk Threshold Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Configure At-Risk Student Thresholds"
      >
        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <p className="text-[#52607D]">
            Set custom risk thresholds for your institution. Students falling below these cutoffs will automatically be flagged as At-Risk in analytics and dashboard reports.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#14213D] mb-1">
                Attendance Cutoff (%)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={riskAtt}
                onChange={(e) => setRiskAtt(e.target.value)}
                required
              />
              <span className="text-[10px] text-[#8C97AB] block mt-1">
                Students with attendance below this percentage are flagged for low attendance.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#14213D] mb-1">
                Academic Score Cutoff (%)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={riskAcad}
                onChange={(e) => setRiskAcad(e.target.value)}
                required
              />
              <span className="text-[10px] text-[#8C97AB] block mt-1">
                Students with overall exam score below this percentage are flagged for low academics.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#14213D] mb-1">
                Grade Drop Margin (%)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={riskDrop}
                onChange={(e) => setRiskDrop(e.target.value)}
                required
              />
              <span className="text-[10px] text-[#8C97AB] block mt-1">
                Students whose score drops by more than this percentage between consecutive exams are flagged for performance drop.
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EDEAE1]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsModal(false)}
              disabled={savingSettings}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={savingSettings}
              icon={CheckCircle2}
            >
              Save Thresholds
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
