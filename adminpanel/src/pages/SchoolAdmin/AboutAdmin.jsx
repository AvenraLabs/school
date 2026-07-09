import { Sparkles } from 'lucide-react';

export function AboutAdmin() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title text-2xl font-bold text-slate-900">About</h1>
        <p className="page-subtitle text-sm text-slate-500">Information about the school management system portal application.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <h2 className="text-xl font-bold text-slate-950 mt-4">Avenra Campus</h2>
        <p className="text-xs text-slate-400 font-semibold mb-6">Version 1.3.0</p>

        <hr className="border-slate-100 my-6" />

        <div className="text-left space-y-4 max-w-sm mx-auto text-sm">
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Developer / Publisher</span>
            <strong className="text-slate-800 font-bold">Avenra</strong>
          </div>

          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Website</span>
            <a href="https://avenra.org" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
              avenra.org
            </a>
          </div>

          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Support Desk</span>
            <a href="mailto:founders@avenra.org" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
              founders@avenra.org
            </a>
          </div>

          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Copyright</span>
            <span className="text-slate-500">© {new Date().getFullYear()} Avenra. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
