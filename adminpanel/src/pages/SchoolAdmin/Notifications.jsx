import React, { useEffect, useMemo, useState } from 'react';
import { notificationsAPI, classesAPI, uploadAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Select, Input, Textarea } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';
import {
  Bell,
  CheckCircle,
  Eye,
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  Search,
  Image as ImageIcon
} from 'lucide-react';
import { formatDate } from '../../utils/date';

const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  let cleanPath = path;
  if (path.startsWith('/uploads')) {
    cleanPath = `/api${path}`;
  }
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const host = baseUrl.replace(/\/api$/, '');
  return `${host}${cleanPath}`;
};

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const [showAcks, setShowAcks] = useState(null);
  const [acks, setAcks] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const [form, setForm] = useState({
    title: '',
    message: '',
    target_role: 'all',
    class_id: '',
    section_id: '',
    send_whatsapp: false,
    image_url: '',
    start_date: '',
    end_date: '',
  });

  const [dateMode, setDateMode] = useState('range'); // 'range' | 'specific'
  const [specificDates, setSpecificDates] = useState([]);
  const [newSpecificDate, setNewSpecificDate] = useState('');

  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [deletingNotification, setDeletingNotification] = useState(null);

  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 15;
  const toast = useToast();

  useEffect(() => {
    loadNotifications();
    loadClasses();
  }, [page]);

  const loadNotifications = async () => {
    try {
      const res = await notificationsAPI.list({ limit: LIMIT, offset: page * LIMIT });
      setNotifications(res.items || []);
      setTotalCount(res.total || 0);
    } catch (e) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch (e) { /* ignore */ }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadAPI.uploadAnnouncement(file);
      if (res.success && res.url) {
        setForm((prev) => ({ ...prev, image_url: res.url }));
        toast.success('Photo attached successfully');
      } else {
        toast.error('Image upload failed');
      }
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      message: '',
      target_role: 'all',
      class_id: '',
      section_id: '',
      send_whatsapp: false,
      image_url: '',
      start_date: '',
      end_date: '',
    });
    setDateMode('range');
    setSpecificDates([]);
    setNewSpecificDate('');
    setEditingNotification(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) {
      return toast.error('Message content is required.');
    }
    setSending(true);
    const capitalizedTitle = form.title ? form.title.charAt(0).toUpperCase() + form.title.slice(1) : 'New Announcement';
    try {
      await notificationsAPI.create(
        capitalizedTitle,
        form.message,
        form.target_role,
        form.class_id ? Number(form.class_id) : undefined,
        form.section_id ? Number(form.section_id) : undefined,
        form.send_whatsapp,
        form.image_url
      );
      toast.success('Announcement broadcasted!');
      setShowCompose(false);
      resetForm();
      setPage(0);
      loadNotifications();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleAddSpecificDate = () => {
    if (!newSpecificDate) return;
    if (specificDates.includes(newSpecificDate)) {
      return toast.info('Date already added');
    }
    setSpecificDates([...specificDates, newSpecificDate]);
    setNewSpecificDate('');
  };

  const handleRemoveSpecificDate = (dateToRemove) => {
    setSpecificDates(specificDates.filter((d) => d !== dateToRemove));
  };

  const handleSendPoster = async (e) => {
    e.preventDefault();
    if (dateMode === 'range' && (!form.start_date || !form.end_date)) {
      return toast.error('Start and End dates are required for Date Range mode.');
    }
    if (dateMode === 'specific' && specificDates.length === 0) {
      return toast.error('Please select at least one specific date.');
    }

    setSending(true);
    const capitalizedTitle = form.title ? form.title.charAt(0).toUpperCase() + form.title.slice(1) : 'Banner Poster';

    const startDate = dateMode === 'range' ? form.start_date : specificDates[0];
    const endDate = dateMode === 'range' ? form.end_date : specificDates[specificDates.length - 1];

    const payload = {
      title: capitalizedTitle,
      message: form.message,
      target_role: form.target_role,
      class_id: form.class_id ? Number(form.class_id) : null,
      section_id: form.section_id ? Number(form.section_id) : null,
      start_date: startDate,
      end_date: endDate,
      specific_dates: dateMode === 'specific' ? specificDates : null,
      is_poster: true,
      image_url: form.image_url,
      send_whatsapp: form.send_whatsapp,
    };

    try {
      if (editingNotification) {
        await notificationsAPI.update(editingNotification.id, payload);
        toast.success('Poster updated successfully!');
      } else {
        await notificationsAPI.createPoster(payload);
        toast.success('Poster broadcasted successfully!');
      }
      setShowPoster(false);
      resetForm();
      setPage(0);
      loadNotifications();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save poster');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingNotification) return;
    try {
      await notificationsAPI.delete(deletingNotification.id);
      toast.success('Announcement deleted');
      setDeletingNotification(null);
      loadNotifications();
    } catch (e) {
      toast.error('Failed to delete announcement');
    }
  };

  const [ackMetrics, setAckMetrics] = useState(null);

  const loadAcks = async (notif) => {
    setShowAcks(notif);
    setAcks(null);
    setAckMetrics(null);
    try {
      const res = await notificationsAPI.getAcknowledgements(notif.id);
      const ackData = res?.data || res;
      const rawRows = ackData?.rows || ackData?.items || (Array.isArray(ackData) ? ackData : []);
      setAcks(Array.isArray(rawRows) ? rawRows : []);
      setAckMetrics({
        seenCount: ackData?.seenCount ?? (Array.isArray(rawRows) ? rawRows.length : 0),
        unseenCount: ackData?.unseenCount ?? 0,
        totalCount: ackData?.totalCount ?? (Array.isArray(rawRows) ? rawRows.length : 0),
      });
    } catch (e) {
      toast.error('Failed to load acknowledgements');
      setAcks([]);
    }
  };

  const selectedClassObj = classes.find((c) => String(c.id) === String(form.class_id));
  const availableSections = selectedClassObj?.sections || [];

  const filteredList = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        n.title?.toLowerCase().includes(query.toLowerCase()) ||
        n.message?.toLowerCase().includes(query.toLowerCase());
      if (filter === 'posters') return matchesSearch && n.is_poster;
      if (filter === 'broadcasts') return matchesSearch && !n.is_poster;
      return matchesSearch;
    });
  }, [notifications, query, filter]);

  const totalPages = Math.ceil(totalCount / LIMIT);

  return (
    <div className="space-y-4 text-xs">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14213D]">Campus Announcements & Poster Notices</span>
            <span className="text-[#8C97AB]">|</span>
            <span className="text-[#52607D]">Total Logged: {totalCount}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Camera}
              onClick={() => { resetForm(); setShowPoster(true); }}
            >
              New Banner Poster
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Megaphone}
              onClick={() => { resetForm(); setShowCompose(true); }}
            >
              Compose Announcement
            </Button>
          </div>
        </div>
      </Card>

      {/* Filter & Search Bar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 border border-[#E4E1D8] rounded-[6px] p-0.5 bg-[#FAFAF8]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                filter === 'all' ? 'bg-white text-[#2F6F5E] shadow-2xs' : 'text-[#52607D]'
              }`}
            >
              All Notice Logs
            </button>
            <button
              onClick={() => setFilter('broadcasts')}
              className={`px-3 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                filter === 'broadcasts' ? 'bg-white text-[#2F6F5E] shadow-2xs' : 'text-[#52607D]'
              }`}
            >
              Standard Broadcasts
            </button>
            <button
              onClick={() => setFilter('posters')}
              className={`px-3 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                filter === 'posters' ? 'bg-white text-[#2F6F5E] shadow-2xs' : 'text-[#52607D]'
              }`}
            >
              Banner Posters
            </button>
          </div>

          <div className="relative w-64">
            <Input
              icon={Search}
              placeholder="Search announcements..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Notice List */}
      <Card>
        <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <CardTitle className="text-xs font-bold uppercase text-[#52607D]">
            Broadcast History ({filteredList.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-[#EDEAE1]">
          {loading ? (
            <div className="p-8 text-center text-[#8C97AB]">Loading announcements...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center">
              <EmptyState
                icon={Bell}
                title="No announcements found"
                description="Broadcast your first notice to campus members."
              />
            </div>
          ) : (
            filteredList.map((item) => (
              <div key={item.id} className="p-3.5 hover:bg-[#FAFAF8] transition-colors flex items-start gap-3">
                {item.image_url ? (
                  <img
                    src={getAssetUrl(item.image_url)}
                    alt="Banner"
                    className="w-14 h-14 rounded-[8px] object-cover border border-[#E4E1D8] shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-[8px] bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center shrink-0 font-bold">
                    <Bell className="w-4 h-4" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-display font-semibold text-xs text-[#14213D] truncate">{item.title}</h4>
                    <StatusBadge status={item.is_poster ? 'warning' : 'active'} label={item.is_poster ? 'Poster' : item.target_role?.toUpperCase()} size="sm" />
                  </div>
                  <p className="text-xs text-[#52607D] line-clamp-2 mb-1">{item.message}</p>
                  <div className="flex items-center gap-3 text-[10px] text-[#8C97AB] font-mono">
                    <span>Sent: {formatDate(item.createdAt)}</span>
                    {item.send_whatsapp && <span className="text-[#2F6F5E] font-semibold">WhatsApp Enabled ✓</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => loadAcks(item)}
                  >
                    Acks ({item.acknowledgementsCount || 0})
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#B0403A] hover:bg-[#FDF2F1]"
                    onClick={() => setDeletingNotification(item)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>

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

      {/* Modal: Compose Announcement */}
      <Modal isOpen={showCompose} onClose={() => setShowCompose(false)} title="Compose Announcement">
        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Title *</label>
            <Input
              required
              placeholder="e.g. New homework assigned"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Message Content *</label>
            <Textarea
              required
              rows={4}
              placeholder="Write a short, clear message..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Photo Attachment (Optional)</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E1D8] bg-[#FAFAF8] hover:bg-[#EAF3F0] text-xs text-[#52607D] cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5 text-[#2F6F5E]" />
                <span>Attach Image / Take Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              {uploadingImage && <span className="text-[11px] text-[#2F6F5E] animate-pulse">Uploading photo...</span>}
            </div>
            {form.image_url && (
              <div className="mt-2 relative w-20 h-20 rounded-[8px] overflow-hidden border border-[#E4E1D8]">
                <img src={getAssetUrl(form.image_url)} alt="Attached Photo" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, image_url: '' }))}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Target Role *</label>
              <Select
                value={form.target_role}
                onChange={(e) => setForm({ ...form, target_role: e.target.value })}
              >
                <option value="all">Everyone</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
              </Select>
            </div>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Class *</label>
              <Select
                value={form.class_id}
                onChange={(e) => setForm({ ...form, class_id: e.target.value, section_id: '' })}
              >
                <option value="">All classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>Class {c.class_name}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Section *</label>
              <Select
                value={form.section_id}
                onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                disabled={!form.class_id}
              >
                <option value="">All sections</option>
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id}>Section {s.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="pt-2 border-t border-[#EDEAE1]">
            <label className="flex items-center gap-2 font-semibold text-[#14213D] cursor-pointer">
              <input
                type="checkbox"
                checked={form.send_whatsapp}
                onChange={(e) => setForm({ ...form, send_whatsapp: e.target.checked })}
                className="rounded accent-[#2F6F5E] w-4 h-4 cursor-pointer"
              />
              <span>Send via WhatsApp</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowCompose(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={sending}>Send Broadcast</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create / Edit Banner Poster */}
      <Modal isOpen={showPoster} onClose={() => setShowPoster(false)} title={editingNotification ? "Edit Banner Poster" : "New Banner Poster"}>
        <form onSubmit={handleSendPoster} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Poster Title *</label>
            <Input
              required
              placeholder="e.g. Annual Sports Meet Banner"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Date Selection Mode Toggle */}
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Date Selection Mode</label>
            <div className="flex items-center gap-3 bg-[#FAFAF8] p-2 rounded-[6px] border border-[#E4E1D8]">
              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[#14213D]">
                <input
                  type="radio"
                  name="dateMode"
                  value="range"
                  checked={dateMode === 'range'}
                  onChange={() => setDateMode('range')}
                  className="accent-[#2F6F5E]"
                />
                <span>Date Range</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[#14213D]">
                <input
                  type="radio"
                  name="dateMode"
                  value="specific"
                  checked={dateMode === 'specific'}
                  onChange={() => setDateMode('specific')}
                  className="accent-[#2F6F5E]"
                />
                <span>Specific Dates</span>
              </label>
            </div>
          </div>

          {/* Flexible Date Picker Inputs */}
          {dateMode === 'range' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Display From Date *</label>
                <Input
                  type="date"
                  required
                  value={form.start_date || ''}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Display To Date *</label>
                <Input
                  type="date"
                  required
                  value={form.end_date || ''}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block font-semibold text-[#14213D] mb-1">Select Specific Dates (Auto-adds on selection)</label>
              <Input
                type="date"
                value={newSpecificDate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  if (specificDates.includes(val)) {
                    toast.info('Date already added');
                  } else {
                    setSpecificDates((prev) => [...prev, val]);
                  }
                  setNewSpecificDate('');
                }}
              />
              {specificDates.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {specificDates.map((d) => (
                    <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#EAF3F0] text-[#2F6F5E] font-mono font-semibold rounded-[4px] text-[11px] border border-[#D3E6E0]">
                      {d}
                      <button type="button" onClick={() => handleRemoveSpecificDate(d)} className="text-red-600 hover:text-red-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Photo / Poster Image (Optional)</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E1D8] bg-[#FAFAF8] hover:bg-[#EAF3F0] text-xs text-[#52607D] cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5 text-[#2F6F5E]" />
                <span>Attach Poster Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              {uploadingImage && <span className="text-[11px] text-[#2F6F5E] animate-pulse">Uploading photo...</span>}
            </div>
            {form.image_url && (
              <div className="mt-2 relative w-24 h-24 rounded-[8px] overflow-hidden border border-[#E4E1D8]">
                <img src={getAssetUrl(form.image_url)} alt="Poster Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, image_url: '' }))}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Message Copy</label>
            <Textarea
              rows={3}
              placeholder="Poster caption or detailed copy..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Target Role</label>
              <Select
                value={form.target_role}
                onChange={(e) => setForm({ ...form, target_role: e.target.value })}
              >
                <option value="all">Everyone</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
              </Select>
            </div>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Class</label>
              <Select
                value={form.class_id}
                onChange={(e) => setForm({ ...form, class_id: e.target.value, section_id: '' })}
              >
                <option value="">All classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>Class {c.class_name}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Section</label>
              <Select
                value={form.section_id}
                onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                disabled={!form.class_id}
              >
                <option value="">All sections</option>
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id}>Section {s.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="pt-2 border-t border-[#EDEAE1]">
            <label className="flex items-center gap-2 font-semibold text-[#14213D] cursor-pointer">
              <input
                type="checkbox"
                checked={form.send_whatsapp}
                onChange={(e) => setForm({ ...form, send_whatsapp: e.target.checked })}
                className="rounded accent-[#2F6F5E] w-4 h-4 cursor-pointer"
              />
              <span>Send via WhatsApp</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowPoster(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={sending}>Save Poster</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Acknowledgements */}
      <Modal isOpen={!!showAcks} onClose={() => { setShowAcks(null); setAcks(null); setAckMetrics(null); }} title="Read Receipts & Acknowledgements">
        <div className="space-y-3 text-xs">
          {ackMetrics && (
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#EAF3F0] border border-[#D3E6E0] rounded-[8px] text-center font-mono">
              <div>
                <span className="text-[10px] text-[#52607D] block font-sans">Total Audience</span>
                <span className="font-bold text-[#14213D] text-xs">{ackMetrics.totalCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#2F6F5E] block font-sans">Acknowledged</span>
                <span className="font-bold text-[#2F6F5E] text-xs">{ackMetrics.seenCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8C97AB] block font-sans">Pending</span>
                <span className="font-bold text-[#52607D] text-xs">{ackMetrics.unseenCount}</span>
              </div>
            </div>
          )}

          {!acks ? (
            <p className="text-[#8C97AB] text-center py-4">Loading receipts...</p>
          ) : acks.length === 0 ? (
            <p className="text-[#8C97AB] text-center py-4">No read receipts logged yet.</p>
          ) : (
            <div className="divide-y divide-[#EDEAE1] max-h-60 overflow-y-auto">
              {acks.map((a) => (
                <div key={a.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#14213D]">{a.user?.name || a.User?.name || `User #${a.user_id}`}</span>
                    {(a.user?.role || a.User?.role || a.user_role) && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-[#EAF3F0] text-[#2F6F5E]">
                        {a.user?.role || a.User?.role || a.user_role}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-[#8C97AB]">
                    {formatDate(a.acknowledged_at || a.read_at || a.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingNotification}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${deletingNotification?.title}"?`}
        confirmText="Delete"
        danger={true}
        onConfirm={handleDelete}
        onClose={() => setDeletingNotification(null)}
      />
    </div>
  );
}
