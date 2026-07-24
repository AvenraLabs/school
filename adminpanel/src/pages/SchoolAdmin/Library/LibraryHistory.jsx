import { useState, useEffect, useCallback } from 'react';
import { libraryAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/date';
import {
  History, Search, ChevronDown, Loader2, AlertCircle, X,
  Ban, RotateCcw, BookOpen,
} from 'lucide-react';

const STATUS_COLORS = {
  issued: 'bg-indigo-100 text-indigo-700',
  returned: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-rose-100 text-rose-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

function ConfirmActionModal({ title, description, confirmLabel, confirmColor, onConfirm, onClose, hasRemarks }) {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm(remarks);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Action failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[380px] rounded-2xl border border-slate-200 bg-white shadow-2xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>

        {hasRemarks && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Remarks (Optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="Reason..."
              className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            Cancel
          </button>
          <button onClick={handle} disabled={loading}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${confirmColor}`}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
      ))}
    </tr>
  );
}

export function LibraryHistory() {
  const toast = useToast();
  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const [cancelModal, setCancelModal] = useState(null);
  const [undoModal, setUndoModal] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await libraryAPI.listIssues({
        status: status || undefined,
        limit: LIMIT,
        offset,
      });
      // client-side filter by student name
      let rows = data.issues || [];
      if (search.trim()) {
        const s = search.toLowerCase();
        rows = rows.filter(i =>
          i.Student?.user?.name?.toLowerCase().includes(s) ||
          String(i.Student?.roll_no || '').toLowerCase().includes(s) ||
          i.Book?.book_name?.toLowerCase().includes(s) ||
          i.Book?.book_no?.toLowerCase().includes(s)
        );
      }
      setIssues(rows);
      setTotal(data.total || 0);
    } catch {
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, [status, offset, search]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (issue, remarks) => {
    await libraryAPI.cancelIssue(issue.id, { remarks });
    toast.success('Issue cancelled');
    load();
  };

  const handleUndo = async (issue, remarks) => {
    await libraryAPI.undoReturn(issue.id, { remarks });
    toast.success('Return undone');
    load();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or book..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 w-52"
          />
        </div>

        <div className="relative">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setOffset(0); }}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer">
            <option value="">All Statuses</option>
            <option value="issued">Issued</option>
            <option value="returned">Returned</option>
            <option value="lost">Lost</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Book</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Issued</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Due</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Returned</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading
                ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                : issues.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <History className="h-10 w-10 text-slate-200" />
                        <p className="text-sm font-medium text-slate-400">No records found</p>
                      </div>
                    </td>
                  </tr>
                )
                : issues.map((issue) => {
                  const isOverdue = issue.status === 'issued' && issue.due_date < today;
                  return (
                    <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{issue.Student?.user?.name || '—'}</p>
                        {issue.Student?.roll_no && <p className="text-xs text-slate-400">Roll No: {issue.Student.roll_no}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{issue.Book?.book_name}</p>
                        <p className="text-xs font-mono text-slate-400">{issue.Book?.book_no}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(issue.issue_date)}</td>
                      <td className={`px-4 py-3 font-medium ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>
                        {formatDate(issue.due_date)}
                        {isOverdue && <span className="ml-1 text-xs">⚠</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{issue.returned_date ? formatDate(issue.returned_date) : '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[issue.status]}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {issue.status === 'issued' && (
                            <button
                              id={`cancel-issue-${issue.id}`}
                              onClick={() => setCancelModal(issue)}
                              title="Cancel Issue"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {(issue.status === 'returned' || issue.status === 'lost') && (
                            <button
                              id={`undo-return-${issue.id}`}
                              onClick={() => setUndoModal(issue)}
                              title="Undo Return"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>

        {total > LIMIT && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50">Previous</button>
              <button disabled={offset + LIMIT >= total} onClick={() => setOffset(offset + LIMIT)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {cancelModal && (
        <ConfirmActionModal
          title="Cancel Issue?"
          description={`Cancel issue of "${cancelModal.Book?.book_name}" for ${cancelModal.Student?.user?.name}? The copy will be returned to available.`}
          confirmLabel="Cancel Issue"
          confirmColor="bg-rose-600 hover:bg-rose-700"
          hasRemarks
          onConfirm={(remarks) => handleCancel(cancelModal, remarks)}
          onClose={() => setCancelModal(null)}
        />
      )}

      {undoModal && (
        <ConfirmActionModal
          title="Undo Return?"
          description={`Undo return of "${undoModal.Book?.book_name}" for ${undoModal.Student?.user?.name}? Status will be set back to Issued.`}
          confirmLabel="Undo Return"
          confirmColor="bg-amber-500 hover:bg-amber-600"
          hasRemarks
          onConfirm={(remarks) => handleUndo(undoModal, remarks)}
          onClose={() => setUndoModal(null)}
        />
      )}
    </div>
  );
}
