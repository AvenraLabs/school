import { useState, useEffect } from 'react';
import { feeAPI, classesAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/date';
import { Plus, Trash2, CalendarDays, IndianRupee, BookOpen, X, AlertCircle } from 'lucide-react';

export function FeeClassPlans() {
  const [classes, setClasses] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsRes, defRes] = await Promise.all([
        classesAPI.list(),
        feeAPI.getDefinitions(),
      ]);
      const rawClasses = clsRes?.items || clsRes?.rows || clsRes?.data || clsRes;
      setClasses(Array.isArray(rawClasses) ? rawClasses : []);
      setDefinitions(Array.isArray(defRes) ? defRes : []);
    } catch {
      toast.error('Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openModal = () => {
    setTitle(''); setClassId(''); setDueDate(''); setAmount('');
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!title.trim()) return toast.error('Enter a fee name');
    if (!classId) return toast.error('Select a class');
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');

    setSubmitting(true);
    try {
      const res = await feeAPI.createDefinition({
        title: title.trim(),
        class_id: Number(classId),
        due_date: dueDate || null,
        total_amount: amt,
        breakdown: [],
        fee_type: 'class',
        student_ids: [],
      });
      toast.success(`"${title.trim()}" assigned to ${res.assigned_students_count ?? 'all'} students`);
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create fee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?\n\nThis is only allowed if no payments have been collected.`)) return;
    try {
      await feeAPI.deleteDefinition(id);
      toast.success(`"${name}" deleted`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete — payments may exist');
    }
  };

  // Group by class name for display
  const grouped = definitions.reduce((acc, d) => {
    const key = d.class?.class_name ? `Class ${d.class.class_name}` : 'General / Individual Fees';
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  return (
    <div className="space-y-5">

      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-slate-900">Fee Definitions</p>
            <p className="text-xs text-slate-400">Fees assigned to entire classes for the current academic year</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={openModal} className="btn-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Create Fee
          </button>
        </div>
      </div>

      {/* ── Fee List ──────────────────────────────────────── */}
      {loading ? (
        <div className="card p-10 text-center">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">Loading fees...</p>
        </div>
      ) : definitions.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-indigo-300" />
          </div>
          <p className="text-base font-bold text-slate-600 mb-1">No fees yet</p>
          <p className="text-sm text-slate-400 mb-5">Create a fee for a class and it will be assigned to all students automatically.</p>
          <button type="button" onClick={openModal} className="btn-primary text-xs px-5 py-2.5 rounded-xl mx-auto flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Create First Fee
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([className, items]) => (
            <div key={className} className="card overflow-hidden">
              {/* Class header row */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{className}</p>
                <span className="ml-auto text-xs text-slate-400 font-medium">{items.length} fee{items.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Fee rows */}
              <div className="divide-y divide-slate-100">
                {items.map((def) => (
                  <div key={def.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/70 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <IndianRupee className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{def.title}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <CalendarDays className="w-3 h-3" />
                          {def.due_date ? `Due ${formatDate(def.due_date)}` : 'No due date'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-base font-black text-emerald-600">
                        ₹{Number(def.total_amount).toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(def.id, def.title)}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete fee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Fee Modal ──────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Create Fee</h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {/* Fee name */}
              <div>
                <label className="label">Fee Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter fee name..."
                  className="input-field"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Class */}
              <div>
                <label className="label">Class</label>
                <select
                  required
                  className="select-field"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                >
                  <option value="">— Select Class —</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>Class {c.class_name}</option>
                  ))}
                </select>
              </div>

              {/* Amount + Due date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="5000"
                    className="input-field font-bold text-emerald-700"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Due Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-700 leading-relaxed">
                  This fee will be automatically assigned to all active students in the selected class.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="btn-ghost text-sm px-4 py-2.5 rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="btn-primary text-sm px-5 py-2.5 rounded-xl flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  {submitting ? 'Creating...' : 'Create & Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
