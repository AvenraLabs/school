import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { lostFoundAPI, uploadAPI } from '../../api';
import { getApiAssetUrl } from '../../api/axios';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Select, Input, Textarea } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import {
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Maximize2
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

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
      toast.error('Failed to load items catalog');
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Item title is required');
      return;
    }
    setSubmitting(true);
    try {
      await lostFoundAPI.create({
        title: title.trim(),
        type,
        date,
        description: description.trim(),
        photos: imageUrl ? [imageUrl] : photos,
      });
      toast.success('Lost & Found article reported successfully');
      setShowCreate(false);
      setTitle('');
      setDescription('');
      setPhotos([]);
      setImageUrl('');
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseItem = async (id) => {
    try {
      await lostFoundAPI.close(id);
      toast.success('Item marked resolved / returned');
      loadItems();
    } catch (err) {
      toast.error('Failed to update item status');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await lostFoundAPI.delete(id);
      toast.success('Report deleted');
      loadItems();
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const totalPages = Math.ceil(totalCount / LIMIT) || 1;

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
        <div className="flex items-center gap-1">
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
              {items.map((item) => {
                const itemPhoto = Array.isArray(item.photos) && item.photos.length > 0
                  ? item.photos[0]
                  : typeof item.photos === 'string'
                    ? item.photos
                    : item.photo_url || null;

                return (
                  <div key={item.id} className="p-3 bg-[#FAFAF8] border border-[#E4E1D8] rounded-[8px] space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={item.type === 'lost' ? 'danger' : 'active'} label={item.type.toUpperCase()} size="sm" />
                        <span className="text-[10px] font-mono text-[#8C97AB]">{formatDate(item.date)}</span>
                      </div>

                      {/* Item Image Display */}
                      {itemPhoto ? (
                        <div
                          onClick={() => setPreviewImage(getApiAssetUrl(itemPhoto))}
                          className="w-full h-36 rounded-[6px] overflow-hidden bg-slate-100 border border-[#EDEAE1] relative group cursor-pointer"
                        >
                          <img
                            src={getApiAssetUrl(itemPhoto)}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-24 rounded-[6px] bg-[#EDEAE1]/40 border border-dashed border-[#E4E1D8] flex flex-col items-center justify-center text-[#8C97AB] gap-1">
                          <ImageIcon className="w-5 h-5" />
                          <span className="text-[10px]">No photo attached</span>
                        </div>
                      )}

                      <h4 className="font-display font-bold text-xs text-[#14213D] truncate">{item.title}</h4>
                      <p className="text-[11px] text-[#52607D] line-clamp-2">{item.description || 'No description provided.'}</p>
                    </div>

                    <div className="pt-2 border-t border-[#EDEAE1] flex items-center justify-between gap-1">
                      <span className="text-[10px] text-[#8C97AB] truncate">By {item.user?.name || item.creator?.name || 'Anonymous'}</span>
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
                );
              })}
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
            <label className="block font-semibold text-[#14213D] mb-1">Detailed Description</label>
            <Textarea
              rows={3}
              placeholder="Provide specific features, brand, color, location found or lost..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Item Photo / Image (Optional)</label>
            <Input
              type="file"
              accept="image/*"
              disabled={uploadingImage}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                  setUploadingImage(true);
                  const res = await uploadAPI.uploadAnnouncement(file);
                  const uploadedUrl = res.url || res.data?.url;
                  if (uploadedUrl) {
                    setImageUrl(uploadedUrl);
                    toast.success('Photo uploaded successfully');
                  }
                } catch {
                  toast.error('Failed to upload image');
                } finally {
                  setUploadingImage(false);
                }
              }}
            />
            {imageUrl && (
              <div className="mt-2 space-y-1">
                <span className="text-[11px] text-[#2F6F5E] font-medium block">Photo attached ✓</span>
                <div className="w-24 h-24 rounded-[6px] overflow-hidden border border-[#D3E6E0] relative group">
                  <img src={getApiAssetUrl(imageUrl)} alt="Uploaded preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Post Report</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Full Size Image Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-[12px] overflow-hidden p-2 shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-1 rounded-full bg-black/50 text-white hover:bg-black z-10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={previewImage} alt="Full view" className="max-w-full max-h-[80vh] object-contain rounded-[8px]" />
          </div>
        </div>
      )}
    </div>
  );
}
