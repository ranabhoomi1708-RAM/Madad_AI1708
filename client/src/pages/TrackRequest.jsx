import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ThumbsUp, 
  AlertTriangle, 
  ArrowRight,
  Star,
  X
} from 'lucide-react';
import { fetchTrackRequest, confirmHelpResolution, reportStillNeedHelp, logContactAttempt } from '../services/api';
import ContactModal from '../components/ContactModal';

export default function TrackRequest({ initialCode = '' }) {
  const [trackingCode, setTrackingCode] = useState(initialCode || 'MD-2026-EDU1');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Resolution Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [selectedProviderForFeedback, setSelectedProviderForFeedback] = useState('');

  const [showStillNeedModal, setShowStillNeedModal] = useState(false);
  const [stillNeedNotes, setStillNeedNotes] = useState('');

  // Call modal
  const [activeContactProvider, setActiveContactProvider] = useState(null);

  useEffect(() => {
    if (initialCode) {
      setTrackingCode(initialCode);
      handleTrack(initialCode);
    } else {
      handleTrack(trackingCode);
    }
  }, [initialCode]);

  const handleTrack = async (codeToSearch) => {
    const code = (codeToSearch || trackingCode).trim();
    if (!code) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetchTrackRequest(code);
      if (res.success) {
        setRequest(res.data);
      } else {
        setError(res.error?.message || `No case found matching ${code}`);
        setRequest(null);
      }
    } catch (err) {
      setError("Unable to connect to MADAD server.");
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResolution = async (e) => {
    e.preventDefault();
    if (!request) return;

    try {
      const res = await confirmHelpResolution(request.id, {
        feedback_rating: rating,
        comments: feedbackComment,
        provider_id: selectedProviderForFeedback || undefined
      });
      if (res.success) {
        setRequest(res.data);
        setShowConfirmModal(false);
        alert("Thank you! Your case has been officially marked as resolved by beneficiary confirmation.");
      }
    } catch (err) {
      alert("Error saving confirmation.");
    }
  };

  const handleStillNeedHelp = async (e) => {
    e.preventDefault();
    if (!request) return;

    try {
      const res = await reportStillNeedHelp(request.id, stillNeedNotes);
      if (res.success) {
        setRequest(res.data);
        setShowStillNeedModal(false);
        alert("Your case remains active. Please reach out to the next alternative provider listed below.");
      }
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const handleAttemptRecorded = async (attemptData) => {
    try {
      const res = await logContactAttempt(request.id, attemptData);
      if (res.success) {
        setRequest(res.data.request);
        alert(`Contact attempt recorded (${attemptData.outcome}). Case timeline updated!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      submitted: { label: 'Submitted', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      matching_in_progress: { label: 'Matching In Progress', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      matched: { label: 'Providers Matched', color: 'bg-[#eef7f5] text-[#087c70] border-[#a2d8cc]' },
      contact_attempted: { label: 'Contact Attempted', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      awaiting_provider_response: { label: 'Awaiting Response', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      assistance_offered: { label: 'Assistance Offered', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      assistance_promised: { label: 'Assistance Promised (Pending Delivery)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      awaiting_user_feedback: { label: 'Awaiting Your Confirmation', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      unresolved: { label: 'Unresolved / Continuing Assistance', color: 'bg-rose-50 text-rose-700 border-rose-200' },
      resolved_by_user_confirmation: { label: '★ Resolved by User Confirmation', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' }
    };
    const s = map[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${s.color}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#e47c68]">
          Transparent Case Accountability
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#173b39] tracking-tight">
          Track Help Journey
        </h1>
        <p className="text-sm text-[#697875] max-w-2xl">
          Follow your request from initial intake, through provider calls, up to your final explicit resolution confirmation.
        </p>
      </div>

      {/* Tracking Code Search Input */}
      <div className="bg-white p-5 rounded-3xl border border-[#eeeae1] shadow-xs">
        <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Enter Tracking ID (e.g. MD-2026-EDU1)"
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-[#eeeae1] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#087c70]/20 focus:border-[#087c70]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#087c70] hover:bg-[#075e56] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Track Status
          </button>
        </form>
        <div className="text-[11px] text-[#8fa7a0] mt-2 flex items-center gap-2">
          <span>Try sample codes:</span>
          <button onClick={() => { setTrackingCode('MD-2026-EDU1'); handleTrack('MD-2026-EDU1'); }} className="text-[#087c70] underline font-mono">MD-2026-EDU1 (Matched)</button>
          <span>•</span>
          <button onClick={() => { setTrackingCode('MD-2026-FOD2'); handleTrack('MD-2026-FOD2'); }} className="text-[#087c70] underline font-mono">MD-2026-FOD2 (Resolved)</button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 text-sm text-[#8fa7a0] animate-pulse">
          Retrieving verified case records...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Lookup Error</div>
            <div className="text-xs text-red-600 mt-1">{error}</div>
          </div>
        </div>
      )}

      {request && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Case Overview Card */}
          <div className="bg-white rounded-3xl border border-[#eeeae1] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f2f4ee] pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#8fa7a0] uppercase tracking-wider">
                  Case ID: {request.tracking_code}
                </span>
                <h2 className="text-2xl font-bold text-[#173b39] mt-0.5">{request.title}</h2>
              </div>
              <div>{getStatusBadge(request.status)}</div>
            </div>

            <p className="text-xs sm:text-sm text-[#526461] leading-relaxed">
              {request.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-[#fbfaf6] p-4 rounded-2xl border border-[#eeeae1]">
              <div>
                <div className="text-[#8fa7a0] text-[11px]">Category:</div>
                <div className="font-semibold text-[#173b39] capitalize">{request.category.replace(/_/g, ' ')}</div>
              </div>
              <div>
                <div className="text-[#8fa7a0] text-[11px]">Location:</div>
                <div className="font-semibold text-[#173b39]">{request.city}, {request.state}</div>
              </div>
              <div>
                <div className="text-[#8fa7a0] text-[11px]">Urgency:</div>
                <div className="font-semibold text-[#173b39] capitalize">{request.urgency}</div>
              </div>
              <div>
                <div className="text-[#8fa7a0] text-[11px]">Contact (Protected):</div>
                <div className="font-semibold text-[#173b39]">{request.contact_phone_masked || "Protected"}</div>
              </div>
            </div>

            {/* RESOLUTION ACTIONS (THE CORE PRODUCT PRINCIPLE) */}
            {request.status !== 'resolved_by_user_confirmation' ? (
              <div className="bg-[#f2f4ee] p-5 rounded-2xl border border-[#eeeae1] space-y-3">
                <div className="text-xs font-bold text-[#173b39]">
                  Have you received the assistance you required?
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="flex items-center gap-2 bg-[#087c70] hover:bg-[#075e56] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Yes, I received help
                  </button>

                  <button
                    onClick={() => setShowStillNeedModal(true)}
                    className="flex items-center gap-2 bg-white hover:bg-gray-100 text-rose-700 border border-rose-200 px-5 py-2.5 rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    No, I still need help
                  </button>
                </div>
                <p className="text-[11px] text-[#697875]">
                  Only your confirmation marks this case resolved. We never assume assistance happened automatically.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Successfully Resolved by Beneficiary Confirmation
                </div>
                <p className="text-emerald-700">
                  {request.resolution_notes || "Assistance successfully confirmed. Thank you for contributing to an accountable social support network."}
                </p>
              </div>
            )}
          </div>

          {/* Case Lifecycle Timeline */}
          <div className="bg-white rounded-3xl border border-[#eeeae1] p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-[#173b39] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#087c70]" />
              Case History & Timeline
            </h3>

            <div className="relative pl-6 space-y-6 border-l-2 border-[#eeeae1]">
              {(request.timeline || []).map((event, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#087c70] border-2 border-white ring-2 ring-[#eeeae1]"></span>
                  <div className="text-xs text-[#8fa7a0]">
                    {new Date(event.created_at).toLocaleString()}
                  </div>
                  <h4 className="text-sm font-bold text-[#173b39] mt-0.5">
                    {event.update_title}
                  </h4>
                  <p className="text-xs text-[#697875] mt-1 leading-relaxed">
                    {event.update_description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Matching Providers & Smart Alternatives for this Request */}
          <div className="bg-white rounded-3xl border border-[#eeeae1] p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-[#173b39]">
              Matching Providers for This Case
            </h3>

            <div className="space-y-4">
              {(request.matches || []).map((m, idx) => (
                <div 
                  key={m.provider.id}
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    idx === 0 ? 'border-[#087c70] bg-[#fbfaf6]' : 'border-[#eeeae1] bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#173b39]">{m.provider.name}</span>
                      {idx === 0 && (
                        <span className="bg-[#087c70] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Primary Match ({m.match_score}%)
                        </span>
                      )}
                      {idx > 0 && (
                        <span className="bg-[#f2f4ee] text-[#526461] text-[10px] font-medium px-2 py-0.5 rounded-full">
                          Alternative #{idx}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#697875]">{m.provider.description}</div>
                    <div className="text-[11px] text-[#8fa7a0]">
                      📍 {m.provider.city} · Phone: <strong className="text-[#173b39]">{m.provider.phone}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveContactProvider(m.provider)}
                    className="flex items-center gap-2 bg-[#087c70] hover:bg-[#075e56] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Provider
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Confirmation Modal ("Yes, I received help") */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#eeeae1] space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between border-b border-[#eeeae1] pb-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#087c70]">
                  User Confirmation
                </span>
                <h3 className="text-lg font-bold text-[#173b39]">
                  Confirm Assistance Received
                </h3>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResolution} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#173b39] mb-1">
                  How was your experience?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173b39] mb-1">
                  Confirmation Details / Notes (Optional):
                </label>
                <textarea
                  rows="3"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="e.g. Received 9th grade textbooks directly from Shiksha Sahyog. Thank you."
                  className="w-full text-xs p-3 rounded-xl border border-[#eeeae1]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#087c70] hover:bg-[#075e56] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs"
                >
                  Verify & Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Still Need Help Modal */}
      {showStillNeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#eeeae1] space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between border-b border-[#eeeae1] pb-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-rose-600">
                  Continued Support
                </span>
                <h3 className="text-lg font-bold text-[#173b39]">
                  I Still Need Help
                </h3>
              </div>
              <button onClick={() => setShowStillNeedModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStillNeedHelp} className="space-y-4">
              <p className="text-xs text-[#697875] leading-relaxed">
                Your request will remain completely open and active. We will also promote alternative providers and highlight your case in the community helper pool.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#173b39] mb-1">
                  What happened with the previous attempts? (Optional)
                </label>
                <textarea
                  rows="3"
                  value={stillNeedNotes}
                  onChange={(e) => setStillNeedNotes(e.target.value)}
                  placeholder="e.g. Provider phone was not reachable, or they were out of stock for books."
                  className="w-full text-xs p-3 rounded-xl border border-[#eeeae1]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStillNeedModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs"
                >
                  Keep Request Active
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
