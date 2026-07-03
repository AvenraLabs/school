import { useState, useEffect } from 'react';
import { schoolAPI } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { Layers, UserCog, GraduationCap, Users } from 'lucide-react';

const S = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#475569',
  },
  iconWrap: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalWrap: {
    marginBottom: '16px',
  },
  totalVal: {
    fontSize: '36px',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1,
  },
  totalLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginTop: '4px',
    letterSpacing: '0.05em',
  },
  divider: {
    height: '1px',
    background: '#f1f5f9',
    margin: '16px 0',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  metricLabel: {
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metricVal: {
    fontSize: '15px',
    fontWeight: 700,
    marginTop: '2px',
  },
  skeletonText: {
    display: 'inline-block',
    height: '32px',
    width: '60px',
    background: '#f1f5f9',
    borderRadius: '6px',
  },
  skeletonSmall: {
    display: 'inline-block',
    height: '16px',
    width: '30px',
    background: '#f1f5f9',
    borderRadius: '4px',
  }
};

export function SchoolAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await schoolAPI.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (user?.name || user?.username || 'Admin').split(' ')[0];

  const categories = [
    {
      title: 'Classes',
      key: 'classes',
      icon: Layers,
      accent: '#4f46e5',
      bg: '#f5f3ff',
      hasApprovals: false
    },
    {
      title: 'Sections',
      key: 'sections',
      icon: Layers,
      accent: '#7c3aed',
      bg: '#faf5ff',
      hasApprovals: false
    },
    {
      title: 'Teachers',
      key: 'teachers',
      icon: UserCog,
      accent: '#0284c7',
      bg: '#f0f9ff',
      hasApprovals: true
    },
    {
      title: 'Students',
      key: 'students',
      icon: GraduationCap,
      accent: '#10b981',
      bg: '#ecfdf5',
      hasApprovals: true
    }
  ];

  return (
    <div style={{ padding: '4px' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {greeting}, {firstName} 👋
        </h1>
      </div>

      {/* Grid containing the statistics */}
      <div style={S.grid}>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const dataObj = stats?.[cat.key];

          return (
            <div key={cat.key} style={S.card}>
              <div style={S.cardHeader}>
                <span style={S.cardTitle}>{cat.title}</span>
                <div style={{ ...S.iconWrap, background: cat.bg, color: cat.accent }}>
                  <Icon style={{ width: '20px', height: '20px' }} />
                </div>
              </div>

              <div style={S.totalWrap}>
                <div style={S.totalVal}>
                  {loading ? (
                    <span style={S.skeletonText} />
                  ) : (
                    dataObj?.total || 0
                  )}
                </div>
                <div style={S.totalLabel}>Total Registered</div>
              </div>

              <div style={S.divider} />

              <div style={S.metricsGrid}>
                <div style={S.metricItem}>
                  <span style={S.metricLabel}>Active</span>
                  <span style={{ ...S.metricVal, color: '#16a34a' }}>
                    {loading ? <span style={S.skeletonSmall} /> : dataObj?.active || 0}
                  </span>
                </div>
                <div style={S.metricItem}>
                  <span style={S.metricLabel}>Inactive</span>
                  <span style={{ ...S.metricVal, color: '#64748b' }}>
                    {loading ? <span style={S.skeletonSmall} /> : dataObj?.inactive || 0}
                  </span>
                </div>

                {cat.hasApprovals && (
                  <>
                    <div style={{ ...S.metricItem, marginTop: '8px' }}>
                      <span style={S.metricLabel}>Approved</span>
                      <span style={{ ...S.metricVal, color: '#2563eb' }}>
                        {loading ? <span style={S.skeletonSmall} /> : dataObj?.approved || 0}
                      </span>
                    </div>
                    <div style={{ ...S.metricItem, marginTop: '8px' }}>
                      <span style={S.metricLabel}>Pending</span>
                      <span style={{ ...S.metricVal, color: '#d97706' }}>
                        {loading ? <span style={S.skeletonSmall} /> : dataObj?.pending || 0}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

