import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  HeartHandshake, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  X,
  Filter
} from 'lucide-react';
import { fetchGiveHelpFeed, submitAssistanceOffer } from '../services/api';

export default function GiveHelp({ user }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  
  // Offer Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [offerMessage, setOfferMessage] = useState('');
  const [helperName, setHelperName] = useState(user?.full_name || '');
  const [helperPhone, setHelperPhone] = useState('');
  const [helperEmail, setHelperEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);

  useEffect(() => {
    loadFeed();
  }, [category, urgencyFilter]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const res = await fetchGiveHelpFeed({
        category: category !== 'all' ? category : undefined,
        urgency: urgencyFilter !== 'all' ? urgencyFilter : undefined,
        city: cityFilter || undefined
      });
      if (res.success) {
        setFeed(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offerMessage || !helperName) return;

    setIsSubmitting(true);
    try {
      const res = await submitAssistanceOffer(selectedRequest.id, {
        message: offerMessage,
        helper_name: helperName,
        phone: helperPhone,
        email: helperEmail
      });

      if (res.success) {
        setSuccessBanner(`Your assistance offer for case ${selectedRequest.tracking_code} was recorded. Thank you for stepping forward!`);
        setSelectedRequest(null);
        setOfferMessage('');
        loadFeed();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Privacy Pledge */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#e47c68]">
          Community Solidarity
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#173b39] tracking-tight">
          Give Help & Volunteer
        </h1>
        <p className="text-sm text-[#697875] max-w-2xl">
          Browse active assistance requests across India where individual donors, volunteers, or local groups can offer direct support.
        </p>
      </div>

      {/* Privacy Guard Notice */}
      <div className="bg-[#eef7f5] border border-[#a2d8cc] p-4 rounded-2xl flex items-center gap-3 text-xs text-[#087c70]">
        <ShieldCheck className="w-5 h-5 shrink-0 text-[#087c70]" />
        <div>
          <strong>Privacy Safeguard Active:</strong> To preserve the dignity and safety of beneficiaries, private telephone numbers and exact residential addresses are withheld from public view.
        </div>
      </div>

      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#eeeae1] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#526461] mr-1">Filter Need:</span>
          {['all', 'education', 'food_and_essentials', 'medical_assistance', 'shelter_and_support', 'community_support'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                category === cat 
                  ? 'bg-[#087c70] text-white shadow-xs' 
                  : 'bg-[#f2f4ee] text-[#526461] hover:bg-gray-200'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="text-xs bg-[#f2f4ee] border-none rounded-lg px-3 py-2 text-[#526461] font-medium"
          >
            <option value="all">All Urgency Levels</option>
            <option value="urgent">Urgent First</option>
            <option value="standard">Standard Need</option>
          </select>
        </div>
      </div>

      {/* Requests Feed */}
      {loading ? (
        <div className="text-center py-20 text-sm text-[#8fa7a0] animate-pulse">
          Loading open assistance needs...
        </div>
      ) : feed.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#eeeae1] space-y-3">
          <HeartHandshake className="w-12 h-12 text-[#087c70] mx-auto opacity-70" />
          <h3 className="text-base font-bold text-[#173b39]">No Open Requests Under Selected Filters</h3>
          <p className="text-xs text-[#697875]">Check back soon or broaden your search to other categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feed.map(item => (
            <div 
              key={item.id}
              className="bg-white p-6 rounded-3xl border border-[#eeeae1] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#087c70] bg-[#eef7f5] px-2.5 py-0.5 rounded-md">
                    {item.category.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    item.urgency === 'urgent' ? 'bg-rose-50 text-rose-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {item.urgency.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#173b39] line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs text-[#697875] line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                <div className="text-xs text-[#526461] space-y-1 pt-2 border-t border-[#f2f4ee]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#e47c68]" />
                    <span>{item.city}, {item.state}</span>
                  </div>
                  <div className="text-[11px] text-[#8fa7a0]">
                    Case ID: <span className="font-mono font-semibold text-[#173b39]">{item.tracking_code}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#f2f4ee]">
                <button
                  onClick={() => setSelectedRequest(item)}
                  className="w-full flex items-center justify-center gap-2 bg-[#087c70] hover:bg-[#075e56] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  Offer Assistance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offer Help Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eeeae1] space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between border-b border-[#eeeae1] pb-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#e47c68]">
                  Volunteer Assistance Offer
                </span>
                <h3 className="text-lg font-bold text-[#173b39]">
                  Offer Help for {selectedRequest.tracking_code}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#fbfaf6] p-3 rounded-xl border border-[#eeeae1] text-xs text-[#526461]">
              <strong>Request:</strong> "{selectedRequest.title}" in {selectedRequest.city}.
            </div>

            <form onSubmit={handleOfferSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#173b39] mb-1">
                  How can you help? *
                </label>
                <textarea
                  required
                  rows="3"
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="e.g. I have 9th standard NCERT science textbooks in good condition and can drop them off or courier them."
                  className="w-full text-xs p-3 rounded-xl border border-[#eeeae1] focus:outline-none focus:ring-2 focus:ring-[#087c70]/20 focus:border-[#087c70]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#173b39] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={helperName}
                    onChange={(e) => setHelperName(e.target.value)}
                    placeholder="Anita Deshmukh"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#eeeae1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173b39] mb-1">
                    Your Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={helperPhone}
                    onChange={(e) => setHelperPhone(e.target.value)}
                    placeholder="+91 98200 •••••"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#eeeae1]"
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#8fa7a0] bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <strong>Accountability Reminder:</strong> Submitting this offer records your intention. It does NOT automatically mark the beneficiary's request as resolved until they confirm help was received.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#087c70] hover:bg-[#075e56] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Send Assistance Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
