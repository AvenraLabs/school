import React, { useState, useEffect } from 'react';
import { schoolAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import {
  Building2,
  MessageSquare,
  MapPin,
  Sparkles,
  Save,
  GraduationCap,
  CheckCircle2,
  Phone,
  Mail,
  Sliders,
  Layers,
  Video,
  BookOpen,
  DollarSign,
  Bus,
  Bot,
  Wand2
} from 'lucide-react';

export function SuperAdminSchoolSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [school, setSchool] = useState(null);

  const [form, setForm] = useState({
    school_name: '',
    board: 'CBSE',
    address: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    contact_phone: '',
    google_maps_enabled: false,
    promotion_wizard_enabled: false,
  });

  const [modules, setModules] = useState({
    transport: true,
    library: true,
    finance: true,
    ai_tutor: true,
    ai_tools: true,
    ai_video: true,
    whatsapp: true,
  });

  const moduleDefinitions = [
    { key: 'transport', label: 'Transport & Bus GPS Tracking', icon: Bus, desc: 'Bus routes, vehicles, driver profiles, student allocations, live GPS tracking.' },
    { key: 'library', label: 'Library Management System', icon: BookOpen, desc: 'Book cataloging, issue/return loans, overdue tracking, fine rules.' },
    { key: 'finance', label: 'Fees & Expense Management', icon: DollarSign, desc: 'Fee structures, student ledgers, concessions, receipts, expense vouchers.' },
    { key: 'ai_tutor', label: 'Student AI Tutor Chat', icon: Bot, desc: 'Student RAG AI tutor assistant and textbook chapter context search.' },
    { key: 'ai_tools', label: 'Teacher AI Tools & Quizzes', icon: Wand2, desc: 'AI Question Paper Generator, Lesson Planner, Homework Quizzes, Kahoot games.' },
    { key: 'ai_video', label: 'Google Veo 3 Video Generation', icon: Video, desc: '3D Educational video generation using Google Vertex AI Veo 3.' },
    { key: 'whatsapp', label: 'WhatsApp Cloud API Alerts (Paid API)', icon: MessageSquare, desc: 'Meta WhatsApp absentee alerts and fee receipts dispatches.' },
  ];

  useEffect(() => {
    loadSchoolData();
  }, []);

  const loadSchoolData = async () => {
    setLoading(true);
    try {
      const res = await schoolAPI.list();
      const rawList = res.items || (Array.isArray(res) ? res : [res]);
      if (rawList.length > 0) {
        const s = rawList[0];
        setSchool(s);
        setForm({
          school_name: s.school_name || s.name || '',
          board: s.board || 'CBSE',
          address: s.address || '',
          city: s.city || '',
          state: s.state || '',
          zip: s.zip || '',
          email: s.email || '',
          contact_phone: s.contact_phone || s.phone || '',
          google_maps_enabled: Boolean(s.google_maps_enabled),
          promotion_wizard_enabled: Boolean(s.promotion_wizard_enabled),
        });

        if (s.enabled_modules) {
          setModules((prev) => ({ ...prev, ...s.enabled_modules }));
        }
      }
    } catch (err) {
      toast.error('Failed to load school settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleField = async (field, value, label) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (!school) return;
    try {
      await schoolAPI.update(school.id, { [field]: value });
      toast.success(`${label} ${value ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update ${label}`);
      setForm((prev) => ({ ...prev, [field]: !value }));
    }
  };

  const handleToggleModule = async (moduleKey, value, label) => {
    const updatedModules = { ...modules, [moduleKey]: value };
    setModules(updatedModules);
    if (!school) return;
    try {
      await schoolAPI.updateModules(school.id, updatedModules);
      toast.success(`Module '${label}' ${value ? 'enabled' : 'disabled'} for this school.`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update module '${label}'`);
      setModules((prev) => ({ ...prev, [moduleKey]: !value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!school) return;
    setSaving(true);
    try {
      await schoolAPI.update(school.id, form);
      toast.success('School configuration updated successfully!');
      await loadSchoolData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#8C97AB] text-xs">
        Loading school system settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Action Bar */}
        <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-4 shadow-xs flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-base text-[#14213D] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#2F6F5E]" /> School System Configuration & Feature Toggles
            </h2>
            <p className="text-xs text-[#52607D]">
              Configure board affiliation, licensed feature modules, third-party API services, and system preferences.
            </p>
          </div>

          <Button variant="primary" type="submit" loading={saving} icon={Save}>
            Save Profile Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Institutional Profile */}
          <Card>
            <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
              <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2F6F5E]" /> Institutional Profile & Board Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">School Full Name *</label>
                <Input
                  required
                  value={form.school_name}
                  onChange={(e) => setForm({ ...form, school_name: e.target.value })}
                  placeholder="e.g. Bharathi CBSE Senior Secondary School"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Education Board Affiliation *</label>
                <Select
                  value={form.board}
                  onChange={(e) => setForm({ ...form, board: e.target.value })}
                >
                  <option value="CBSE">CBSE — Central Board of Secondary Education</option>
                  <option value="STATEBOARD">State Board</option>
                  <option value="ICSE">ICSE — Indian Certificate of Secondary Education</option>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#14213D] mb-1">Official Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@school.edu"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#14213D] mb-1">Contact Phone</label>
                  <Input
                    value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Campus Address</label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street / Campus address"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#14213D] mb-1">City</label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#14213D] mb-1">State</label>
                  <Input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#14213D] mb-1">Zip / Pincode</label>
                  <Input
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Licensed Feature Modules Checklist */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
                <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2F6F5E]" /> Licensed Feature Modules Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs space-y-3">
                {moduleDefinitions.map((mod) => {
                  const IconComp = mod.icon;
                  const isChecked = modules[mod.key] !== false;
                  return (
                    <label
                      key={mod.key}
                      className={`flex items-start gap-3 p-3 rounded-[8px] border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-[#EAF3F0] border-[#D3E6E0]'
                          : 'bg-[#FAFAF8] border-[#E4E1D8] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 mt-0.5 rounded text-[#2F6F5E] accent-[#2F6F5E] focus:ring-[#2F6F5E] border-[#E4E1D8] cursor-pointer"
                        checked={isChecked}
                        onChange={(e) => handleToggleModule(mod.key, e.target.checked, mod.label)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 font-bold text-[#14213D]">
                          <IconComp className="w-3.5 h-3.5 text-[#2F6F5E]" />
                          <span>{mod.label}</span>
                        </div>
                        <span className="text-[11px] text-[#52607D] block mt-0.5">
                          {mod.desc}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </CardContent>
            </Card>

            {/* Map & License Settings */}
            <Card>
              <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
                <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2F6F5E]" /> Map & System Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs space-y-3">
                <label className="flex items-start gap-3 p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] cursor-pointer hover:bg-[#EAF3F0] transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded text-[#2F6F5E] accent-[#2F6F5E] focus:ring-[#2F6F5E] border-[#E4E1D8] cursor-pointer"
                    checked={form.google_maps_enabled}
                    onChange={(e) => handleToggleField('google_maps_enabled', e.target.checked, 'Google Maps integration')}
                  />
                  <div>
                    <span className="font-bold text-[#14213D] block">
                      {form.google_maps_enabled ? 'Google Maps API Enabled' : 'Leaflet Maps (OpenStreetMap) Active'}
                    </span>
                    <span className="text-[11px] text-[#52607D] block">
                      Enable Google Maps for live bus tracking (uses free Leaflet Maps if disabled).
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] cursor-pointer hover:bg-[#EAF3F0] transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded text-[#2F6F5E] accent-[#2F6F5E] focus:ring-[#2F6F5E] border-[#E4E1D8] cursor-pointer"
                    checked={form.promotion_wizard_enabled}
                    onChange={(e) => handleToggleField('promotion_wizard_enabled', e.target.checked, 'Promotion wizard')}
                  />
                  <div>
                    <span className="font-bold text-[#14213D] block">Student Promotion & Graduation Wizard</span>
                    <span className="text-[11px] text-[#52607D] block">
                      Enable Student Promotion & Graduation Wizard in School Admin panel for end-of-year batch rollover.
                    </span>
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
