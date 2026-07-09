import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Avenra Campus</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Terms & Conditions</h1>
          <p className="text-xs text-slate-500 font-medium mb-6">Last Updated: July 8, 2026</p>
          <hr className="border-slate-100 mb-6" />

          <div className="space-y-6 text-sm leading-relaxed text-slate-600">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Acceptable Use</h2>
              <p>
                You agree to use this application only for lawful educational purposes. Users are prohibited from uploading offensive content, infringing material, or using the platform to spam transport tracking, bulk notifications, or group chats.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. AI Disclaimer & Limitations</h2>
              <p>
                The application provides AI-powered school helpers (RAG answers, lesson plans, quiz questions, and study tools) generated using Gemini models. AI-generated answers are for reference and educational assistance. We make no warranties regarding accuracy or reliability. Always double-check critical educational content.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. User Account Security</h2>
              <p>
                You are responsible for keeping your login credentials, passwords, and accounts secure. Unauthorized cross-school data access or privilege escalation attempts will result in account suspension.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. WhatsApp Messaging Services</h2>
              <p>
                Automated reminders and notifications sent via WhatsApp are supplementary. Avenra Campus is not liable for delayed delivery of transport details or attendance warnings due to telco service interruptions.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">5. Intellectual Property</h2>
              <p>
                All platform intellectual property, designs, assets, themes, and logic are owned by Avenra. Replicating, reverse engineering, or redistributing the application bundle is strictly prohibited.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">6. Contact Information</h2>
              <p>
                For questions regarding terms, acceptable use, or license parameters, contact:
                <br />
                Email: <strong>founders@avenra.org</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
