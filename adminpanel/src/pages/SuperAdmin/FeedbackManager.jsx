import { useState, useEffect } from 'react';
import { feedbackAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Select, Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Search, RotateCw, ExternalLink, X, MessageSquare } from 'lucide-react';

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
      toast.error('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFeedbacks();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await feedbackAPI.updateStatus(id, newStatus);
      toast.success('Feedback status updated!');
      loadFeedbacks();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-[#14213D]">
            Global Feedback & Issue Management
          </h2>
          <p className="text-xs text-[#52607D] mt-0.5">
            Review bug reports, feature requests, and system feedback across all tenant schools.
          </p>
        </div>
        <Button variant="outline" icon={RotateCw} onClick={loadFeedbacks}>
          Refresh List
        </Button>
      </div>

      {/* Filters Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-[#E4E1D8] rounded-[10px] p-3 shadow-xs flex flex-wrap items-center gap-3">
        <Input
          icon={Search}
          placeholder="Search feedback..."
          className="w-64 text-xs"
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
          <option value="appreciation">Appreciation</option>
        </Select>
        <Button type="submit" variant="secondary" size="sm">
          Filter
        </Button>
      </form>

      {/* Feedbacks List */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Roster</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Summary Title</th>
                <th className="px-4 py-3">School / User</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#8C97AB]">Loading tickets...</td></tr>
              ) : feedbacks.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center"><EmptyState icon={MessageSquare} title="No feedback entries" description="No tickets match your filters." /></td></tr>
              ) : (
                feedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAFAF8]">
                    <td className="px-4 py-2.5 font-bold uppercase text-[10px] text-[#2F6F5E]">{item.category}</td>
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-[#14213D]">{item.title}</p>
                      <p className="text-[11px] text-[#52607D] line-clamp-1">{item.description}</p>
                    </td>
                    <td className="px-4 py-2.5 font-medium">{item.user?.name || item.school?.name || 'Anonymous'}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={item.status === 'RESOLVED' ? 'active' : item.status === 'OPEN' ? 'warning' : 'inactive'} label={item.status} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Select
                        className="w-32 text-[11px]"
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
