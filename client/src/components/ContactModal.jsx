import React, { useState } from 'react';
import { Phone, CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare, X } from 'lucide-react';

export default function ContactModal({ provider, request, onClose, onSubmitAttempt }) {
  const [outcome, setOutcome] = useState('connected');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);

  const outcomes = [
    { id: 'connected', label: 'Connected / Spoke with staff', icon: Phone, color: 'text-emerald-700' },
    { id: 'help_promised', label: 'Help Promised / Intake agreed', icon: CheckCircle, color: 'text-[#087c70]' },
    { id: 'asked_to_call_later', label: 'Asked to call back later', icon: Clock, color: 'text-amber-700' },
    { id: 'no_answer', label: 'No answer / Line busy', icon: AlertTriangle, color: 'text-amber-700' },
    { id: 'provider_cannot_help', label: 'Cannot help / Out of capacity (Activates Smart Fallback)', icon: XCircle, color: 'text-red-600' },
    { id: 'number_unavailable', label: 'Number invalid / Switched off', icon: XCircle, color: 'text-red-600' },
    { id: 'other', label: 'Other outcome', icon: MessageSquare, color: 'text-[#526461]' }
  ];

  const handleCall = () => {
    setCallInitiated(true);
    window.location.href = `tel:${provider.phone.replace(/\s+/g, '')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitAttempt({
        provider_id: provider.id,
        outcome,
        notes
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eeeae1] space-y-5 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#eeeae1] pb-4">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#e47c68]">
              Direct Contact & Lifecycle Tracking
            </span>
            <h3 className="text-xl font-bold text-[#173b39] mt-0.5">
              Contact {provider.name}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Call Banner */}
        <div className="bg-[#f2f4ee] p-4 rounded-2xl border border-[#eeeae1] flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#697875]">Listed Provider Phone:</div>
            <div className="text-base font-bold text-[#173b39]">{provider.phone}</div>
            <div className="text-[11px] text-[#8fa7a0] mt-0.5">
              Opens standard dialer. Call connects outside MADAD.
            </div>
          </div>
          <button
            type="button"
            onClick={handleCall}
            className="flex items-center gap-2 bg-[#087c70] hover:bg-[#075e56] text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-transform active:scale-95"
          >
            <Phone className="w-4 h-4" />
            {callInitiated ? "Call Again" : "Call Now"}
          </button>
        </div>

        {/* Outcome Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#173b39] mb-2">
              Record What Happened on the Call:
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {outcomes.map(opt => {
                const IconComponent = opt.icon;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      outcome === opt.id 
                        ? 'border-[#087c70] bg-[#eef7f5] font-semibold text-[#173b39]' 
                        : 'border-[#eeeae1] hover:bg-gray-50 text-[#526461]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="contact_outcome"
                      value={opt.id}
                      checked={outcome === opt.id}
                      onChange={(e) => setOutcome(e.target.value)}
                      className="text-[#087c70] focus:ring-[#087c70]"
                    />
                    <IconComponent className={`w-4 h-4 ${opt.color} shrink-0`} />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#173b39] mb-1">
              Interaction Notes (Optional):
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Spoke to Mr. Rajesh; he asked for enrollment certificate tomorrow morning."
              className="w-full text-xs p-3 rounded-xl border border-[#eeeae1] focus:outline-none focus:ring-2 focus:ring-[#087c70]/20 focus:border-[#087c70]"
            />
          </div>

          {/* Fallback Notice */}
          {(outcome === 'provider_cannot_help' || outcome === 'number_unavailable') && (
            <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <strong>Smart Fallback Active:</strong> Your request remains completely open. We will immediately advance you to the next verified alternative provider so you do not reach a dead end.
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#697875] hover:text-[#173b39]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#087c70] hover:bg-[#075e56] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "Recording..." : "Save Outcome & Update Case"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
