import { useState } from 'react';
import { feedbackAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Camera, X, Sparkles } from 'lucide-react';
import './FeedbackSubmit.css';

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
    <div className="feedback-page">
      {/* Hero Card */}
      <section className="feedback-hero">
        <div>
          <div className="feedback-kicker">
            <Sparkles size={16} />
            Platform Support
          </div>
          <h1>Feedback Desk</h1>
          <p>Report bugs, request new features, or send appreciation to our platform developers.</p>
        </div>
      </section>

      {/* Form Card */}
      <div className="feedback-card">
        <form onSubmit={handleSubmit} className="feedback-form">
          <label>
            <span>Feedback Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="bug_report">Bug Report</option>
              <option value="feature_request">Feature Request</option>
              <option value="suggestion">Suggestion</option>
              <option value="complaint">Complaint</option>
              <option value="appreciation">Appreciation</option>
            </select>
          </label>

          <label>
            <span>Subject Title *</span>
            <input
              type="text"
              required
              placeholder="e.g. Seeder page hangs on big student Excel sheets"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label>
            <span>Description *</span>
            <textarea
              required
              placeholder="Provide details about the issue, steps to reproduce, or details of your suggestion..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label>
            <span>Screenshot (Optional)</span>
            <div className="feedback-screenshot-upload">
              {screenshot ? (
                <div className="feedback-screenshot-preview">
                  <img src={screenshot} alt="screenshot preview" />
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="feedback-screenshot-remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className="feedback-upload-placeholder">
                  <Camera size={16} />
                  <span>Upload Screenshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </label>

          <div style={{ marginTop: '8px' }}>
            <button
              type="submit"
              disabled={submitting}
              className="feedback-btn-submit"
            >
              {submitting ? 'Submitting Feedback...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
