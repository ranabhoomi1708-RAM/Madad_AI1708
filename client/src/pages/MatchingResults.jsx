import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Copy, 
  Check, 
  HelpCircle,
  Building2,
  AlertCircle
} from 'lucide-react';
import ContactModal from '../components/ContactModal';
import { logContactAttempt } from '../services/api';

export default function MatchingResults({ requestData, onNavigateToTrack }) {
  const [copied, setCopied] = useState(false);
  const [activeContactProvider, setActiveContactProvider] = useState(null);
  const [request, setRequest] = useState(requestData);

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <p className="text-sm text-[#697875]">No active matching session found. Please submit a request or track an existing code.</p>
      </div>
    );
  }

  const matches = request.matches || [];
  const bestMatch = matches.find(m => m.is_best_match) || matches[0];
  const alternatives = matches.filter(m => m !== bestMatch);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(request.tracking_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAttemptRecorded = async (attemptData) => {
    try {
      const res = await logContactAttempt(request.id, attemptData);
      if (res.success) {
        setRequest(res.data.request);
        alert(`Call recorded as: ${attemptData.outcome}. Timeline updated!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Success Confirmation Header */}
      <div className="bg-[#eef7f5] border border-[#a2d8cc] p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#087c70]">
            <CheckCircle2 className="w-4 h-4" />
            Request Successfully Registered
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173b39]">
            {request.title}
          </h1>
          <p className="text-xs text-[#526461]">
            Registered for <strong>{request.city}</strong> under <strong className="capitalize">{request.category.replace(/_/g, ' ')}</strong>.
          </p>
        </div>

        {/* Tracking Code Chip */}
        <div className="bg-white p-4 rounded-2xl border border-[#eeeae1] shadow-xs text-center shrink-0">
          <div className="text-[11px] font-bold text-[#8fa7a0] uppercase tracking-wider">
            Your Tracking ID
          </div>
          <div className="text-xl font-black text-[#087c70] tracking-wide my-1">
            {request.tracking_code}
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[#526461] hover:text-[#173b39] mx-auto transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Code"}</span>
          </button>
        </div>
      </div>

      {/* Matching Rationale Notice */}
      <div className="flex items-center justify-between text-xs text-[#697875] border-b border-[#eeeae1] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#e47c68]" />
          <span>Showing <strong>1 Recommended Provider</strong> and <strong>{alternatives.length} Verified Alternatives</strong> based on category, city, and verified capacity.</span>
        </div>
        <button
          onClick={() => onNavigateToTrack(request.tracking_code)}
          className="font-bold text-[#087c70] hover:underline flex items-center gap-1 cursor-pointer"
        >
          Track Case Timeline <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 1. BEST MATCH CARD */}
      {bestMatch && (
        <div className="bg-white rounded-3xl border-2 border-[#087c70] p-6 sm:p-8 shadow-md relative space-y-6">
          <div className="absolute -top-3.5 left-8 bg-[#087c70] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs">
            ★ Best Recommended Match ({bestMatch.match_score}% Score)
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-[#173b39]">
                  {bestMatch.provider.name}
                </h2>
                {bestMatch.provider.verification_status === 'verified' && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Provider
                  </span>
                )}
              </div>
              <div className="text-xs text-[#526461] flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#e47c68]" />
                  {bestMatch.provider.city}, {bestMatch.provider.state}
                </span>
                <span>•</span>
                <span>Availability: <strong className="text-[#087c70] capitalize">{bestMatch.provider.availability_status}</strong></span>
              </div>
            </div>

            {/* Direct Call Button */}
            <button
              onClick={() => setActiveContactProvider(bestMatch.provider)}
              className="flex items-center gap-2 bg-[#087c70] hover:bg-[#075e56] text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-sm transition-all hover:scale-105 cursor-pointer shrink-0"
            >
              <Phone className="w-4 h-4" />
              Call Provider ({bestMatch.provider.phone})
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#526461] leading-relaxed">
            {bestMatch.provider.description}
          </p>

          {/* Transparent Match Rationale Box */}
          <div className="bg-[#fbfaf6] p-4 rounded-2xl border border-[#eeeae1] space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#173b39]">
              Why this provider matches your request:
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#526461]">
              {bestMatch.rationale.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#087c70] shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-xs text-[#8fa7a0] flex flex-wrap gap-4 pt-2 border-t border-[#f2f4ee]">
            <span>Eligibility: <strong>{bestMatch.provider.eligibility_criteria || 'General Public'}</strong></span>
            <span>Audited Support Count: <strong>{bestMatch.provider.successful_resolutions} verified resolutions</strong></span>
          </div>
        </div>
      )}

      {/* 2. ALTERNATIVE PROVIDERS (SMART FALLBACK) */}
      {alternatives.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#173b39]">
              Verified Alternative Providers (Smart Fallback)
            </h3>
            <p className="text-xs text-[#697875]">
              If the primary provider is busy or does not answer, you can immediately contact these alternative organisations:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {alternatives.map((alt, idx) => (
              <div 
                key={alt.provider.id}
                className="bg-white p-6 rounded-3xl border border-[#eeeae1] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-[#e47c68]">Alternative #{idx + 1} ({alt.match_score}% Score)</span>
                    <span className="capitalize text-[#087c70] font-semibold">{alt.provider.availability_status}</span>
                  </div>
                  <h4 className="text-base font-bold text-[#173b39]">{alt.provider.name}</h4>
                  <p className="text-xs text-[#697875] line-clamp-2 mt-1">{alt.provider.description}</p>
                  
                  <div className="mt-3 text-[11px] text-[#526461] space-y-1">
                    <div>📍 {alt.provider.city}, {alt.provider.state}</div>
                    <div>🎯 {alt.rationale[0] || 'Category compatibility'}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#f2f4ee] flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#173b39]">{alt.provider.phone}</div>
                  <button
                    onClick={() => setActiveContactProvider(alt.provider)}
                    className="flex items-center gap-1.5 bg-[#f2f4ee] hover:bg-[#087c70] hover:text-white text-[#173b39] px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Alternative
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Follow-up */}
      <div className="bg-[#fbfaf6] p-6 rounded-3xl border border-[#eeeae1] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-[#173b39]">Need to track your request later?</h4>
          <p className="text-xs text-[#697875]">Use tracking code <strong>{request.tracking_code}</strong> anytime to monitor updates, record outcomes, or confirm resolution.</p>
        </div>
        <button
          onClick={() => onNavigateToTrack(request.tracking_code)}
          className="bg-[#087c70] hover:bg-[#075e56] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          Open Case Tracker
        </button>
      </div>

      {/* Contact modal */}
      {activeContactProvider && (
        <ContactModal
          provider={activeContactProvider}
          request={request}
          onClose={() => setActiveContactProvider(null)}
          onSubmitAttempt={handleAttemptRecorded}
        />
      )}

    </div>
  );
}
