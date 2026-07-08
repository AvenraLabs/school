import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">School App</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-xs text-slate-500 font-medium mb-6">Last Updated: July 8, 2026</p>
          <hr className="border-slate-100 mb-6" />

          <div className="space-y-6 text-sm leading-relaxed text-slate-600">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Information We Collect</h2>
              <p>
                We collect personal information necessary to deliver educational tracking services. This includes student names, roll numbers, teacher names, parent contact numbers, and school registration info. We also store photos and documents uploaded during general features like Lost & Found or homework assignments.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Student & Teacher Data</h2>
              <p>
                Student and teacher data is kept highly confidential and scoped strictly under their registered tenant school. We apply strict database scoping and access control policies to prevent unauthorized data leaks.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. AI Usage & Logs</h2>
              <p>
                Our educational helpers utilize generative AI technology (such as Gemini) to provide academic assistance, grade help, and teacher planning logs. AI interactions are audited, logged, and tracked for quota limits. Sensitive or identifiable personal data is stripped before communication with AI providers.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. WhatsApp Notifications</h2>
              <p>
                We dispatch critical school notifications, attendance alerts, exam results, and transport schedules to parents' phone numbers via WhatsApp API. Users can configure alert preferences from the profile settings panel.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">5. GPS Transport Tracking</h2>
              <p>
                Our application implements GPS position tracking on driver mobile devices for monitoring school bus coordinates during active routes. Coordinates are only broadcast when a trip is active and are shared only with the respective student/parent tenants mapped to the vehicle.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">6. Data Protection</h2>
              <p>
                All data is encrypted in transit using industry-standard SSL/TLS protocols and stored securely in dedicated PostgreSQL databases. Access logs and operations are tracked to avoid privilege escalation.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">7. Contact Information</h2>
              <p>
                For questions regarding data practices or to request data deletion, contact us at:
                <br />
                Email: <strong>support@avenra.org</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
