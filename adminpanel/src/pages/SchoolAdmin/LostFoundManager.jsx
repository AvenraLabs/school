import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { lostFoundAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Select, Input, Textarea } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Sparkles,
  Megaphone,
  Clock3,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { formatDate } from '../../utils/date';

export function LostFoundManager() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('open');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 12;

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('lost');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    setPage(0);
  }, [tab, typeFilter]);

  useEffect(() => {
    loadItems();
  }, [tab, typeFilter, page]);

  async function loadItems() {
    setLoading(true);
    try {
      let res;
      if (tab === 'open') {
        res = await lostFoundAPI.list({
          status: 'OPEN',
          type: typeFilter === 'all' ? '' : typeFilter,
          search,
          limit: LIMIT,
          offset: page * LIMIT,
        });
      } else if (tab === 'my') {
        res = await lostFoundAPI.listMy({ limit: LIMIT, offset: page * LIMIT });
      } else {
        res = await lostFoundAPI.list({
          status: 'CLOSED',
          type: typeFilter === 'all' ? '' : typeFilter,
          search,
          limit: LIMIT,
          offset: page * LIMIT,
        });
      }
      setItems(res.data || []);
      setTotalCount(res.total || 0);
    } catch (err) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await lostFoundAPI.create({
        title,
        type,
        date,
        description,
        photos: imageUrl ? [imageUrl] : photos,
      });
      toast.success('Report posted successfully');
      setShowCreate(false);
      setTitle('');
      setDescription('');
      setPhotos([]);
      setImageUrl('');
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseItem = async (id) => {
    try {
      await lostFoundAPI.update(id, { status: 'CLOSED' });
      toast.success('Item marked resolved');
      loadItems();
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await lostFoundAPI.delete(id);
      toast.success('Item deleted');
      loadItems();
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const totalPages = Math.ceil(totalCount / LIMIT);

  return (
    <div className="space-y-6">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-[#14213D]">Campus Lost & Found Register</span>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowCreate(true)}>
            Report Item
          </Button>
        </div>
      </Card>

      {/* Tabs Row & Filters */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 border-b border-transparent">
          {[
            { id: 'open', label: 'Active Reports' },
            { id: 'my', label: 'My Submissions' },
            { id: 'closed', label: 'Resolved / Returned' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
                tab === t.id
                  ? 'bg-[#EAF3F0] text-[#2F6F5E] border border-[#D3E6E0]'
                  : 'text-[#52607D] hover:bg-[#FAFAF8]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Select className="w-36 text-xs" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="lost">Lost Only</option>
            <option value="found">Found Only</option>
          </Select>
          <Input
            icon={Search}
            placeholder="Search items..."
            className="w-48 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Items */}
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#8C97AB]">Loading items catalog...</div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title="No items found"
              description="No lost or found reports match the current filters."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div key={item.id} className="p-3 bg-[#FAFAF8] border border-[#E4E1D8] rounded-[8px] space-y-2 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={item.type === 'lost' ? 'danger' : 'active'} label={item.type.toUpperCase()} size="sm" />
                      <span className="text-[10px] font-mono text-[#8C97AB]">{formatDate(item.date)}</span>
                    </div>
                    <h4 className="font-display font-bold text-xs text-[#14213D] truncate">{item.title}</h4>
                    <p className="text-[11px] text-[#52607D] line-clamp-2">{item.description || 'No description provided.'}</p>
                  </div>

                  <div className="pt-2 border-t border-[#EDEAE1] flex items-center justify-between gap-1">
                    <span className="text-[10px] text-[#8C97AB] truncate">By {item.user?.name || 'Anonymous'}</span>
                    {item.status === 'OPEN' && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" icon={CheckCircle2} className="h-6 px-2 text-[10px]" onClick={() => handleCloseItem(item.id)}>
                          Resolve
                        </Button>
                        <Button variant="ghost" size="sm" icon={Trash2} className="h-6 px-1 text-[#B0403A]" onClick={() => handleDeleteItem(item.id)} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

      {/* Modal: Create Item */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Report Lost or Found Article">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Item Title *</label>
            <Input required placeholder="e.g. Red Water Bottle, Blue Backpack" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Report Category *</label>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="lost">Lost Item</option>
                <option value="found">Found Item</option>
              </Select>
            </div>
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Date *</label>
              <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Item Photo / Image (Optional)</label>
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                  const res = await uploadAPI.uploadAnnouncement(file);
                  if (res.url || res.data?.url) {
                    setImageUrl(res.url || res.data?.url);
                    toast.success('Image uploaded');
                  }
                } catch {
                  toast.error('Failed to upload image');
                }
              }}
            />
            {imageUrl && (
              <p className="mt-1 text-[11px] text-[#2F6F5E] font-medium">Image attached ✓</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Post Report</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
