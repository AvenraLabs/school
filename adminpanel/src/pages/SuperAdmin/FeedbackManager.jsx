import { useState, useEffect } from 'react';
import { feedbackAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Search, RotateCw, ExternalLink, X } from 'lucide-react';

export function FeedbackManager() {
  const toast = useToast();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Selected screenshot view
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
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title text-2xl font-bold text-slate-900">Feedback Management</h1>
          <p className="page-subtitle text-sm text-slate-500">Track and resolve bug reports, feature requests, and suggestions.</p>
        </div>
        <button
          onClick={loadFeedbacks}
          className="btn-secondary flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-semibold transition"
        >
          <RotateCw className="w-4 h-4" /> Refresh List
        </button>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
        >
          <option value="">All Categories</option>
          <option value="bug_report">Bug Report</option>
          <option value="feature_request">Feature Request</option>
          <option value="suggestion">Suggestion</option>
          <option value="complaint">Complaint</option>
          <option value="appreciation">Appreciation</option>
        </select>
        <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg font-medium text-sm transition">
          Search
        </button>
      </form>

      {/* Feedback List Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading feedbacks...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No feedbacks match the criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider text-left">
                <tr>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Feedback Details</th>
                  <th className="px-6 py-3">Submitter / School</th>
                  <th className="px-6 py-3">Environment Info</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {feedbacks.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          f.category === 'bug_report'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : f.category === 'feature_request'
                            ? 'bg-sky-50 text-sky-600 border border-sky-100'
                            : f.category === 'suggestion'
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}
                      >
                        {f.category.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-bold text-slate-900 mb-1">{f.title}</p>
                      <p className="text-xs text-slate-500 whitespace-pre-wrap line-clamp-3">{f.description}</p>
                      {f.screenshot_url && (
                        <button
                          onClick={() => setPreviewImg(f.screenshot_url)}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          View Screenshot <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <p className="font-semibold text-slate-800">{f.user?.name || f.user?.username || 'Unknown'}</p>
                      <p className="text-slate-400 capitalize">{f.role.replace(/_/g, ' ')}</p>
                      <p className="text-slate-400 mt-1 font-semibold">{f.school?.school_name || 'System / Platform'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                      <p>Browser: <strong className="text-slate-500">{f.browser || '-'}</strong></p>
                      <p>App Version: <strong className="text-slate-500">{f.app_version || '-'}</strong></p>
                      <p className="mt-1">Date: {new Date(f.created_at).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={f.status}
                        onChange={(e) => handleStatusChange(f.id, e.target.value)}
                        className={`text-xs font-bold border rounded-lg px-2.5 py-1 bg-white focus:outline-none ${
                          f.status === 'OPEN'
                            ? 'text-rose-600 border-rose-200'
                            : f.status === 'IN_PROGRESS'
                            ? 'text-indigo-600 border-indigo-200'
                            : f.status === 'RESOLVED'
                            ? 'text-emerald-600 border-emerald-200'
                            : 'text-slate-600 border-slate-200'
                        }`}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Screenshot Preview Modal */}
      {previewImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setPreviewImg(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] bg-white rounded-2xl p-2 shadow-2xl overflow-hidden cursor-default" onClick={e => e.stopPropagation()}>
            <img src={previewImg} alt="Attachment" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <button
              onClick={() => setPreviewImg(null)}
              className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-950 text-white rounded-full p-1.5 shadow"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
