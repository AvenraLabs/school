import { useState, useEffect } from 'react';
import { schoolAPI } from '../../api';
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
};

export function SchoolAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await schoolAPI.getSchoolAnalytics();
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

  if (loading) {
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
    subject_difficulty = [],
    school_pass_fail = { pass: 0, fail: 0, total: 0 },
    at_risk_by_class = [],
  } = data;

  const passRate =
    school_pass_fail.total > 0
      ? Math.round((school_pass_fail.pass / school_pass_fail.total) * 100)
      : 0;

  const hardestSubject =
    subject_difficulty.length > 0 ? subject_difficulty[0] : null;

  return (
    <div style={S.container}>
      {/* Header */}
      <div style={S.header}>
        <h1 style={S.title}>School Performance Analytics</h1>
        <p style={S.subtitle}>Institutional report card, section comparisons, and subject analysis</p>
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
            {at_risk_by_class.reduce((sum, c) => sum + c.count, 0)}
          </div>
          <div style={S.cardSub}>Students flagged below 40% marks or 75% attendance</div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={S.twoColLayout} className="lg:grid-cols-2 lg:gap-8">
        {/* Section Comparison */}
        <div style={S.panel}>
          <h3 style={S.sectionTitle}>
            <Users style={{ width: '18px', height: '18px', color: '#6366f1' }} />
            Class-Section Average Comparison
          </h3>
          {section_comparison.length === 0 ? (
            <div style={S.emptyState}>No section data available yet.</div>
          ) : (
            section_comparison.map((sec) => (
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
        </div>

        {/* Subject Difficulty */}
        <div style={S.panel}>
          <h3 style={S.sectionTitle}>
            <BookOpen style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
            Subject Averages (Lowest First)
          </h3>
          {subject_difficulty.length === 0 ? (
            <div style={S.emptyState}>No subject averages data available yet.</div>
          ) : (
            subject_difficulty.map((sub) => (
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

        {/* At Risk Breakdown */}
        <div style={{ ...S.panel, gridColumn: 'span 1' }} className="lg:col-span-2">
          <h3 style={S.sectionTitle}>
            <AlertTriangle style={{ width: '18px', height: '18px', color: '#e11d48' }} />
            At-Risk Count by Class
          </h3>
          {at_risk_by_class.length === 0 ? (
            <div style={S.emptyState}>No students are currently flagged as at-risk.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {at_risk_by_class.map((c) => (
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
        </div>
      </div>
      
      {/* Responsive layout CSS injection */}
      <style>{`
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
    </div>
  );
}
