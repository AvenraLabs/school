import React, { useState, useEffect } from 'react';
import { notificationsAPI, classesAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Bell, Send, Eye, CheckCircle } from 'lucide-react';

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [showAcks, setShowAcks] = useState(null);
  const [acks, setAcks] = useState(null);
  const [form, setForm] = useState({ title: '', message: '', target_role: 'all', class_id: '', section_id: '' });
  const [sending, setSending] = useState(false);
  const toast = useToast();

  useEffect(() => { loadNotifications(); loadClasses(); }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationsAPI.list();
      setNotifications(res.items || []);
    } catch (e) {
      toast.error('Failed to load');
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

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await notificationsAPI.create(form.title, form.message, form.target_role, form.class_id ? Number(form.class_id) : undefined, form.section_id ? Number(form.section_id) : undefined);
      toast.success('Notification sent!');
      setShowCompose(false);
      setForm({ title: '', message: '', target_role: 'all', class_id: '', section_id: '' });
      loadNotifications();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setSending(false);
    }
  };

  const viewAcks = async (notif) => {
    setShowAcks(notif);
    try {
      const res = await notificationsAPI.getAcknowledgements(notif.id);
      setAcks(res.data || { count: 0, rows: [] });
    } catch (e) {
      setAcks({ count: 0, rows: [] });
    }
  };

  const selectedSections = classes.find((c) => String(c.id) === String(form.class_id))?.sections || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Send and manage announcements</p>
        </div>
        <button onClick={() => setShowCompose(true)} className="btn-primary">
          <Send className="w-4 h-4" /> Compose
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell className="empty-state-icon" />
            <p className="empty-state-title">No notifications</p>
            <p className="empty-state-desc">Send your first announcement</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm">{n.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="badge-info capitalize">{n.target_role}</span>
                      {n.created_at && (
                        <span className="text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => viewAcks(n)} className="btn-sm btn-ghost">
                    <Eye className="w-3.5 h-3.5" /> Acks
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose */}
      <Modal isOpen={showCompose} onClose={() => setShowCompose(false)} title="Compose Notification" maxWidth="max-w-xl">
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input-field" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Notification title" />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input-field" style={{ minHeight: '120px', resize: 'vertical' }} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write your message..." />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Target Role</label>
              <select className="select-field" value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })}>
                <option value="all">All</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
                <option value="parent">Parents</option>
              </select>
            </div>
            <div>
              <label className="label">Class (optional)</label>
              <select className="select-field" value={form.class_id}
                onChange={e => setForm({ ...form, class_id: e.target.value, section_id: '' })}>
                <option value="">All</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Section (optional)</label>
              <select className="select-field" value={form.section_id}
                onChange={e => setForm({ ...form, section_id: e.target.value })}
                disabled={!form.class_id}>
                <option value="">All</option>
                {selectedSections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowCompose(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={sending} className="btn-primary">
              <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Acknowledgements */}
      <Modal isOpen={!!showAcks} onClose={() => { setShowAcks(null); setAcks(null); }} title={`Acknowledgements — ${showAcks?.title}`}>
        {acks === null ? (
          <div className="text-center text-slate-400 py-4">Loading...</div>
        ) : acks.rows?.length === 0 ? (
          <div className="text-center text-slate-400 py-4">No acknowledgements yet</div>
        ) : (
          <div>
            <p className="text-sm text-slate-600 mb-3"><strong>{acks.count}</strong> people acknowledged</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(acks.rows || []).map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">{a.user?.name || a.user?.username || `User #${a.user_id}`}</span>
                  {a.acknowledged_at && <span className="text-xs text-slate-400 ml-auto">{new Date(a.acknowledged_at).toLocaleString()}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
