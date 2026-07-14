import React, { useState, useEffect } from 'react';
import { academicYearsAPI, studentsAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Calendar, Plus, ChevronRight, AlertTriangle, CheckCircle, RefreshCw, ArrowRight, UserCheck, ShieldAlert, GraduationCap, XCircle, Search, Sparkles } from 'lucide-react';
import './AcademicYear.css';

export function AcademicYearManager() {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const toast = useToast();

  const currentSystemYear = new Date().getFullYear();

  // Create Year Form state using Year & Month selections
  const [createYears, setCreateYears] = useState({
    startYear: currentSystemYear,
    startMonth: 6, // June
    endYear: currentSystemYear + 1,
    endMonth: 4, // April
  });

  // Wizard Year Form state using Year & Month selections
  const [wizardYears, setWizardYears] = useState({
    startYear: currentSystemYear + 1,
    startMonth: 6,
    endYear: currentSystemYear + 2,
    endMonth: 4,
  });
  const [studentsList, setStudentsList] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [repeatStudentIds, setRepeatStudentIds] = useState([]);
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
      setAcademicYears(res || []);
    } catch (e) {
      toast.error('Failed to load academic years');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateYear = async (e) => {
    e.preventDefault();
    const start_date = `${createYears.startYear}-${String(createYears.startMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(createYears.endYear, createYears.endMonth, 0).getDate();
    const end_date = `${createYears.endYear}-${String(createYears.endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const name = `${createYears.startYear}-${createYears.endYear}`;

    try {
      await academicYearsAPI.create({ name, start_date, end_date });
      toast.success('Academic Year created successfully');
      setShowCreate(false);
      loadAcademicYears();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create academic year');
    }
  };

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

    // Parse current active academic year or max configured year to default the wizard next year
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
      const maxYear = academicYears.reduce((max, y) => new Date(y.start_date) > new Date(max.start_date) ? y : max, academicYears[0]);
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

    setRepeatStudentIds([]);
    setConfirmCheckbox(false);
    setPreviewReport(null);

    // Fetch active students for failures list
    setStudentsLoading(true);
    try {
      const res = await studentsAPI.getOptions();
      setStudentsList(res.items || []);
    } catch (e) {
      toast.error('Failed to load students list');
    } finally {
      setStudentsLoading(false);
    }
  };

  const toggleRepeatStudent = (id) => {
    setRepeatStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const fetchPreviewReport = async () => {
    setPreviewLoading(true);
    setWizardStep(3);
    try {
      const res = await academicYearsAPI.getPreview({ repeat_student_ids: repeatStudentIds });
      setPreviewReport(res);
    } catch (e) {
      toast.error('Failed to generate promotion preview');
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

  const currentYear = academicYears.find((y) => y.is_current);

  const filteredStudents = studentsList.filter((s) => {
    const name = (s.user?.name || '').toLowerCase();
    const username = (s.user?.username || '').toLowerCase();
    const roll = String(s.roll_no || '').toLowerCase();
    const query = searchStudent.toLowerCase();
    return name.includes(query) || username.includes(query) || roll.includes(query);
  });

  return (
    <div className="ay-page animate-fade-in">
      {/* Hero Section */}
      <section className="ay-hero">
        <div className="ay-hero-copy">
          <div className="ay-kicker">
            <Sparkles size={16} />
            Academic Operations
          </div>
          <h1>Academic Year</h1>
          <p>Configure year mappings, student promotions, and graduation lifecycle settings.</p>
        </div>
        <div className="ay-actions">
          <button onClick={() => setShowCreate(true)} className="ay-btn ay-btn-soft">
            <Plus size={18} />
            Create Academic Year
          </button>
          <button onClick={startWizard} className="ay-btn ay-btn-primary">
            Start Promotion Wizard
          </button>
        </div>
      </section>

      {/* Stats Cards Row */}
      <section className="ay-stats">
        {currentYear ? (
          <div className="ay-stat-card ay-stat-card-active">
            <span>Active Year</span>
            <strong>{currentYear.name}</strong>
          </div>
        ) : (
          <div className="ay-stat-card" style={{ borderColor: '#fecdd3', background: '#fff1f2' }}>
            <span style={{ color: '#be123c' }}>Active Year</span>
            <strong style={{ color: '#be123c' }}>No Active Year</strong>
          </div>
        )}
        <div className="ay-stat-card">
          <span>Configured Years</span>
          <strong>{academicYears.length}</strong>
        </div>
        <div className="ay-stat-card">
          <span>Duration Schedule</span>
          <span style={{ marginTop: '8px', color: '#475569', fontSize: '13px', textTransform: 'none', fontWeight: 600 }}>
            {currentYear 
              ? `${new Date(currentYear.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })} - ${new Date(currentYear.end_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}`
              : '—'
            }
          </span>
        </div>
      </section>

      {/* Academic Years List */}
      <div className="ay-table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: '#4f46e5' }} />
            <span style={{ fontWeight: 700 }}>Loading academic years...</span>
          </div>
        ) : academicYears.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
            No academic years found. Use the composer to create one.
          </div>
        ) : (
          <table className="ay-table">
            <thead>
              <tr>
                <th>Year Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th style={{ textRight: 'true', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {academicYears.map((year) => (
                <tr key={year.id} className={year.is_current ? 'active-row' : ''}>
                  <td style={{ color: '#0f172a', fontWeight: 800 }}>{year.name}</td>
                  <td>{new Date(year.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                  <td>{new Date(year.end_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                  <td>
                    {year.is_current ? (
                      <span className="ay-badge ay-badge-active">
                        <CheckCircle size={14} /> Current Active
                      </span>
                    ) : (
                      <span className="ay-badge ay-badge-inactive">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!year.is_current && (
                      <button
                        onClick={() => handleSetCurrent(year.id)}
                        className="ay-btn ay-btn-soft"
                        style={{ minHeight: '32px', padding: '0 12px', borderRadius: '10px', fontSize: '12px' }}
                      >
                        Set as Current
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Year Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Academic Year">
        <form onSubmit={handleCreateYear} className="space-y-4" style={{ padding: '4px' }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="ay-form-group">
              <label className="ay-label">Start Year</label>
              <select
                className="ay-input"
                value={createYears.startYear}
                onChange={(e) => {
                  const y = parseInt(e.target.value);
                  setCreateYears({ ...createYears, startYear: y, endYear: y + 1 });
                }}
              >
                {Array.from({ length: 16 }, (_, i) => 2020 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="ay-form-group">
              <label className="ay-label">Start Month</label>
              <select
                className="ay-input"
                value={createYears.startMonth}
                onChange={(e) => setCreateYears({ ...createYears, startMonth: parseInt(e.target.value) })}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="ay-form-group">
              <label className="ay-label">End Year</label>
              <select
                className="ay-input"
                value={createYears.endYear}
                onChange={(e) => setCreateYears({ ...createYears, endYear: parseInt(e.target.value) })}
              >
                {Array.from({ length: 16 }, (_, i) => 2020 + i).map((y) => (
                  <option key={y} value={y} disabled={y <= createYears.startYear}>{y}</option>
                ))}
              </select>
            </div>
            <div className="ay-form-group">
              <label className="ay-label">End Month</label>
              <select
                className="ay-input"
                value={createYears.endMonth}
                onChange={(e) => setCreateYears({ ...createYears, endMonth: parseInt(e.target.value) })}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Academic Year Name Preview: </span>
            <strong style={{ color: '#4f46e5', fontWeight: 800 }}>{createYears.startYear}-{createYears.endYear}</strong>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="ay-btn ay-btn-soft"
              style={{ minHeight: '38px', borderRadius: '12px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ay-btn ay-btn-primary"
              style={{ minHeight: '38px', borderRadius: '12px' }}
            >
              Create Year
            </button>
          </div>
        </form>
      </Modal>

      {/* Promotion Wizard Full Modal */}
      <Modal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        title="Promotion & Graduation Wizard"
        maxWidth="max-w-4xl"
      >
        <div style={{ padding: '4px' }}>
          {/* Header Steps */}
          <div className="ay-wizard-steps">
            <div className="flex items-center w-full">
              {/* Step 1 */}
              <div className={`ay-wizard-step ${wizardStep === 1 ? 'active' : ''}`}>
                <div className="ay-wizard-step-num">1</div>
                <span className="ay-wizard-step-label">Parameters</span>
              </div>
              
              <div className="ay-wizard-line">
                <div className="ay-wizard-line-fill" style={{ width: wizardStep > 1 ? '100%' : '0%' }} />
              </div>

              {/* Step 2 */}
              <div className={`ay-wizard-step ${wizardStep === 2 ? 'active' : ''}`}>
                <div className="ay-wizard-step-num">2</div>
                <span className="ay-wizard-step-label">Deselect Repeats</span>
              </div>

              <div className="ay-wizard-line">
                <div className="ay-wizard-line-fill" style={{ width: wizardStep > 2 ? '100%' : '0%' }} />
              </div>

              {/* Step 3 */}
              <div className={`ay-wizard-step ${wizardStep === 3 ? 'active' : ''}`}>
                <div className="ay-wizard-step-num">3</div>
                <span className="ay-wizard-step-label">Preview Report</span>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', marginLeft: '24px', whiteSpace: 'nowrap' }}>
              Step {wizardStep} of 3
            </span>
          </div>

          {/* STEP 1: PARAMETERS */}
          {wizardStep === 1 && (
            <div className="space-y-5">
              <div className="ay-callout ay-callout-warning">
                <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                <div>
                  <h4>Irreversible System Action</h4>
                  <p>Promoting the academic year migrates all active student profiles in the school to their next grade placement. Ensure classes and target sections are configured first in the registry.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="ay-form-group">
                  <label className="ay-label">Next Year - Start Year</label>
                  <select
                    className="ay-input"
                    value={wizardYears.startYear}
                    onChange={(e) => {
                      const y = parseInt(e.target.value);
                      setWizardYears({ ...wizardYears, startYear: y, endYear: y + 1 });
                    }}
                  >
                    {Array.from({ length: 16 }, (_, i) => 2020 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="ay-form-group">
                  <label className="ay-label">Start Month</label>
                  <select
                    className="ay-input"
                    value={wizardYears.startMonth}
                    onChange={(e) => setWizardYears({ ...wizardYears, startMonth: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="ay-form-group">
                  <label className="ay-label">Next Year - End Year</label>
                  <select
                    className="ay-input"
                    value={wizardYears.endYear}
                    onChange={(e) => setWizardYears({ ...wizardYears, endYear: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: 16 }, (_, i) => 2020 + i).map((y) => (
                      <option key={y} value={y} disabled={y <= wizardYears.startYear}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="ay-form-group">
                  <label className="ay-label">End Month</label>
                  <select
                    className="ay-input"
                    value={wizardYears.endMonth}
                    onChange={(e) => setWizardYears({ ...wizardYears, endMonth: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Next Academic Year Name: </span>
                <strong style={{ color: '#4f46e5', fontWeight: 800 }}>{wizardYears.startYear}-{wizardYears.endYear}</strong>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowWizard(false)} className="ay-btn ay-btn-soft">Cancel</button>
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="ay-btn ay-btn-primary"
                >
                  Next: Fail/Repeat List
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DESELECT REPEATS */}
          {wizardStep === 2 && (
            <div className="space-y-5">
              <div style={{ fontSize: '14px', color: '#475569', fontWeight: 650 }}>
                Check the boxes next to students who should **repeat** their current class grade (they will not be promoted). All unchecked students will progress.
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="notifications-search" style={{ flex: 1, minHeight: '42px', borderRadius: '12px' }}>
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search student by name or roll number..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                  />
                </div>
                {repeatStudentIds.length > 0 && (
                  <span className="ay-badge ay-badge-active" style={{ color: '#be123c', backgroundColor: '#fff1f2', borderColor: '#fecdd3', fontSize: '13px' }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" />
                    {repeatStudentIds.length} Repeaters selected
                  </span>
                )}
              </div>

              <div className="ay-table-card" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {studentsLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: '#4f46e5' }} />
                    <span style={{ fontWeight: 700 }}>Loading student registry...</span>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No active students found matching search</div>
                ) : (
                  <table className="ay-table">
                    <thead>
                      <tr style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                        <th width="60">Select</th>
                        <th>Name</th>
                        <th>Class & Section</th>
                        <th>Roll No</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s) => {
                        const isChecked = repeatStudentIds.includes(s.id);
                        return (
                          <tr key={s.id} className={isChecked ? 'active-row' : ''} style={isChecked ? { backgroundColor: '#fff1f2/40' } : {}}>
                            <td>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleRepeatStudent(s.id)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ color: '#0f172a', fontWeight: 800 }}>{s.user?.name || '—'}</td>
                            <td>{s.class?.class_name} - {s.section?.name}</td>
                            <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{s.roll_no || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setWizardStep(1)} className="ay-btn ay-btn-soft">Back</button>
                <button
                  type="button"
                  onClick={fetchPreviewReport}
                  className="ay-btn ay-btn-primary"
                >
                  Generate Preview Report
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW REPORT */}
          {wizardStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              {previewLoading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                  <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: '#4f46e5' }} />
                  <div style={{ spaceY: '6px' }}>
                    <h4 style={{ fontWeight: 850, color: '#0f172a', fontSize: '18px' }}>Generating Preview Report...</h4>
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>Analyzing class sizes, repeat counts, and matching next year section capacities...</p>
                  </div>
                </div>
              ) : previewReport ? (
                <>
                  {/* Validation Status Block */}
                  {!previewReport.isValid ? (
                    <div className="ay-callout ay-callout-error animate-shake">
                      <ShieldAlert size={24} style={{ flexShrink: 0 }} />
                      <div>
                        <h4>Target Section Mapping Missing</h4>
                        <p style={{ marginBottom: '8px' }}>The following classes or sections required for next year are missing in the database registry. Create them before promoting students.</p>
                        <div style={{ borderTop: '1px solid rgba(225, 29, 72, 0.2)', paddingTop: '8px', fontSize: '13px', fontWeight: 800 }}>
                          {previewReport.errors.map((err, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#be123c' }} />
                              <span dangerouslySetInnerHTML={{ __html: err }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="ay-callout ay-callout-success">
                      <CheckCircle size={24} style={{ flexShrink: 0 }} />
                      <div>
                        <h4>Verification Checklist Clean</h4>
                        <p>All target classroom sections verified successfully. Ready to trigger database migration.</p>
                      </div>
                    </div>
                  )}

                  {/* Summary Cards Grid */}
                  <div className="ay-wizard-grid">
                    <div className="ay-wizard-stat-card">
                      <span>Total Active</span>
                      <strong>{previewReport.totals?.total_active || 0}</strong>
                    </div>
                    <div className="ay-wizard-stat-card stat-promoted">
                      <span>Promoted</span>
                      <strong>{previewReport.totals?.promoted || 0}</strong>
                    </div>
                    <div className="ay-wizard-stat-card stat-graduating">
                      <span>Graduating</span>
                      <strong>{previewReport.totals?.graduating || 0}</strong>
                    </div>
                    <div className="ay-wizard-stat-card stat-repeating">
                      <span>Repeating</span>
                      <strong>{previewReport.totals?.repeating || 0}</strong>
                    </div>
                    <div className="ay-wizard-stat-card" style={{ padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <span style={{ fontSize: '10px' }}>Inactives</span>
                      <strong style={{ fontSize: '11px', marginTop: '2px', lineHeight: '1.2' }}>
                        Trans: {previewReport.totals?.transferred || 0} <br />
                        Drop: {previewReport.totals?.dropped || 0}
                      </strong>
                    </div>
                  </div>

                  {/* Transitions Table List */}
                  <div className="space-y-2">
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Target Placement Transitions</h4>
                    <div className="ay-table-card" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <table className="ay-table">
                        <thead>
                          <tr style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                            <th>Current Class</th>
                            <th>Next Year Class</th>
                            <th>Size</th>
                            <th>Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewReport.transitions?.map((t, idx) => (
                            <tr key={idx}>
                              <td style={{ color: '#0f172a', fontWeight: 800 }}>{t.fromClass} - {t.fromSection}</td>
                              <td style={{ fontWeight: 800 }}>
                                {t.isGraduation ? (
                                  <span className="ay-badge ay-badge-active" style={{ fontSize: '11px', padding: '2px 8px' }}>
                                    <GraduationCap size={12} /> Graduating
                                  </span>
                                ) : (
                                  <span style={{ color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ArrowRight size={12} style={{ color: '#94a3b8' }} />
                                    {t.toClass} - {t.toSection}
                                  </span>
                                )}
                              </td>
                              <td style={{ color: '#64748b', fontWeight: 600 }}>{t.count} students</td>
                              <td>
                                {t.hasError ? (
                                  <span className="ay-badge" style={{ color: '#be123c', backgroundColor: '#fff1f2', borderColor: '#fecdd3', fontSize: '11px', padding: '2px 8px', fontWeight: 800 }}>
                                    <XCircle size={12} /> Missing Map
                                  </span>
                                ) : t.isRepeat ? (
                                  <span className="ay-badge" style={{ color: '#be123c', backgroundColor: '#fff1f2', borderColor: '#fecdd3', fontSize: '11px', padding: '2px 8px', fontWeight: 800 }}>Repeaters</span>
                                ) : t.isGraduation ? (
                                  <span className="ay-badge ay-badge-active" style={{ fontSize: '11px', padding: '2px 8px' }}>Graduation</span>
                                ) : (
                                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Standard</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Irreversible Confirmation Checkbox Box */}
                  {previewReport.isValid && (
                    <div style={{ padding: '16px', borderRadius: '18px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                      <label style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={confirmCheckbox}
                          onChange={(e) => setConfirmCheckbox(e.target.checked)}
                          style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '2px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 750, color: '#475569', lineHeight: '1.45' }}>
                          I confirm that I want to finalize student placements for {previewReport.totals?.promoted} students into {nextYearForm.next_year_name} and graduate {previewReport.totals?.graduating} senior-most Class 12 students. I understand that this migration process is irreversible and updates the current active workspace.
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="ay-btn ay-btn-soft"
                    >
                      Back
                    </button>
                    {previewReport.isValid ? (
                      <button
                        type="button"
                        disabled={!confirmCheckbox || promoting}
                        onClick={handleExecutePromotion}
                        className="ay-btn ay-btn-primary"
                        style={{ minHeight: '44px' }}
                      >
                        {promoting ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" /> Promoting...
                          </>
                        ) : (
                          <>
                            <UserCheck size={16} /> Execute Promotion Wizard
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="ay-btn"
                        style={{ color: '#94a3b8', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                      >
                        Cannot Promote (Resolve Mappings)
                      </button>
                    )}
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
