import React, { useState, useEffect } from 'react';
import { auditLogsAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { ScrollText } from 'lucide-react';

export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [entityType, setEntityType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const limit = 25;
  const toast = useToast();

  useEffect(() => { loadLogs(); }, [page, entityType, fromDate, toDate]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await auditLogsAPI.list(
        entityType || undefined, undefined,
        fromDate || undefined, toDate || undefined,
        limit, page * limit
      );
      setLogs(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">System activity history ({total} entries)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select className="select-field w-48" value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(0); }}>
          <option value="">All Entity Types</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
        </select>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">From:</span>
          <input type="date" className="input-field w-40" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(0); }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">To:</span>
          <input type="date" className="input-field w-40" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(0); }} />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <ScrollText className="empty-state-icon" />
            <p className="empty-state-title">No audit logs found</p>
            <p className="empty-state-desc">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr><th>Timestamp</th><th>Action</th><th>Entity Type</th><th>Entity ID</th><th>User</th><th>Details</th></tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i}>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="capitalize font-medium text-sm">{log.action || '—'}</td>
                    <td className="capitalize">{log.entity_type || '—'}</td>
                    <td className="font-mono text-xs">{log.entity_id || '—'}</td>
                    <td className="text-sm">{log.user?.name || log.user?.username || log.user_id || '—'}</td>
                    <td className="text-xs text-slate-500 max-w-[200px] truncate">
                      {log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100">
                <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-sm btn-secondary">Previous</button>
                  <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn-sm btn-secondary">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
