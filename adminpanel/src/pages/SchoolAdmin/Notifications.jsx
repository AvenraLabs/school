import React, { useEffect, useMemo, useState } from 'react';
import { notificationsAPI, classesAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  Bell,
  CheckCircle,
  Clock3,
  Eye,
  GraduationCap,
  Megaphone,
  Search,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import './Notifications.css';

const audienceMeta = {
  all: { label: 'Everyone', icon: Users, tone: 'all' },
  student: { label: 'Students', icon: GraduationCap, tone: 'student' },
  teacher: { label: 'Teachers', icon: Users, tone: 'teacher' },
};

const formatDate = (value) => {
  if (!value) return 'Just now';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [showAcks, setShowAcks] = useState(null);
  const [acks, setAcks] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', message: '', target_role: 'all', class_id: '', section_id: '', send_whatsapp: false });
  const [sending, setSending] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadNotifications();
    loadClasses();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationsAPI.list();
      setNotifications(res.items || []);
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
    } catch (e) {
      /* optional data */
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await notificationsAPI.create(
        form.title,
        form.message,
        form.target_role,
        form.class_id ? Number(form.class_id) : undefined,
        form.section_id ? Number(form.section_id) : undefined,
        form.send_whatsapp
      );
      toast.success('Notification sent');
      setShowCompose(false);
      setForm({ title: '', message: '', target_role: 'all', class_id: '', section_id: '', send_whatsapp: false });
      loadNotifications();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const viewAcks = async (notif) => {
    setShowAcks(notif);
    setAcks(null);
    try {
      const res = await notificationsAPI.getAcknowledgements(notif.id);
      setAcks(res.data || { count: 0, rows: [] });
    } catch (e) {
      setAcks({ count: 0, rows: [] });
    }
  };

  const selectedSections = classes.find((c) => String(c.id) === String(form.class_id))?.sections || [];

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notifications.filter((notification) => {
      const role = notification.target_role || 'all';
      const matchesRole = filter === 'all' || role === filter;
      const matchesQuery = !normalizedQuery
        || notification.title?.toLowerCase().includes(normalizedQuery)
        || notification.message?.toLowerCase().includes(normalizedQuery);
      return matchesRole && matchesQuery;
    });
  }, [filter, notifications, query]);

  const stats = useMemo(() => ({
    total: notifications.length,
    student: notifications.filter((item) => item.target_role === 'student').length,
    teacher: notifications.filter((item) => item.target_role === 'teacher').length,
  }), [notifications]);

  return (
    <div className="notifications-page">
      <section className="notifications-hero">
        <div className="notifications-hero-copy">
          <div className="notifications-kicker">
            <Sparkles size={16} />
            School announcements
          </div>
          <h1>Announcements</h1>
          <p>Send clean, targeted announcements to students, teachers, classes, and sections.</p>
        </div>
        <button onClick={() => setShowCompose(true)} className="notify-btn notify-btn-primary">
          <Send size={18} />
          Compose
        </button>
      </section>

      <section className="notifications-stats">
        <div className="notify-stat-card">
          <span>Total Sent</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="notify-stat-card">
          <span>Students</span>
          <strong>{stats.student}</strong>
        </div>
        <div className="notify-stat-card">
          <span>Teachers</span>
          <strong>{stats.teacher}</strong>
        </div>
      </section>

      <section className="notifications-toolbar">
        <div className="notifications-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or message"
          />
        </div>
        <div className="notifications-filters">
          {['all', 'student', 'teacher'].map((role) => (
            <button
              key={role}
              type="button"
              className={filter === role ? 'active' : ''}
              onClick={() => setFilter(role)}
            >
              {audienceMeta[role].label}
            </button>
          ))}
        </div>
      </section>

      <section className="notifications-grid">
        {loading ? (
          <div className="notifications-empty">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={42} />
            <strong>No notifications found</strong>
            <span>Try a different filter or compose a new announcement.</span>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const role = notification.target_role || 'all';
            const meta = audienceMeta[role] || audienceMeta.all;
            const AudienceIcon = meta.icon;
            return (
              <article key={notification.id} className="notification-card">
                <div className="notification-card-top">
                  <div className={`notification-icon ${meta.tone}`}>
                    <AudienceIcon size={20} />
                  </div>
                  <span className={`notification-chip ${meta.tone}`}>{meta.label}</span>
                </div>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <div className="notification-card-meta">
                  <span>
                    <Clock3 size={14} />
                    {formatDate(notification.created_at)}
                  </span>
                  <button type="button" onClick={() => viewAcks(notification)}>
                    <Eye size={15} />
                    Acks
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>

      <Modal isOpen={showCompose} onClose={() => setShowCompose(false)} title="Compose Announcement" maxWidth="max-w-xl">
        <form onSubmit={handleSend} className="notify-form">
          <label>
            <span>Title</span>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="New homework assigned" />
          </label>
          <label>
            <span>Message</span>
            <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write a short, clear message..." />
          </label>
          <div className="notify-form-grid">
            <label>
              <span>Target</span>
              <select value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })}>
                <option value="all">Everyone</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
              </select>
            </label>
            <label>
              <span>Class</span>
              <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value, section_id: '' })}>
                <option value="">All classes</option>
                {classes.map((item) => <option key={item.id} value={item.id}>{item.class_name}</option>)}
              </select>
            </label>
            <label>
              <span>Section</span>
              <select value={form.section_id} onChange={(e) => setForm({ ...form, section_id: e.target.value })} disabled={!form.class_id}>
                <option value="">All sections</option>
                {selectedSections.map((section) => <option key={section.id} value={section.id}>Section {section.name}</option>)}
              </select>
            </label>
          </div>
          <div className="notify-whatsapp-option" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0 8px' }}>
            <input
              type="checkbox"
              id="send_whatsapp"
              checked={form.send_whatsapp || false}
              onChange={(e) => setForm({ ...form, send_whatsapp: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="send_whatsapp" style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Send via WhatsApp
            </label>
          </div>
          <div className="notify-form-actions">
            <button type="button" onClick={() => setShowCompose(false)} className="notify-btn notify-btn-soft">Cancel</button>
            <button type="submit" disabled={sending} className="notify-btn notify-btn-primary">
              <Send size={16} />
              {sending ? 'Sending...' : 'Send announcement'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showAcks} onClose={() => { setShowAcks(null); setAcks(null); }} title={`Acknowledgements - ${showAcks?.title || ''}`}>
        {acks === null ? (
          <div className="acks-empty">Loading acknowledgements...</div>
        ) : acks.rows?.length === 0 ? (
          <div className="acks-empty">No acknowledgements yet</div>
        ) : (
          <div className="acks-panel">
            <div className="acks-count">
              <Megaphone size={16} />
              <strong>{acks.count}</strong> people acknowledged
            </div>
            {(acks.rows || []).map((ack, index) => (
              <div key={index} className="ack-row">
                <CheckCircle size={17} />
                <span>{ack.user?.name || ack.user?.username || `User #${ack.user_id}`}</span>
                {ack.acknowledged_at && <small>{formatDate(ack.acknowledged_at)}</small>}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
