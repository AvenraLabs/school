import { useState, useEffect } from 'react';
import { libraryAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { Settings, Loader2, AlertCircle, Save } from 'lucide-react';

export function LibrarySettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    library_loan_period_days: 14,
    library_fine_to_fees: true,
    library_overdue_whatsapp_enabled: false,
    library_overdue_reminder_days: 1,
    library_overdue_fine_per_day: 0,
  });

  useEffect(() => {
    libraryAPI.getSettings()
      .then((s) => {
        setForm({
          library_loan_period_days: s.library_loan_period_days ?? 14,
          library_fine_to_fees: s.library_fine_to_fees ?? true,
          library_overdue_whatsapp_enabled: s.library_overdue_whatsapp_enabled ?? false,
          library_overdue_reminder_days: s.library_overdue_reminder_days ?? 1,
          library_overdue_fine_per_day: s.library_overdue_fine_per_day ?? 0,
        });
      })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await libraryAPI.updateSettings({
        library_loan_period_days: parseInt(form.library_loan_period_days, 10),
        library_fine_to_fees: form.library_fine_to_fees,
        library_overdue_whatsapp_enabled: form.library_overdue_whatsapp_enabled,
        library_overdue_reminder_days: parseInt(form.library_overdue_reminder_days, 10),
        library_overdue_fine_per_day: parseFloat(form.library_overdue_fine_per_day || 0),
      });
      toast.success('Library settings saved');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
            <Settings className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Library Configuration</h3>
            <p className="text-xs text-slate-500">These settings apply school-wide for the library module.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="divide-y divide-slate-100">
          {/* Loan Period */}
          <div className="px-5 py-4 space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">Default Loan Period</label>
            <p className="text-xs text-slate-500">
              When issuing a book, the due date will be pre-filled as <em>today + this many days</em>. The office can override it per issue.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <input
                id="library-loan-period-input"
                type="number"
                min={1}
                max={365}
                value={form.library_loan_period_days}
                onChange={(e) => setForm({ ...form, library_loan_period_days: e.target.value })}
                className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-center"
              />
              <span className="text-sm text-slate-500">days</span>
            </div>
          </div>

          {/* Overdue Fine Per Day */}
          <div className="px-5 py-4 space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">Overdue Fine Per Day (₹)</label>
            <p className="text-xs text-slate-500">
              Daily fine amount for books returned past their due date. Automatically calculates suggested fine during returns.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <input
                id="library-fine-per-day-input"
                type="number"
                min={0}
                step="0.5"
                value={form.library_overdue_fine_per_day}
                onChange={(e) => setForm({ ...form, library_overdue_fine_per_day: e.target.value })}
                className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-center"
              />
              <span className="text-sm text-slate-500">₹ / day overdue</span>
            </div>
          </div>

          {/* Lost Fine to Fees */}
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-slate-800">Auto-create Fee Entry for Lost/Damaged Fines</p>
              <p className="text-xs text-slate-500">
                When a book fine is entered for a student, automatically create a "Library Fine" entry in their fee record.
              </p>
            </div>
            <button
              id="library-fine-to-fees-toggle"
              type="button"
              onClick={() => setForm({ ...form, library_fine_to_fees: !form.library_fine_to_fees })}
              className={`relative flex-shrink-0 h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${
                form.library_fine_to_fees ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                form.library_fine_to_fees ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* WhatsApp Overdue */}
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-slate-800">WhatsApp Overdue Reminders</p>
              <p className="text-xs text-slate-500">
                Send automated WhatsApp messages to parents when a book is due or overdue.
              </p>
            </div>
            <button
              id="library-whatsapp-toggle"
              type="button"
              onClick={() => setForm({ ...form, library_overdue_whatsapp_enabled: !form.library_overdue_whatsapp_enabled })}
              className={`relative flex-shrink-0 h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${
                form.library_overdue_whatsapp_enabled ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                form.library_overdue_whatsapp_enabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Reminder Days */}
          {form.library_overdue_whatsapp_enabled && (
            <div className="px-5 py-4 space-y-1.5 bg-slate-50">
              <label className="text-sm font-semibold text-slate-800">Send Reminder</label>
              <p className="text-xs text-slate-500">
                How many days <em>before</em> the due date should the reminder be sent? Set to 0 to only send on the due date itself.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <input
                  id="library-reminder-days-input"
                  type="number"
                  min={0}
                  max={30}
                  value={form.library_overdue_reminder_days}
                  onChange={(e) => setForm({ ...form, library_overdue_reminder_days: e.target.value })}
                  className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-center"
                />
                <span className="text-sm text-slate-500">day(s) before due date</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-5 my-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end px-5 py-4">
            <button
              id="library-settings-save-btn"
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
