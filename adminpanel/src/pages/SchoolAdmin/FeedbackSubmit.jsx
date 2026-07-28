import { useState } from 'react';
import { feedbackAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Select, Input, Textarea } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Camera, X, Sparkles, Send } from 'lucide-react';

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
        app_version: '1.0.0',
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
    <div className="space-y-6">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-[#14213D]">Feedback & Support Ticket Desk</span>
        </div>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Submit Support Ticket</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Feedback Category *</label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="bug_report">Bug Report</option>
                <option value="feature_request">Feature Request</option>
                <option value="appreciation">Appreciation & General Inquiry</option>
              </Select>
            </div>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Summary Title *</label>
              <Input
                required
                placeholder="Brief summary of issue or request..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Detailed Description *</label>
              <Textarea
                required
                rows={5}
                placeholder="Provide steps to reproduce or elaborate on feature request..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Attach Screenshot (Optional)</label>
              {screenshot ? (
                <div className="relative inline-block border border-[#E4E1D8] rounded-[8px] overflow-hidden">
                  <img src={screenshot} alt="Attachment" className="max-h-40 object-cover" />
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="absolute top-1 right-1 p-1 bg-[#B0403A] text-white rounded-full hover:bg-red-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 p-3 border border-dashed border-[#E4E1D8] rounded-[8px] bg-[#FAFAF8] cursor-pointer hover:border-[#2F6F5E] transition-colors text-[#52607D]">
                  <Camera className="w-4 h-4 text-[#2F6F5E]" />
                  <span>Click to attach image file...</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
                </label>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#EDEAE1]">
              <Button variant="primary" icon={Send} type="submit" loading={submitting}>
                Submit Feedback
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
