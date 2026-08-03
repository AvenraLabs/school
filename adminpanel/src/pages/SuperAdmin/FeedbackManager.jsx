import React, { useState, useEffect } from 'react';
import { feedbackAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Select, Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Search, Image as ImageIcon, X, MessageSquare, Filter } from 'lucide-react';

export function FeedbackManager() {
  const toast = useToast();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    loadFeedbacks();
  }, [statusFilter, categoryFilter]);

  async function loadFeedbacks() {
    setLoading(true);
    try {
      const res = await feedbackAPI.manage({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        search: search || undefined,
      });
      setFeedbacks(res.data || []);
    } catch (err) {
      toast.error('Failed to load feedback tickets');
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFeedbacks();
  };

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic UI update for instant feedback
    setFeedbacks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      await feedbackAPI.updateStatus(id, newStatus);
      toast.success(`Ticket status updated to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      toast.error('Failed to update status');
      loadFeedbacks(); // Revert on error
    }
  };

  const getStatusBadgeType = (status) => {
    switch (status) {
      case 'RESOLVED':
        return 'active';
      case 'IN_PROGRESS':
        return 'warning';
      case 'OPEN':
        return 'info';
      case 'CLOSED':
      default:
        return 'inactive';
    }
  };

  const formatCategory = (cat) => {
    if (!cat) return 'Feedback';
    return String(cat).replace('_', ' ');
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-[#E4E1D8] rounded-[10px] p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <Input
            icon={Search}
            placeholder="Search tickets by title or content..."
            className="w-72 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            className="w-40 text-xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </Select>
          <Select
            className="w-44 text-xs"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="bug_report">Bug Report</option>
            <option value="feature_request">Feature Request</option>
            <option value="suggestion">Suggestion</option>
            <option value="complaint">Complaint</option>
            <option value="appreciation">Appreciation</option>
          </Select>
          <Button type="submit" variant="secondary" size="sm" icon={Filter}>
            Filter
          </Button>
        </div>
      </form>

      {/* Feedbacks List Table */}
      <Card className="min-h-[320px]">
        <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <CardTitle className="text-xs font-bold text-[#14213D] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#2F6F5E]" /> Feedback & Support Tickets ({feedbacks.length})
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto min-h-[240px] pb-16">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 w-32">Category</th>
                <th className="px-4 py-3">Summary & Description</th>
                <th className="px-4 py-3 w-48">School & Reporter</th>
                <th className="px-4 py-3 w-32">Current Status</th>
                <th className="px-4 py-3 w-40 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#8C97AB] font-medium">
                    Loading support tickets...
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <EmptyState
                      icon={MessageSquare}
                      title="No feedback entries found"
                      description="No tickets match your filter criteria."
                    />
                  </td>
                </tr>
              ) : (
                feedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3 align-top">
                      <span className="inline-block px-2 py-0.5 rounded-[4px] font-bold uppercase text-[10px] bg-[#EAF3F0] text-[#2F6F5E] border border-[#D3E6E0]">
                        {formatCategory(item.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top space-y-1">
                      <p className="font-bold text-[#14213D] text-xs">{item.title}</p>
                      <p className="text-[11px] text-[#52607D] leading-relaxed whitespace-pre-wrap">
                        {item.description}
                      </p>
                      {item.screenshot_url && (
                        <button
                          type="button"
                          onClick={() => setPreviewImg(item.screenshot_url)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F6F5E] hover:underline mt-1 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" /> View Screenshot
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top space-y-0.5">
                      <p className="font-semibold text-[#14213D]">
                        {item.school?.school_name || item.school?.name || 'System / Platform'}
                      </p>
                      <p className="text-[11px] text-[#52607D]">
                        {item.user?.name || 'User'} {item.role ? `(${item.role})` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadge
                        status={getStatusBadgeType(item.status)}
                        label={item.status ? item.status.replace('_', ' ') : 'OPEN'}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <select
                        className="w-36 h-8 text-[11px] font-semibold text-[#14213D] bg-white border border-[#E4E1D8] rounded-[8px] px-2.5 outline-none focus:border-[#2F6F5E] focus:ring-2 focus:ring-[#2F6F5E]/15 transition-all cursor-pointer hover:border-[#2F6F5E]"
                        value={item.status || 'OPEN'}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Image Preview Modal */}
      {previewImg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-3xl w-full p-4 relative shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4E1D8] pb-2">
              <span className="font-bold text-xs text-[#14213D] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#2F6F5E]" /> Attached Screenshot
              </span>
              <button
                type="button"
                onClick={() => setPreviewImg(null)}
                className="p-1 text-[#52607D] hover:text-[#14213D] rounded-full hover:bg-[#FAFAF8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-[#FAFAF8] rounded-[8px] p-2">
              <img src={previewImg} alt="Feedback Screenshot" className="max-w-full h-auto rounded-[6px]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
