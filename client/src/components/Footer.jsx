import React from 'react';
import { AlertTriangle, Globe } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-[#0f172a] text-white pt-14 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Emergency Medical Warning Banner */}
        <div className="mb-10 p-4 rounded-2xl bg-[#1e293b] border border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-white">Emergency Medical Notice</div>
              <div className="text-xs text-gray-400">
                MADAD is a community resource finder, NOT an emergency service. In life-threatening emergencies, immediately dial <strong className="text-white">112</strong> (National Emergency) or <strong className="text-white">108</strong> (Ambulance).
              </div>
            </div>
          </div>
          <button 
            onClick={() => setActivePage('safety')}
            className="text-xs font-semibold text-[#ea580c] hover:underline whitespace-nowrap"
          >
            Read Safety Protocols →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-800">
          {/* Brand */}
          <div className="md:col-span-1 space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#ea580c]" />
              <span className="text-xl font-black tracking-tight text-white">
                <span className="text-[#ea580c]">MADAD</span>{' '}
                <span className="text-[#16a34a]">Connect</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Global help network rooted in Indian values.
              Every request deserves an answer.
            </p>
            <p className="text-[11px] text-gray-500 italic">
              "Finding a provider is not success. Resolving the person's problem is success."
            </p>
          </div>

          {/* Assistance Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Assistance</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><button onClick={() => setActivePage('find-help')} className="hover:text-white">Education & Books</button></li>
              <li><button onClick={() => setActivePage('find-help')} className="hover:text-white">Food & Ration Kits</button></li>
              <li><button onClick={() => setActivePage('find-help')} className="hover:text-white">Medical Guidance</button></li>
              <li><button onClick={() => setActivePage('find-help')} className="hover:text-white">Shelter & Support</button></li>
              <li><button onClick={() => setActivePage('find-help')} className="hover:text-white">Community Care</button></li>
            </ul>
          </div>

          {/* Workflows */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Workflows</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><button onClick={() => setActivePage('request-help')} className="hover:text-white">Ask for Help</button></li>
              <li><button onClick={() => setActivePage('give-help')} className="hover:text-white">Offer Help (Volunteer)</button></li>
              <li><button onClick={() => setActivePage('track-request')} className="hover:text-white">Track Case Journey</button></li>
              <li><button onClick={() => setActivePage('admin')} className="hover:text-white">Admin Audit Dashboard</button></li>
            </ul>
          </div>

          {/* Trust & Accountability */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Trust & Privacy</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><button onClick={() => setActivePage('safety')} className="hover:text-white">Privacy & PII Protection</button></li>
              <li><button onClick={() => setActivePage('safety')} className="hover:text-white">Provider Verification Audit</button></li>
              <li><button onClick={() => setActivePage('about')} className="hover:text-white">Our Mission & Principles</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <div>© 2026 MADAD Connect. Built with purpose, dignity, and compassion.</div>
          <div className="text-[11px]">
            National Social Impact Platform
          </div>
        </div>

      </div>
    </footer>
  );
}
