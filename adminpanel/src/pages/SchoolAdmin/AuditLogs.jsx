import React, { useState, useEffect } from 'react';
import { auditLogsAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Select, Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../../utils/date';

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
    <div className="space-y-6">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14213D]">Security Audit Trail & Activity Logs</span>
            <span className="text-[#8C97AB]">|</span>
            <span className="text-[#52607D]">Total Log Entries: {total}</span>
          </div>
        </div>
      </Card>

      {/* Filters Bar */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-3 shadow-xs flex flex-wrap items-center gap-3">
        <Select
          className="w-48 text-xs"
          value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setPage(0); }}
        >
          <option value="">All Entity Types</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="fee">Fee Record</option>
        </Select>

        <div className="flex items-center gap-2 text-xs text-[#52607D]">
          <span>From:</span>
          <Input type="date" className="w-36 text-xs" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(0); }} />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#52607D]">
          <span>To:</span>
          <Input type="date" className="w-36 text-xs" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(0); }} />
        </div>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Activity Ledger</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action Triggered</th>
                <th className="px-4 py-3">Entity Scope</th>
                <th className="px-4 py-3">Entity ID</th>
                <th className="px-4 py-3">User Principal</th>
                <th className="px-4 py-3">Payload Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#8C97AB]">Loading activity ledger...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><EmptyState icon={ScrollText} title="No audit entries" description="No system activity matches your filter criteria." /></td></tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i} className="hover:bg-[#FAFAF8]">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-[#52607D] whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-semibold capitalize text-[#14213D]">{log.action || '—'}</td>
                    <td className="px-4 py-2.5 capitalize">{log.entity_type || '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-[#52607D]">{log.entity_id || '—'}</td>
                    <td className="px-4 py-2.5 font-medium">{log.user?.name || log.user?.username || log.user_id || '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-[#8C97AB] max-w-xs truncate">
                      {log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 bg-[#FAFAF8] border-t border-[#E4E1D8] flex items-center justify-between text-xs text-[#52607D]">
            <span>Page <strong className="text-[#14213D] font-mono">{page + 1}</strong> of <strong className="text-[#14213D] font-mono">{totalPages}</strong></span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={ChevronLeft} onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>Previous</Button>
              <Button variant="outline" size="sm" iconRight={ChevronRight} onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
