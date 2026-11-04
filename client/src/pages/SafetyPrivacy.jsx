import React from 'react';
import { ShieldCheck, AlertTriangle, Lock, EyeOff, FileText, Flag, PhoneCall } from 'lucide-react';

export default function SafetyPrivacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Title */}
      <div className="space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#e47c68]">
          Trust & Protection
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#173b39] tracking-tight">
          Safety, Privacy & Ethical Guidelines
        </h1>
        <p className="text-sm text-[#697875] max-w-2xl leading-relaxed">
          MADAD is built with strict privacy-by-design standards to protect individuals in vulnerable circumstances. Please read our safety protocols below.
        </p>
      </div>

      {/* 1. EMERGENCY MEDICAL PROTOCOL */}
      <div className="bg-red-50 border-2 border-red-200 p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-950">
              Immediate Emergency Services (Do Not Wait on MADAD)
            </h2>
            <p className="text-xs text-red-800 mt-1 leading-relaxed">
              MADAD is an asynchronous help-discovery platform. It is <strong>NOT</strong> an emergency dispatch service. If you or someone around you faces immediate life-threatening medical danger, acute trauma, or sudden illness, immediately call emergency telephone numbers:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-4 rounded-2xl border border-red-200 text-center">
            <div className="text-2xl font-black text-red-700">112</div>
            <div className="text-xs font-bold text-gray-800">All-in-One National Emergency</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-red-200 text-center">
            <div className="text-2xl font-black text-red-700">108</div>
            <div className="text-xs font-bold text-gray-800">Emergency Medical & Ambulance</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-red-200 text-center">
            <div className="text-2xl font-black text-red-700">1098</div>
            <div className="text-xs font-bold text-gray-800">Child Helpline</div>
          </div>
        </div>
      </div>

      {/* 2. PII PROTECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#eeeae1] shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-[#173b39] flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#087c70]" />
          Beneficiary Personal Data Protection
        </h3>
        <p className="text-xs sm:text-sm text-[#526461] leading-relaxed">
          We believe asking for help should never compromise personal dignity or safety. MADAD enforces strict data isolation:
        </p>
        <ul className="space-y-2.5 text-xs text-[#526461]">
          <li className="flex items-start gap-2.5">
            <EyeOff className="w-4 h-4 text-[#087c70] shrink-0 mt-0.5" />
            <span><strong>Masked Phone Numbers:</strong> Your telephone number is never displayed unmasked on public helper feeds. Only matched, verified providers can receive your contact credentials.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#087c70] shrink-0 mt-0.5" />
            <span><strong>No Exact Addresses:</strong> Only your general city/district and optional PIN code are collected for proximity matching. Exact residence locations are never cataloged publicly.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-[#087c70] shrink-0 mt-0.5" />
            <span><strong>No Sensitive Financial Data:</strong> MADAD never asks for bank account numbers, UPI PINs, Aadhaar photocopies, or credit card information.</span>
          </li>
        </ul>
      </div>

      {/* 3. VERIFICATION LIMITS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#eeeae1] shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-[#173b39] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#087c70]" />
          Provider Verification Standards & Honest Limits
        </h3>
        <p className="text-xs sm:text-sm text-[#526461] leading-relaxed">
          A provider labeled <strong>Verified</strong> means our administrative reviewers have audited their NGO trust deed, physical operational address, or government empanelment records.
        </p>
        <div className="p-4 rounded-2xl bg-[#fbfaf6] border border-[#eeeae1] text-xs text-[#697875] space-y-2">
          <div>
            <strong>What Verification Means:</strong> The organisation is a legitimate, recognized legal entity with registered operations.
          </div>
          <div>
            <strong>What Verification Does Not Mean:</strong> It does not guarantee immediate stock availability, grant entitlement, or replace direct confirmation with the provider.
          </div>
        </div>
      </div>

      {/* 4. VOICE NOTE POLICIES */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#eeeae1] shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-[#173b39] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#087c70]" />
          Consent-Based Voice Notes
        </h3>
        <p className="text-xs sm:text-sm text-[#526461] leading-relaxed">
          Voice notes are strictly voluntary tools to assist people who have difficulty typing in English or regional scripts. Recordings require your explicit checkbox consent before accessing your device microphone. You have the right to preview, re-record, or discard your audio at any time before submission.
        </p>
      </div>

      {/* 5. REPORTING MISUSE */}
      <div className="bg-[#fbfaf6] p-6 rounded-3xl border border-[#eeeae1] flex items-start gap-4">
        <Flag className="w-6 h-6 text-[#e47c68] shrink-0 mt-1" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[#173b39]">Report Suspicious Activity or Demands for Money</h4>
          <p className="text-xs text-[#697875] leading-relaxed">
            All assistance facilitated through MADAD is non-profit and social-impact oriented. If any provider or helper demands payment, bribes, or unauthorized private documents, report them immediately to <strong className="text-[#087c70]">safety@madad.gov.in</strong> or through your tracking dashboard.
          </p>
        </div>
      </div>

    </div>
  );
}
