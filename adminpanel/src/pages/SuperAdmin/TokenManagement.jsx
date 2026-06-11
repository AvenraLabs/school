import { useState, useEffect, useCallback } from 'react';
import { tokenPoliciesAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatsCard } from '../../components/common/StatsCard';
import { useToast } from '../../context/ToastContext';
import {
  Coins, Settings, History, Wallet, Edit2,
  ChevronLeft, ChevronRight, Users, GraduationCap, UserCog,
  RefreshCw, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';

const PAGE_SIZE = 50; // fetch up to 50 per page; pass limit=100 to backend

/* ─── tiny helpers ─────────────────────────────────────────────────── */
function RolePill({ role }) {
  const map = {
    student: 'bg-sky-50 text-sky-700 border-sky-200',
    teacher: 'bg-violet-50 text-violet-700 border-violet-200',
    school_admin: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${map[role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {role?.replace('_', ' ')}
    </span>
  );
}

function ChangeBadge({ change }) {
  if (change > 0) return (
    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold font-mono">
      <TrendingUp className="w-3.5 h-3.5" />+{change.toLocaleString()}
    </span>
  );
  if (change < 0) return (
    <span className="inline-flex items-center gap-1 text-rose-600 font-semibold font-mono">
      <TrendingDown className="w-3.5 h-3.5" />{change.toLocaleString()}
    </span>
  );
  return <span className="inline-flex items-center gap-1 text-slate-400 font-mono"><Minus className="w-3.5 h-3.5" />0</span>;
}

/* ─── responsive table wrapper ─────────────────────────────────────── */
function TableWrap({ children }) {
  return (
    <div className="overflow-x-auto w-full -mx-px">
      <div className="min-w-[600px]">
        {children}
      </div>
    </div>
  );
}

/* ─── main component ────────────────────────────────────────────────── */
export function TokenManagement() {
  const [policies, setPolicies]       = useState([]);
  const [accounts, setAccounts]       = useState([]);
  const [accTotal, setAccTotal]       = useState(0);
  const [accPage, setAccPage]         = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [txnTotal, setTxnTotal]       = useState(0);
  const [txnPage, setTxnPage]         = useState(0);
  const [activeTab, setActiveTab]     = useState('policies');
  const [loading, setLoading]         = useState(true);
  const [tabLoading, setTabLoading]   = useState(false);

  // edit policy modal
  const [showEdit, setShowEdit]       = useState(null); // { role }
  const [editForm, setEditForm]       = useState({ student: '', teacher: '', mode: 'replace' });

  // adjust single user modal
  const [showAdjust, setShowAdjust]   = useState(null);
  const [adjustForm, setAdjustForm]   = useState({ amount: '', mode: 'add' });

  const toast = useToast();

  /* ── load policies (always small) ── */
  const loadPolicies = useCallback(async () => {
    const pol = await tokenPoliciesAPI.list();
    setPolicies(pol?.items || []);
  }, []);

  /* ── load accounts with pagination ── */
  const loadAccounts = useCallback(async (page = 0) => {
    setTabLoading(true);
    try {
      const res = await tokenPoliciesAPI.getAccounts(null, null, PAGE_SIZE, page * PAGE_SIZE);
      setAccounts(res?.items || []);
      setAccTotal(res?.total || 0);
      setAccPage(page);
    } finally {
      setTabLoading(false);
    }
  }, []);

  /* ── load transactions with pagination ── */
  const loadTransactions = useCallback(async (page = 0) => {
    setTabLoading(true);
    try {
      const res = await tokenPoliciesAPI.getTransactions(null, null, PAGE_SIZE, page * PAGE_SIZE);
      setTransactions(res?.items || []);
      setTxnTotal(res?.total || 0);
      setTxnPage(page);
    } finally {
      setTabLoading(false);
    }
  }, []);

  /* ── initial load ── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.allSettled([loadPolicies(), loadAccounts(0), loadTransactions(0)]);
      setLoading(false);
    })();
  }, [loadPolicies, loadAccounts, loadTransactions]);

  /* ── tab switch ── */
  useEffect(() => {
    if (activeTab === 'accounts')     loadAccounts(0);
    if (activeTab === 'transactions') loadTransactions(0);
  }, [activeTab, loadAccounts, loadTransactions]);

  const displayPolicies = ['student', 'teacher'].map(role => {
    const existing = policies.find(p => p.role === role);
    return existing || { role, monthly_tokens: 0, updated_by: null };
  });

  /* ── open "set all" modal pre-filled ── */
  const openEdit = () => {
    const s = policies.find(p => p.role === 'student');
    const t = policies.find(p => p.role === 'teacher');
    setEditForm({
      student: s?.monthly_tokens ?? 0,
      teacher: t?.monthly_tokens ?? 0,
      mode: 'replace',
    });
    setShowEdit(true);
  };

  const handleUpdatePolicies = async () => {
    try {
      // backend accepts both in one call
      await tokenPoliciesAPI.updateBoth(
        Number(editForm.student),
        Number(editForm.teacher),
        editForm.mode,
      );
      toast.success('Token policies updated for all students & teachers');
      setShowEdit(false);
      loadPolicies();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update policies');
    }
  };

  const handleAdjust = async () => {
    try {
      await tokenPoliciesAPI.adjustUserTokens(showAdjust.user_id, Number(adjustForm.amount), adjustForm.mode);
      toast.success('Tokens adjusted');
      setShowAdjust(null);
      loadAccounts(accPage);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to adjust');
    }
  };

  const accPages = Math.ceil(accTotal / PAGE_SIZE);
  const txnPages = Math.ceil(txnTotal / PAGE_SIZE);

  const tabs = [
    { key: 'policies',     label: 'Policies',             icon: Settings },
    { key: 'accounts',     label: `Accounts (${accTotal})`, icon: Wallet },
    { key: 'transactions', label: `Transactions (${txnTotal})`, icon: History },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Token Management</h1>
          <p className="page-subtitle">Set monthly AI token limits for students & teachers</p>
        </div>
        <button onClick={openEdit} className="btn-primary flex items-center gap-2">
          <Coins className="w-4 h-4" />
          Set Token Limits
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-6">
        <StatsCard icon={<Settings className="w-6 h-6" />} label="Active Policies"  value={loading ? '…' : policies.length}  color="indigo" />
        <StatsCard icon={<Wallet   className="w-6 h-6" />} label="Token Accounts"   value={loading ? '…' : accTotal}          color="emerald" />
        <StatsCard icon={<History  className="w-6 h-6" />} label="Total Transactions" value={loading ? '…' : txnTotal}         color="amber" />
      </div>

      {/* Tabs */}
      <div className="tabs mb-4">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`tab flex items-center gap-1.5 ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading…</div>
        ) : activeTab === 'policies' ? (

          /* ── Policies tab ── */
          <TableWrap>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Monthly Tokens</th>
                  <th>Last Updated By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayPolicies.map((p, i) => (
                  <tr key={i}>
                    <td><RolePill role={p.role} /></td>
                    <td className="font-mono font-semibold text-slate-900">{(p.monthly_tokens || 0).toLocaleString()}</td>
                    <td className="text-slate-500 text-sm">{p.updated_by || '—'}</td>
                    <td>
                      <button onClick={openEdit} className="btn-secondary btn-sm flex items-center gap-1.5">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>

        ) : activeTab === 'accounts' ? (

          /* ── Accounts tab ── */
          <>
            {tabLoading ? (
              <div className="p-12 text-center text-slate-400">Loading accounts…</div>
            ) : accounts.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No token accounts found</div>
            ) : (
              <>
                <TableWrap>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Balance</th>
                        <th>Expires</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((a, i) => {
                        const u = a.user || a.User || {};
                        return (
                          <tr key={i}>
                            <td>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">{u.name || u.username || '—'}</p>
                                <p className="text-xs text-slate-400 font-mono">@{u.username}</p>
                              </div>
                            </td>
                            <td><RolePill role={u.role} /></td>
                            <td className="font-mono font-semibold text-slate-900">{(a.balance || 0).toLocaleString()}</td>
                            <td className="text-sm text-slate-500">{a.expires_at ? new Date(a.expires_at).toLocaleDateString() : '—'}</td>
                            <td>
                              <button
                                onClick={() => { setShowAdjust(a); setAdjustForm({ amount: '', mode: 'add' }); }}
                                className="btn-secondary btn-sm flex items-center gap-1.5"
                              >
                                <Coins className="w-3.5 h-3.5" /> Adjust
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </TableWrap>

                {/* Pagination */}
                {accPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                      Page {accPage + 1} of {accPages} · {accTotal} accounts
                    </p>
                    <div className="flex items-center gap-2">
                      <button disabled={accPage === 0} onClick={() => loadAccounts(accPage - 1)} className="btn-secondary btn-sm disabled:opacity-40">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button disabled={accPage >= accPages - 1} onClick={() => loadAccounts(accPage + 1)} className="btn-secondary btn-sm disabled:opacity-40">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>

        ) : (

          /* ── Transactions tab ── */
          <>
            {tabLoading ? (
              <div className="p-12 text-center text-slate-400">Loading transactions…</div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No transactions recorded yet</div>
            ) : (
              <>
                <TableWrap>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Type</th>
                        <th>Change</th>
                        <th>Before → After</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t, i) => {
                        const u = t.user || t.User || {};
                        return (
                          <tr key={i}>
                            <td>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">{u.name || u.username || '—'}</p>
                                <p className="text-xs text-slate-400 font-mono">@{u.username}</p>
                              </div>
                            </td>
                            <td><RolePill role={u.role} /></td>
                            <td>
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                                t.type === 'usage'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {t.type?.replace('_', ' ')}
                              </span>
                            </td>
                            <td><ChangeBadge change={t.change} /></td>
                            <td className="font-mono text-sm text-slate-600">
                              {(t.balance_before || 0).toLocaleString()} → {(t.balance_after || 0).toLocaleString()}
                            </td>
                            <td className="text-sm text-slate-500 whitespace-nowrap">
                              {t.created_at ? new Date(t.created_at).toLocaleString() : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </TableWrap>

                {/* Pagination */}
                {txnPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                      Page {txnPage + 1} of {txnPages} · {txnTotal} transactions
                    </p>
                    <div className="flex items-center gap-2">
                      <button disabled={txnPage === 0} onClick={() => loadTransactions(txnPage - 1)} className="btn-secondary btn-sm disabled:opacity-40">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button disabled={txnPage >= txnPages - 1} onClick={() => loadTransactions(txnPage + 1)} className="btn-secondary btn-sm disabled:opacity-40">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ── Set Token Limits Modal ── */}
      <Modal isOpen={!!showEdit} onClose={() => setShowEdit(false)} title="Set Monthly Token Limits">
        <div className="space-y-5">
          <p className="text-sm text-slate-500">
            This will update the token policy <strong>and immediately apply the new balance</strong> to every existing student and teacher account.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-sky-500" /> Student Tokens / Month
              </label>
              <input
                className="input-field"
                type="number"
                min="0"
                value={editForm.student}
                onChange={e => setEditForm({ ...editForm, student: e.target.value })}
                placeholder="e.g. 5000"
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <UserCog className="w-4 h-4 text-violet-500" /> Teacher Tokens / Month
              </label>
              <input
                className="input-field"
                type="number"
                min="0"
                value={editForm.teacher}
                onChange={e => setEditForm({ ...editForm, teacher: e.target.value })}
                placeholder="e.g. 10000"
              />
            </div>
          </div>

          <div>
            <label className="label">How to apply</label>
            <select className="select-field" value={editForm.mode} onChange={e => setEditForm({ ...editForm, mode: e.target.value })}>
              <option value="replace">Replace — set every account to this exact value</option>
              <option value="add">Add — add this amount on top of current balance</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button onClick={() => setShowEdit(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleUpdatePolicies} className="btn-primary flex items-center gap-2">
              <Users className="w-4 h-4" /> Apply to All
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Adjust Single User Modal ── */}
      <Modal
        isOpen={!!showAdjust}
        onClose={() => setShowAdjust(null)}
        title={`Adjust Tokens — ${showAdjust?.user?.name || showAdjust?.user?.username || showAdjust?.User?.name || `User #${showAdjust?.user_id}`}`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600">
            Current balance: <strong className="font-mono">{(showAdjust?.balance || 0).toLocaleString()}</strong> tokens
          </div>
          <div>
            <label className="label">Amount</label>
            <input
              className="input-field"
              type="number"
              value={adjustForm.amount}
              onChange={e => setAdjustForm({ ...adjustForm, amount: e.target.value })}
              placeholder="Token amount"
            />
          </div>
          <div>
            <label className="label">Mode</label>
            <select className="select-field" value={adjustForm.mode} onChange={e => setAdjustForm({ ...adjustForm, mode: e.target.value })}>
              <option value="add">Add to current balance</option>
              <option value="set">Set exact balance</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAdjust(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleAdjust} className="btn-primary">Apply</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
