import { useState, useEffect } from 'react';
import { schoolAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { getApiAssetUrl } from '../../api/axios';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Settings,
} from 'lucide-react';

const S = {
  container: {
    width: '100%',
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'Inter, sans-serif',
  },
  header: {
    marginBottom: '28px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  iconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1.1,
  },
  cardSub: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '6px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  rowGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
  },
  panel: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)',
  },
  progressRow: {
    marginBottom: '16px',
  },
  progressLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  progressLabelName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#334155',
  },
  progressLabelVal: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0f172a',
  },
  progressBarBg: {
    height: '8px',
    background: '#f1f5f9',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.6s ease',
  },
  alertCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    background: '#fef2f2',
    marginBottom: '12px',
  },
  alertTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#991b1b',
  },
  alertDesc: {
    fontSize: '12px',
    color: '#b91c1c',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#64748b',
  },
  twoColLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
  },
  filterBar: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '24px',
    background: '#ffffff',
    padding: '16px 20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    color: '#0f172a',
    outline: 'none',
    minWidth: '160px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
};

export function SchoolAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const toast = useToast();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formThresholds, setFormThresholds] = useState({
    risk_attendance_cutoff: 75,
    risk_academic_cutoff: 40,
    risk_grade_drop_margin: 15,
  });

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await schoolAPI.updateSchoolSettings(formThresholds);
      toast.success('At-risk thresholds updated successfully!');
      setShowSettingsModal(false);
      loadAnalytics(selectedClass, selectedSection);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadAnalytics(selectedClass, selectedSection);
  }, [selectedClass, selectedSection]);

  const loadAnalytics = async (classId = '', sectionId = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await schoolAPI.getSchoolAnalytics(classId, sectionId);
      if (res.success) {
        setData(res.data);
      } else {
        setError('Failed to fetch analytics.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div style={S.container}>
        <div style={{ height: '32px', width: '200px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '24px' }} />
        <div style={S.grid}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ ...S.card, height: '120px', background: '#f1f5f9', border: 'none' }} />
          ))}
        </div>
        <div style={{ ...S.panel, height: '300px', background: '#f1f5f9', border: 'none' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={S.container}>
        <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontWeight: 600 }}>
          {error || 'Analytics not available.'}
        </div>
      </div>
    );
  }

  const {
    section_comparison = [],
    student_comparison = [],
    subject_difficulty = [],
    school_pass_fail = { pass: 0, fail: 0, total: 0 },
    at_risk_by_class = [],
    at_risk_students = [],
    classes = [],
    sections = [],
  } = data;

  const passRate =
    school_pass_fail.total > 0
      ? Math.round((school_pass_fail.pass / school_pass_fail.total) * 100)
      : 0;

  const hardestSubject =
    (subject_difficulty || []).length > 0 ? subject_difficulty[0] : null;

  const availableSections = sections.filter(
    (sec) => String(sec.class_id) === String(selectedClass)
  );

  return (
    <div style={S.container}>
      {/* Header */}
      <div style={{ ...S.header, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={S.title}>School Performance Analytics</h1>
          <p style={S.subtitle}>Institutional report card, section comparisons, and subject analysis</p>
        </div>
        <button 
          onClick={() => {
            const th = data?.thresholds || { risk_attendance_cutoff: 75, risk_academic_cutoff: 40, risk_grade_drop_margin: 15 };
            setFormThresholds({
              risk_attendance_cutoff: th.risk_attendance_cutoff,
              risk_academic_cutoff: th.risk_academic_cutoff,
              risk_grade_drop_margin: th.risk_grade_drop_margin,
            });
            setShowSettingsModal(true);
          }}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s', color: '#334155' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
        >
          <Settings style={{ width: '16px', height: '16px', color: '#64748b' }} />
          Analytics Settings
        </button>
      </div>

      {/* Filter Bar */}
      <div style={S.filterBar}>
        <div style={S.filterGroup}>
          <label style={S.filterLabel}>Class Filter</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection(''); // Reset section on class change
            }}
            style={S.select}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                Class {cls.class_name}
              </option>
            ))}
          </select>
        </div>

        <div style={S.filterGroup}>
          <label style={S.filterLabel}>Section Filter</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{
              ...S.select,
              opacity: selectedClass ? 1 : 0.6,
              cursor: selectedClass ? 'pointer' : 'not-allowed',
            }}
            disabled={!selectedClass}
          >
            <option value="">All Sections</option>
            {availableSections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                Section {sec.name}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
            <span className="siq-spinner" />
            Loading analytics...
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div style={S.grid}>
        {/* Pass Rate */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>Overall Pass Rate</span>
            <div style={{ ...S.iconWrap, background: '#ecfdf5', color: '#10b981' }}>
              <Award style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div style={S.cardValue}>{passRate}%</div>
          <div style={S.cardSub}>
            {school_pass_fail.pass} passed • {school_pass_fail.fail} failing overall
          </div>
        </div>

        {/* Hardest Subject */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>Hardest Subject</span>
            <div style={{ ...S.iconWrap, background: '#fff1f2', color: '#f43f5e' }}>
              <TrendingDown style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div style={S.cardValue}>
            {hardestSubject ? `${hardestSubject.average}%` : 'N/A'}
          </div>
          <div style={S.cardSub}>
            {hardestSubject ? hardestSubject.subject : 'No subject marks recorded'}
          </div>
        </div>

        {/* At Risk Students */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>At-Risk Students</span>
            <div style={{ ...S.iconWrap, background: '#fffbeb', color: '#d97706' }}>
              <AlertTriangle style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div style={S.cardValue}>
            {selectedClass
              ? (at_risk_students || []).length
              : (at_risk_by_class || []).reduce((sum, c) => sum + c.count, 0)
            }
          </div>
          <div style={S.cardSub}>Students flagged below 40% marks or 75% attendance</div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={S.twoColLayout} className="lg:grid-cols-2 lg:gap-8">
        {/* Left Panel: Section Comparison or Student list */}
        <div style={S.panel}>
          {selectedClass && selectedSection ? (
            <>
              <h3 style={S.sectionTitle}>
                <Users style={{ width: '18px', height: '18px', color: '#6366f1' }} />
                Student Performance List
              </h3>
              {!student_comparison || student_comparison.length === 0 ? (
                <div style={S.emptyState}>No student marks available for this section yet.</div>
              ) : (
                student_comparison.map((student) => (
                  <div key={student.student_id} style={S.progressRow}>
                    <div style={S.progressLabels}>
                      <span style={S.progressLabelName}>{student.name}</span>
                      <span style={S.progressLabelVal}>{student.average}%</span>
                    </div>
                    <div style={S.progressBarBg}>
                      <div
                        style={{
                          ...S.progressBarFill,
                          width: `${student.average}%`,
                          background:
                            student.average >= 75
                              ? '#10b981'
                              : student.average >= 50
                              ? '#3b82f6'
                              : '#f43f5e',
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              <h3 style={S.sectionTitle}>
                <Users style={{ width: '18px', height: '18px', color: '#6366f1' }} />
                Class-Section Average Comparison
              </h3>
              {(section_comparison || []).length === 0 ? (
                <div style={S.emptyState}>No section data available yet.</div>
              ) : (
                (section_comparison || []).map((sec) => (
                  <div key={sec.section_id} style={S.progressRow}>
                    <div style={S.progressLabels}>
                      <span style={S.progressLabelName}>{sec.label}</span>
                      <span style={S.progressLabelVal}>{sec.average}%</span>
                    </div>
                    <div style={S.progressBarBg}>
                      <div
                        style={{
                          ...S.progressBarFill,
                          width: `${sec.average}%`,
                          background:
                            sec.average >= 75
                              ? '#10b981'
                              : sec.average >= 50
                              ? '#3b82f6'
                              : '#f43f5e',
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Right Panel: Subject Difficulty */}
        <div style={S.panel}>
          <h3 style={S.sectionTitle}>
            <BookOpen style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
            Subject Averages (Lowest First)
          </h3>
          {(subject_difficulty || []).length === 0 ? (
            <div style={S.emptyState}>No subject averages data available yet.</div>
          ) : (
            (subject_difficulty || []).map((sub) => (
              <div key={sub.subject} style={S.progressRow}>
                <div style={S.progressLabels}>
                  <span style={S.progressLabelName}>{sub.subject}</span>
                  <span style={S.progressLabelVal}>{sub.average}%</span>
                </div>
                <div style={S.progressBarBg}>
                  <div
                    style={{
                      ...S.progressBarFill,
                      width: `${sub.average}%`,
                      background:
                        sub.average >= 75
                          ? '#10b981'
                          : sub.average >= 50
                          ? '#3b82f6'
                          : '#f43f5e',
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Panel: At-Risk Breakdown (Count by class OR individual student cards) */}
        <div style={{ ...S.panel, gridColumn: 'span 1' }} className="lg:col-span-2">
          {selectedClass ? (
            <>
              <h3 style={S.sectionTitle}>
                <AlertTriangle style={{ width: '18px', height: '18px', color: '#e11d48' }} />
                At-Risk Students List
              </h3>
              {!at_risk_students || at_risk_students.length === 0 ? (
                <div style={S.emptyState}>No students are currently flagged as at-risk.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {at_risk_students.map((student) => (
                    <div key={student.student_id} style={{ ...S.card, padding: '16px', borderColor: '#fca5a5', background: '#fff5f5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#fee2e2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#991b1b',
                          fontSize: '14px',
                          overflow: 'hidden'
                        }}>
                          {student.avatar_url ? (
                            <img src={getApiAssetUrl(student.avatar_url)} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            (student.name || 'S')[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#991b1b' }}>{student.name}</div>
                          <div style={{ fontSize: '12px', color: '#b91c1c', display: 'flex', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                            {student.reasons.map((r, i) => (
                              <span key={i} style={{ background: '#fecaca', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>{r}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #fee2e2', paddingTop: '8px' }}>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '11px', display: 'block', fontWeight: 600 }}>MARKS AVG</span>
                          <span style={{ fontWeight: 700, color: student.marks_average < 40 ? '#ef4444' : '#0f172a' }}>
                            {student.marks_average !== null ? `${student.marks_average}%` : 'N/A'}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#64748b', fontSize: '11px', display: 'block', fontWeight: 600 }}>ATTENDANCE</span>
                          <span style={{ fontWeight: 700, color: student.attendance_average < 75 ? '#ef4444' : '#0f172a' }}>
                            {student.attendance_average !== null ? `${student.attendance_average}%` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h3 style={S.sectionTitle}>
                <AlertTriangle style={{ width: '18px', height: '18px', color: '#e11d48' }} />
                At-Risk Count by Class
              </h3>
              {(at_risk_by_class || []).length === 0 ? (
                <div style={S.emptyState}>No students are currently flagged as at-risk.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {(at_risk_by_class || []).map((c) => (
                    <div key={c.class_name} style={S.alertCard}>
                      <div>
                        <div style={S.alertTitle}>{c.class_name}</div>
                        <div style={S.alertDesc}>
                          {c.count} of {c.total} students at risk
                        </div>
                      </div>
                      <div
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: c.count > 0 ? '#fee2e2' : '#dcfce7',
                          color: c.count > 0 ? '#991b1b' : '#15803d',
                        }}
                      >
                        {c.count > 0 ? `${Math.round((c.count / c.total) * 100)}% At Risk` : 'Healthy'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Responsive layout CSS injection */}
      <style>{`
        @keyframes siq-spin {
          to { transform: rotate(360deg); }
        }
        .siq-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #cbd5e1;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: siq-spin 0.8s linear infinite;
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .lg\\:col-span-2 {
            grid-column: span 2 / span 2 !important;
          }
          .lg\\:gap-8 {
            gap: 32px !important;
          }
        }
      `}</style>
      {/* Settings Modal */}
      <Modal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
        title="School Analytics & At-Risk Settings"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="label block font-bold text-slate-700 mb-1.5">At-Risk Attendance Threshold (%)</label>
              <input
                className="input-field w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-semibold"
                type="number"
                min="1"
                max="100"
                required
                value={formThresholds.risk_attendance_cutoff}
                onChange={(e) => setFormThresholds({ ...formThresholds, risk_attendance_cutoff: Number(e.target.value) })}
              />
              <span className="text-xs text-slate-400 block mt-1">Students with attendance percentage below this value will be flagged as at-risk.</span>
            </div>

            <div>
              <label className="label block font-bold text-slate-700 mb-1.5">Low Academic Score Threshold (%)</label>
              <input
                className="input-field w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-semibold"
                type="number"
                min="1"
                max="100"
                required
                value={formThresholds.risk_academic_cutoff}
                onChange={(e) => setFormThresholds({ ...formThresholds, risk_academic_cutoff: Number(e.target.value) })}
              />
              <span className="text-xs text-slate-400 block mt-1">Grade percentage below this value indicates failure/academic concern.</span>
            </div>

            <div>
              <label className="label block font-bold text-slate-700 mb-1.5">Academic Drop Margin Warning (%)</label>
              <input
                className="input-field w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-semibold"
                type="number"
                min="1"
                max="100"
                required
                value={formThresholds.risk_grade_drop_margin}
                onChange={(e) => setFormThresholds({ ...formThresholds, risk_grade_drop_margin: Number(e.target.value) })}
              />
              <span className="text-xs text-slate-400 block mt-1">Flag students whose grade drops by more than this percentage between consecutive exams.</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-5">
            <button 
              type="button" 
              onClick={() => setShowSettingsModal(false)} 
              className="btn-secondary px-4 py-2 border border-slate-200 rounded-lg font-semibold text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="btn-primary px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
