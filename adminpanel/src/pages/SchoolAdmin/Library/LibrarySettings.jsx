import { useState, useEffect } from 'react';
import { libraryAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Settings, Save, BellRing, Bell } from 'lucide-react';

export function LibrarySettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    library_loan_period_days: 14,
    library_overdue_reminder_days: 1,
    library_overdue_fine_per_day: 0,
  });

  useEffect(() => {
    libraryAPI.getSettings()
      .then((s) => {
        setForm({
          library_loan_period_days: s.library_loan_period_days ?? 14,
          library_overdue_reminder_days: s.library_overdue_reminder_days ?? 1,
          library_overdue_fine_per_day: s.library_overdue_fine_per_day ?? 0,
        });
      })
      .catch(() => toast.error('Failed to load library settings'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await libraryAPI.updateSettings({
        library_loan_period_days: parseInt(form.library_loan_period_days, 10),
        library_overdue_reminder_days: parseInt(form.library_overdue_reminder_days, 10),
        library_overdue_fine_per_day: parseFloat(form.library_overdue_fine_per_day || 0),
      });
      toast.success('Library policy settings updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Card className="p-8 text-center text-xs text-[#8C97AB]">Loading library settings...</Card>;
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#2F6F5E]" /> Library Policy & Overdue Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            
            {/* General Policy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">
                  Default Loan Period (Days)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  className="w-full font-mono"
                  value={form.library_loan_period_days}
                  onChange={(e) => setForm({ ...form, library_loan_period_days: e.target.value })}
                  required
                />
                <p className="text-[11px] text-[#8C97AB] mt-1">
                  Standard borrowing duration for students & teachers.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#14213D] mb-1">
                  Overdue Fine Per Day (₹)
                </label>
                <Input
                  type="number"
                  min={0}
                  step="0.50"
                  className="w-full font-mono"
                  value={form.library_overdue_fine_per_day}
                  onChange={(e) => setForm({ ...form, library_overdue_fine_per_day: e.target.value })}
                />
                <p className="text-[11px] text-[#8C97AB] mt-1">
                  Daily penalty amount applied to overdue book returns.
                </p>
              </div>
            </div>

            <div className="border-t border-[#EDEAE1] pt-4">
              <h4 className="font-bold text-[#14213D] flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-[#2F6F5E]" /> Automated In-App Notifications
              </h4>

              <div className="bg-[#FAFAF8] border border-[#E4E1D8] rounded-[10px] p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <BellRing className="w-4 h-4 text-[#2F6F5E] shrink-0" />
                  <div className="flex-1">
                    <label className="block font-semibold text-[#14213D] mb-1">
                      Days Before Due Date to Trigger In-App Reminder
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      className="w-32 font-mono"
                      value={form.library_overdue_reminder_days}
                      onChange={(e) => setForm({ ...form, library_overdue_reminder_days: e.target.value })}
                    />
                    <p className="text-[11px] text-[#52607D] mt-1">
                      Targeted in-app notifications will be sent automatically at 8:00 AM server time to borrowers when books are approaching due date or overdue.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#EDEAE1]">
              <Button variant="primary" icon={Save} type="submit" loading={saving}>
                Save Policy Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
