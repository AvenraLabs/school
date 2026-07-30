import React, { useState, useEffect } from 'react';
import { academicYearsAPI, studentsAPI, classesAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Select, Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatsCard } from '../../components/common/StatsCard';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Plus,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  GraduationCap,
  XCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '../../utils/date';

export function AcademicYearManager() {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardEnabled, setWizardEnabled] = useState(true);
  const toast = useToast();

  const currentSystemYear = new Date().getFullYear();

  const [wizardYears, setWizardYears] = useState({
    startYear: currentSystemYear + 1,
    startMonth: 6,
    endYear: currentSystemYear + 2,
    endMonth: 4,
  });

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [repeatStudents, setRepeatStudents] = useState([]);
  const repeatStudentIds = repeatStudents.map((s) => s.id);

  const [studentsList, setStudentsList] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [previewReport, setPreviewReport] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    setLoading(true);
    try {
      const res = await academicYearsAPI.list();
      setAcademicYears(res?.years || []);
      setWizardEnabled(res?.promotion_wizard_enabled !== false);
    } catch (e) {
      toast.error('Failed to load academic years');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = academicYears.find((y) => y.is_current);

  const handleSetCurrent = async (id) => {
    try {
      await academicYearsAPI.setCurrent(id);
      toast.success('Current academic year updated');
      loadAcademicYears();
    } catch (e) {
      toast.error('Failed to set current academic year');
    }
  };

  const startWizard = async () => {
    setShowWizard(true);
    setWizardStep(1);

    let nextStartYear = currentSystemYear;
    if (currentYear && currentYear.name) {
      const parts = currentYear.name.split('-');
      if (parts.length === 2) {
        const parsed = parseInt(parts[1]);
        if (!isNaN(parsed)) {
          nextStartYear = parsed;
        }
      }
    } else if (academicYears.length > 0) {
      const maxYear = academicYears.reduce((max, y) => (new Date(y.start_date) > new Date(max.start_date) ? y : max), academicYears[0]);
      if (maxYear && maxYear.name) {
        const parts = maxYear.name.split('-');
        if (parts.length === 2) {
          const parsed = parseInt(parts[1]);
          if (!isNaN(parsed)) {
            nextStartYear = parsed;
          }
        }
      }
    }

    setWizardYears({
      startYear: nextStartYear,
      startMonth: 6,
      endYear: nextStartYear + 1,
      endMonth: 4,
    });

    setRepeatStudents([]);
    setConfirmCheckbox(false);
    setPreviewReport(null);
    setSelectedClassId('');
    setSelectedSectionId('');
    setStudentsList([]);

    try {
      const res = await classesAPI.list();
      const rawClasses = res.items || res.data || (Array.isArray(res) ? res : []);
      setClasses(rawClasses);
    } catch (e) {
      toast.error('Failed to load classes');
    }
  };

  const toggleRepeatStudent = (student) => {
    setRepeatStudents((prev) => {
      const exists = prev.some((s) => s.id === student.id);
      if (exists) {
        return prev.filter((s) => s.id !== student.id);
      } else {
        return [
          ...prev,
          {
            id: student.id,
            name: student.user?.name || 'Student',
            class_name: student.class?.class_name || '',
            section_name: student.section?.name || '',
          },
        ];
      }
    });
  };

  useEffect(() => {
    if (!showWizard || wizardStep !== 2) return;
    if (!selectedClassId || !selectedSectionId) {
      setStudentsList([]);
      return;
    }

    const loadSectionStudents = async () => {
      setStudentsLoading(true);
      try {
        const res = await studentsAPI.getOptions(Number(selectedClassId), Number(selectedSectionId));
        setStudentsList(res.items || res || []);
      } catch (e) {
        toast.error('Failed to load students list');
      } finally {
        setStudentsLoading(false);
      }
    };

    loadSectionStudents();
  }, [selectedClassId, selectedSectionId, showWizard, wizardStep]);

  const [customOverrides, setCustomOverrides] = useState({});

  const fetchPreviewReport = async (overrideData = customOverrides) => {
    // If overrideData is a React SyntheticEvent, fallback to customOverrides
    const actualOverrides = (overrideData && !overrideData.nativeEvent && !overrideData._reactName && typeof overrideData === 'object')
      ? overrideData
      : customOverrides;

    setPreviewLoading(true);
    setWizardStep(3);
    try {
      const res = await academicYearsAPI.getPreview({
        repeat_student_ids: repeatStudentIds,
        custom_overrides: actualOverrides,
      });
      setPreviewReport(res);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to generate promotion preview');
      setWizardStep(2);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExecutePromotion = async () => {
    if (!confirmCheckbox) {
      toast.error('Please confirm the warning checkbox first');
      return;
    }
    setPromoting(true);

    const start_date = `${wizardYears.startYear}-${String(wizardYears.startMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(wizardYears.endYear, wizardYears.endMonth, 0).getDate();
    const end_date = `${wizardYears.endYear}-${String(wizardYears.endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const next_year_name = `${wizardYears.startYear}-${wizardYears.endYear}`;

    try {
      await academicYearsAPI.promote({
        next_year_name,
        start_date,
        end_date,
        repeat_student_ids: repeatStudentIds,
        custom_overrides: customOverrides,
      });
      toast.success('Promotion completed transactionally!');
      setShowWizard(false);
      loadAcademicYears();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Promotion failed');
    } finally {
      setPromoting(false);
    }
  };

  const filteredStudents = studentsList.filter((s) => {
    const name = (s.user?.name || '').toLowerCase();
    const username = (s.user?.username || '').toLowerCase();
    const roll = String(s.roll_no || '').toLowerCase();
    const query = searchStudent.toLowerCase();
    return name.includes(query) || username.includes(query) || roll.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14213D]">Academic Sessions & Year Transitions</span>
            <span className="text-[#8C97AB]">|</span>
            <span className="text-[#52607D]">Active: {currentYear ? currentYear.name : 'None'}</span>
          </div>
          {wizardEnabled && (
            <Button variant="primary" size="sm" icon={Sparkles} onClick={startWizard}>
              Start Promotion Wizard
            </Button>
          )}
        </div>
      </Card>

      {!wizardEnabled && (
        <div className="p-4 bg-[#FDF2F1] border border-[#F8D7D5] rounded-[10px] flex items-center gap-3 text-xs text-[#B0403A]">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Promotion Wizard Locked</p>
            <p>Annual student promotions are locked. Contact support to renew institutional license.</p>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Active Academic Year"
          value={currentYear ? currentYear.name : 'None'}
          icon={Calendar}
          subtext={currentYear ? `${formatDate(currentYear.start_date)} - ${formatDate(currentYear.end_date)}` : 'No active term'}
          active={true}
        />
        <StatsCard
          title="Total Configured Years"
          value={academicYears.length}
          icon={Sparkles}
          subtext="Configured session records"
        />
        <StatsCard
          title="Promotion Wizard Status"
          value={wizardEnabled ? 'Ready' : 'Locked'}
          icon={UserCheck}
          subtext={wizardEnabled ? 'Transactional batch engine ready' : 'Requires license key'}
        />
      </div>

      {/* Academic Years Table */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Sessions Roster</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Year Name</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-4 py-3.5">
                      <div className="h-4 bg-[#EAF3F0] rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : academicYears.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <EmptyState
                      icon={Calendar}
                      title="No academic years found"
                      description="Start the promotion wizard to establish your first academic term."
                    />
                  </td>
                </tr>
              ) : (
                academicYears.map((year) => (
                  <tr key={year.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3 font-display font-bold text-[#14213D]">{year.name}</td>
                    <td className="px-4 py-3 font-mono">{formatDate(year.start_date)}</td>
                    <td className="px-4 py-3 font-mono">{formatDate(year.end_date)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={year.is_current ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!year.is_current && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetCurrent(year.id)}
                        >
                          Set as Current Active
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Promotion Wizard Modal */}
      <Modal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        title="Annual Promotion & Graduation Wizard"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-5 text-xs">
          {/* Stepper Bar */}
          <div className="p-3 bg-[#FAFAF8] border border-[#E4E1D8] rounded-[8px] flex items-center justify-between">
            {['1. Session Dates', '2. Repeaters List', '3. Preview & Execute'].map((stepName, i) => (
              <span
                key={i}
                className={`font-semibold ${
                  wizardStep === i + 1 ? 'text-[#2F6F5E] underline' : 'text-[#8C97AB]'
                }`}
              >
                {stepName}
              </span>
            ))}
          </div>

          {/* Step 1 */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div className="p-3 bg-[#FDF8EC] border border-[#F7E7C4] rounded-[8px] text-[#B8860B] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Promoting academic year migrates all active student profiles to next grade placements.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#14213D] mb-1">Start Year</label>
                  <Select
                    value={wizardYears.startYear}
                    onChange={(e) => {
                      const y = parseInt(e.target.value);
                      setWizardYears({ ...wizardYears, startYear: y, endYear: y + 1 });
                    }}
                  >
                    {Array.from({ length: 10 }, (_, i) => currentSystemYear - 2 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block font-semibold text-[#14213D] mb-1">Start Month</label>
                  <Select
                    value={wizardYears.startMonth}
                    onChange={(e) => setWizardYears({ ...wizardYears, startMonth: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#14213D] mb-1">End Year</label>
                  <Select
                    value={wizardYears.endYear}
                    onChange={(e) => setWizardYears({ ...wizardYears, endYear: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: 10 }, (_, i) => currentSystemYear - 2 + i).map((y) => (
                      <option key={y} value={y} disabled={y <= wizardYears.startYear}>{y}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block font-semibold text-[#14213D] mb-1">End Month</label>
                  <Select
                    value={wizardYears.endMonth}
                    onChange={(e) => setWizardYears({ ...wizardYears, endMonth: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
                <Button variant="outline" onClick={() => setShowWizard(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setWizardStep(2)}>Next: Select Repeaters</Button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <p className="text-[#52607D]">Select any students who will repeat their current class (they will not be promoted).</p>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={selectedClassId}
                  onChange={(e) => { setSelectedClassId(e.target.value); setSelectedSectionId(''); }}
                >
                  <option value="">Select Class...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.class_name || c.name || `Class ${c.id}`}
                    </option>
                  ))}
                </Select>
                <Select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  disabled={!selectedClassId}
                >
                  <option value="">Select Section...</option>
                  {(classes.find((c) => String(c.id) === String(selectedClassId))?.sections || []).map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      Section {sec.section_name || sec.name || sec.sectionName || sec.id}
                    </option>
                  ))}
                </Select>
              </div>

              {filteredStudents.length > 0 && (
                <div className="border border-[#E4E1D8] rounded-[8px] overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8]">
                      <tr>
                        <th className="px-3 py-2 w-10">Select</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Roll No</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDEAE1]">
                      {filteredStudents.map((s) => {
                        const isChecked = repeatStudentIds.includes(s.id);
                        return (
                          <tr key={s.id}>
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleRepeatStudent(s)}
                                className="w-4 h-4 rounded border-[#E4E1D8] text-[#2F6F5E] accent-[#2F6F5E] focus:ring-[#2F6F5E] cursor-pointer"
                              />
                            </td>
                            <td className="px-3 py-2 font-semibold">{s.user?.name || '—'}</td>
                            <td className="px-3 py-2 font-mono text-[#8C97AB]">{s.roll_no || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-[#EDEAE1]">
                <Button variant="outline" onClick={() => setWizardStep(1)}>Back</Button>
                <Button variant="primary" onClick={() => fetchPreviewReport()}>Generate Preview Report</Button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              {previewLoading ? (
                <div className="p-8 text-center text-[#8C97AB]">Generating promotion report preview...</div>
              ) : previewReport ? (
                <>
                  {previewReport.errors && previewReport.errors.length > 0 ? (
                    <div className="p-3 bg-[#FDF2F1] border border-[#F8D7D5] rounded-[8px] text-[#B0403A] text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Section Mapping Warnings Found ({previewReport.errors.length})
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px]">
                        {previewReport.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#EAF3F0] border border-[#D3E6E0] rounded-[8px] text-[#2F6F5E]">
                      <p className="font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> All Target Class & Section Mappings Verified Clean
                      </p>
                      <p className="text-[11px]">Ready to process transactional academic promotion for {previewReport.totals?.promoted || 0} students.</p>
                    </div>
                  )}

                  {/* Summary Badges */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-[#EAF3F0] border border-[#D3E6E0] rounded-[8px]">
                      <div className="text-[#8C97AB] font-mono text-[10px] uppercase font-semibold">Promoted</div>
                      <div className="text-base font-black text-[#2F6F5E]">{previewReport.totals?.promoted || 0}</div>
                    </div>
                    <div className="p-2 bg-[#FDF8EC] border border-[#F7E7C4] rounded-[8px]">
                      <div className="text-[#8C97AB] font-mono text-[10px] uppercase font-semibold">Graduating</div>
                      <div className="text-base font-black text-[#B8860B]">{previewReport.totals?.graduating || 0}</div>
                    </div>
                    <div className="p-2 bg-[#F3F4F6] border border-[#E5E7EB] rounded-[8px]">
                      <div className="text-[#8C97AB] font-mono text-[10px] uppercase font-semibold">Repeating</div>
                      <div className="text-base font-black text-[#4B5563]">{previewReport.totals?.repeating || 0}</div>
                    </div>
                    <div className="p-2 bg-[#FAFAF8] border border-[#E4E1D8] rounded-[8px]">
                      <div className="text-[#8C97AB] font-mono text-[10px] uppercase font-semibold">Active Total</div>
                      <div className="text-base font-black text-[#14213D]">{previewReport.totals?.total_active || 0}</div>
                    </div>
                  </div>

                  {/* Transitions Breakdown */}
                  {previewReport.transitions && previewReport.transitions.length > 0 && (
                    <div className="border border-[#E4E1D8] rounded-[8px] overflow-hidden max-h-52 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold">
                          <tr>
                            <th className="px-3 py-2">Current Class</th>
                            <th className="px-3 py-2">Target Grade Placement</th>
                            <th className="px-3 py-2 text-right">Student Count</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EDEAE1]">
                          {previewReport.transitions.map((t, idx) => (
                            <tr key={idx} className="hover:bg-[#FAFAF8]">
                              <td className="px-3 py-2 font-semibold text-[#14213D]">
                                {t.fromClass} — Sec {t.fromSection}
                              </td>
                              <td className="px-3 py-2 font-bold text-[#2F6F5E]">
                                {t.toClass} {t.toSection !== '—' ? `— Sec ${t.toSection}` : ''}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-bold">{t.count}</td>
                              <td className="px-3 py-2">
                                {t.hasError ? (
                                  <span className="text-[#B0403A] font-semibold text-[10px] uppercase">Missing Mapping</span>
                                ) : (
                                  <span className="text-[#2F6F5E] font-semibold text-[10px] uppercase">Clean</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={confirmCheckbox}
                      onChange={(e) => setConfirmCheckbox(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E4E1D8] text-[#2F6F5E] accent-[#2F6F5E] focus:ring-[#2F6F5E] cursor-pointer"
                    />
                    <span className="font-semibold text-[#14213D]">
                      I confirm promotion migration for term {wizardYears.startYear}-{wizardYears.endYear}.
                    </span>
                  </label>

                  <div className="flex justify-between pt-2 border-t border-[#EDEAE1]">
                    <Button variant="outline" onClick={() => setWizardStep(2)}>Back</Button>
                    <Button
                      variant="primary"
                      disabled={!confirmCheckbox || (previewReport.errors && previewReport.errors.length > 0)}
                      loading={promoting}
                      onClick={handleExecutePromotion}
                    >
                      Execute Annual Promotion
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
