import { useState } from 'react';
import { feedbackAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Camera, X } from 'lucide-react';

function getBrowserInfo() {
  const ua = navigator.userAgent;
  let tem;
  let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return `IE ${tem[1] || ''}`;
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
  return M.join(' ');
}

export function FeedbackSubmit() {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('bug_report');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshot('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Title and Description are required');
      return;
    }
    setSubmitting(true);

    try {
      await feedbackAPI.submit({
        title,
        category,
        description,
        screenshot_url: screenshot || undefined,
        browser: getBrowserInfo(),
        app_version: '1.3.0',
      });
      toast.success('Thank you! Feedback submitted successfully.');
      setTitle('');
      setCategory('bug_report');
      setDescription('');
      setScreenshot('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title text-2xl font-bold text-slate-900">Feedback</h1>
        <p className="page-subtitle text-sm text-slate-500">Report bugs, request features, or send appreciation to platform developers.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Feedback Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            >
              <option value="bug_report">Bug Report</option>
              <option value="feature_request">Feature Request</option>
              <option value="suggestion">Suggestion</option>
              <option value="complaint">Complaint</option>
              <option value="appreciation">Appreciation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Seeder page hangs on big student Excel sheets"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description *</label>
            <textarea
              required
              rows={5}
              placeholder="Provide details about the issue or suggestion..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Screenshot (Optional)</label>
            {screenshot ? (
              <div className="relative w-40 h-30 border border-slate-200 rounded-lg overflow-hidden">
                <img src={screenshot} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeScreenshot}
                  className="absolute top-0 right-0 bg-rose-600 text-white rounded-bl p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-slate-300 hover:border-slate-400 rounded-lg px-4 py-3 flex items-center justify-center gap-2 text-slate-500 text-sm font-semibold cursor-pointer transition">
                <Camera className="w-4 h-4" /> Upload Screenshot
                <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-lg font-bold text-sm transition shadow-sm"
            >
              {submitting ? 'Submitting Feedback...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
