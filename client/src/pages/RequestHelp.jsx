import React, { useState } from 'react';
import { 
  PlusCircle, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import VoiceRecorder from '../components/VoiceRecorder';
import { submitHelpRequest } from '../services/api';

export default function RequestHelp({ onHelpSubmitted, setActivePage }) {
  const [formData, setFormData] = useState({
    category: 'education',
    title: '',
    description: '',
    city: '',
    state: 'Delhi',
    pin_code: '',
    urgency: 'standard',
    assistance_type: '',
    preferred_contact_method: 'phone',
    phone: '',
    consent_given: false,
    // Helper flow fields
    helper_mode: false,
    beneficiary_name: '',
    beneficiary_phone: '',
    proxy_consent: false
  });

  const [voiceNoteBlob, setVoiceNoteBlob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.title || !formData.description || !formData.city || !formData.phone) {
      setErrorMessage("Please complete all required fields (title, description, city, phone).");
      return;
    }

    if (!formData.consent_given) {
      setErrorMessage("You must acknowledge consent and privacy terms before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        assistance_type: formData.assistance_type || `${formData.category.replace(/_/g, ' ')} Support`
      };

      const res = await submitHelpRequest(payload);
      if (res.success) {
        onHelpSubmitted(res.data);
      } else {
        setErrorMessage(res.error?.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error connecting to MADAD service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#e47c68]">
          Explain Your Situation
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#173b39] tracking-tight">
          Request Assistance
        </h1>
        <p className="text-sm text-[#697875]">
          Every request deserves an answer. Fill out the details below so our deterministic matching engine can pair you with verified local resources.
        </p>
      </div>

      {/* Emergency Notice */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Medical Emergency Notice:</strong> If this is an immediate, life-threatening situation (severe injury, heart attack, acute respiratory distress), do NOT wait for matching. Call <strong className="text-black">112</strong> or <strong className="text-black">108</strong> immediately.
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs">
          {errorMessage}
        </div>
      )}

      {/* Intake Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#eeeae1] shadow-xs space-y-6">
        
        {/* Category */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#173b39] mb-2">
            1. Select Assistance Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'education', label: 'Education' },
              { id: 'food_and_essentials', label: 'Food & Essentials' },
              { id: 'medical_assistance', label: 'Medical Assistance' },
              { id: 'shelter_and_support', label: 'Shelter & Basic Support' },
              { id: 'community_support', label: 'Community Support' }
            ].map(cat => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                  formData.category === cat.id
                    ? 'border-[#087c70] bg-[#eef7f5] text-[#087c70] shadow-xs'
                    : 'border-[#eeeae1] hover:bg-gray-50 text-[#526461]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Request Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#173b39] mb-1">
            2. Summary of What You Need *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Need Class 9 school books and notebook kit for my daughter"
            className="w-full text-sm p-3.5 rounded-xl border border-[#eeeae1] focus:outline-none focus:ring-2 focus:ring-[#087c70]/20 focus:border-[#087c70]"
          />
        </div>

        {/* Specific Assistance Type */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#173b39] mb-1">
            3. Specific Type of Assistance *
          </label>
          <input
            type="text"
            name="assistance_type"
            required
            value={formData.assistance_type}
            onChange={handleChange}
            placeholder="e.g. Textbooks, Dry Ration Kit, Hospital Patient Guide, Temporary Bed"
            className="w-full text-sm p-3.5 rounded-xl border border-[#eeeae1] focus:outline-none focus:ring-2 focus:ring-[#087c70]/20 focus:border-[#087c70]"
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#173b39] mb-1">
            4. Explain Your Problem in Detail *
          </label>
          <textarea
            name="description"
            required
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what occurred, who needs help, and any special conditions (e.g. daily wage family, school enrollment details, hospital OPD ticket). Do not include bank passwords or private identity papers."
            className="w-full text-sm p-3.5 rounded-xl border border-[#eeeae1] focus:outline-none focus:ring-2 focus:ring-[#087c70]/20 focus:border-[#087c70]"
          />
        </div>

        {/* Voice Note Component */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#173b39] mb-2">
            5. Optional Voice Explanation
          </label>
          <VoiceRecorder
            onAudioRecorded={(url, blob, duration) => setVoiceNoteBlob(blob)}
            onDiscard={() => setVoiceNoteBlob(null)}
          />
        </div>

        {/* Location Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#173b39] mb-1">
              City / District *
            </label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. New Delhi, Lucknow"
              className="w-full text-sm p-3.5 rounded-xl border border-[#eeeae1] focus:outline-none focus:ring-2 focus:ring-[#087c70]/20 focus:border-[#087c70]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#173b39] mb-1">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Delhi, UP, Maharashtra"
              className="w-full text-sm p-3.5 rounded-xl border border-[#eeeae1] focus:outline-none focus:ring-2 focus:ring-[#087c70]/20 focus:border-[#087c70]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#173b39] mb-1">
              PIN Code (Optional)
            </label>
            <input
              type="text"
              name="pin_code"
              value={formData.pin_code}
              onChange={handleChange}
              placeholder="e.g. 110058"
              className="w-full text-sm p-3.5 rounded-xl border border-[#eeeae1] focus:outline-none focus:ring-2 focus:ring-[#087c70]/20 focus:border-[#087c70]"
            />
          </div>
        </div>

        {/* Urgency & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#173b39] mb-1">
              Urgency Level
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full text-sm p-3.5 rounded-xl border border-[#eeeae1] bg-white focus:outline-none focus:ring-2 focus:ring-[#087c70]/20 focus:border-[#087c70]"
            >
              <option value="standard">Standard Need (within 3-5 days)</option>
              <option value="urgent">Urgent Need (within 24-48 hours)</option>
              <option value="critical_emergency">Critical Situation (non-medical emergency)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#173b39] mb-1">
              Contact Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full text-sm p-3.5 rounded-xl border border-[#eeeae1] focus:outline-none focus:ring-2 focus:ring-[#087c70]/20 focus:border-[#087c70]"
            />
            <span className="text-[11px] text-[#8fa7a0] mt-1 block">
              Protected by Privacy Guard: Never exposed publicly on open boards.
            </span>
          </div>
        </div>

        {/* Consent & Privacy Acknowledgment */}
        <div className="pt-4 border-t border-[#f2f4ee]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="consent_given"
              checked={formData.consent_given}
              onChange={handleChange}
              className="mt-1 rounded text-[#087c70] focus:ring-[#087c70]"
            />
            <span className="text-xs text-[#526461] leading-relaxed">
              I certify that this request is genuine and made in good faith. I understand that MADAD is a discovery coordination platform and does not guarantee outcome. I consent to share my contact information strictly with matching providers and verified helpers for the sole purpose of resolving this request.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#087c70] hover:bg-[#075e56] text-white py-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Matching with Providers..." : (
              <>
                <span>Submit & Match Providers</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
