import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : 'School Admin';
  const displayName = user?.name || user?.username || 'Admin';
  const initial = displayName[0].toUpperCase();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: '#f8fafc', overflow: 'hidden' }}>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main column */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '56px', flexShrink: 0,
          background: '#fff', borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
        }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              width: '36px', height: '36px', borderRadius: '8px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: '#64748b',
            }}
            className="flex lg:hidden items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <Menu style={{ width: '20px', height: '20px' }} />
          </button>

          <div style={{ flex: 1 }} />

          {/* User pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', lineHeight: 1 }}>{displayName}</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>{roleLabel}</p>
            </div>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            }}>
              {initial}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1400px' }} className="py-9 px-6 sm:px-11">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
