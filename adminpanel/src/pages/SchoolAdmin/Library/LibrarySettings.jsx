import { useState, useEffect } from 'react';
import { libraryAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Settings, Save } from 'lucide-react';

export function LibrarySettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    library_loan_period_days: 14,
    library_overdue_whatsapp_enabled: false,
    library_overdue_reminder_days: 1,
    library_overdue_fine_per_day: 0,
  });

  useEffect(() => {
    libraryAPI.getSettings()
      .then((s) => {
        setForm({
          library_loan_period_days: s.library_loan_period_days ?? 14,
          library_overdue_whatsapp_enabled: s.library_overdue_whatsapp_enabled ?? false,
          library_overdue_reminder_days: s.library_overdue_reminder_days ?? 1,
          library_overdue_fine_per_day: s.library_overdue_fine_per_day ?? 0,
        });
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await libraryAPI.updateSettings({
        library_loan_period_days: parseInt(form.library_loan_period_days, 10),
        library_overdue_whatsapp_enabled: form.library_overdue_whatsapp_enabled,
        library_overdue_reminder_days: parseInt(form.library_overdue_reminder_days, 10),
        library_overdue_fine_per_day: parseFloat(form.library_overdue_fine_per_day || 0),
      });
      toast.success('Library settings saved');
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
    <Card className="max-w-xl">
      <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
        <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#2F6F5E]" /> Library Policy Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Default Loan Period (Days)</label>
            <Input
              type="number"
              min={1}
              max={365}
              className="w-32 font-mono"
              value={form.library_loan_period_days}
              onChange={(e) => setForm({ ...form, library_loan_period_days: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Overdue Fine Per Day (₹)</label>
            <Input
              type="number"
              min={0}
              step="0.5"
              className="w-32 font-mono"
              value={form.library_overdue_fine_per_day}
              onChange={(e) => setForm({ ...form, library_overdue_fine_per_day: e.target.value })}
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-[#EDEAE1]">
            <Button variant="primary" icon={Save} type="submit" loading={saving}>
              Save Policy Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
