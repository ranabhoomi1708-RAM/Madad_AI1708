import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Building2, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { fetchProviders } from '../services/api';
import ContactModal from '../components/ContactModal';

export default function FindHelp({ selectedCategory = 'all', onSelectRequestHelp }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState(selectedCategory);
  const [cityFilter, setCityFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [activeContactProvider, setActiveContactProvider] = useState(null);
  const [expandedProvider, setExpandedProvider] = useState(null);

  useEffect(() => {
    loadProviders();
  }, [category, verificationFilter, availabilityFilter]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const res = await fetchProviders({
        category: category !== 'all' ? category : undefined,
        verification_status: verificationFilter !== 'all' ? verificationFilter : undefined,
        availability_status: availabilityFilter !== 'all' ? availabilityFilter : undefined,
        search: searchTerm || undefined,
        city: cityFilter || undefined
      });
      if (res.success) {
        setProviders(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProviders();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title & Mission */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#e47c68]">
          Resource Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#173b39] tracking-tight">
          Find Help Near You
        </h1>
        <p className="text-sm text-[#697875] max-w-2xl">
          Search genuine organisations, community kitchens, patient nav support, and shelters across India. Every provider listing includes clear verification and real-time availability states.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#eeeae1] shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords, support type, or organisation name..."
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-[#eeeae1] focus:outline-none focus:ring-2 focus:ring-[#087c70]/20 focus:border-[#087c70]"
            />
          </div>

          <div className="relative w-full md:w-64">
            <MapPin className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Filter by City or District..."
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-[#eeeae1] focus:outline-none focus:ring-2 focus:ring-[#087c70]/20 focus:border-[#087c70]"
            />
          </div>

          <button
            type="submit"
            className="bg-[#087c70] hover:bg-[#075e56] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Filter Results
          </button>
        </form>

        {/* Category & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f2f4ee]">
          <span className="text-xs font-bold text-[#526461] mr-1">Category:</span>
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'education', label: 'Education' },
            { id: 'food_and_essentials', label: 'Food & Essentials' },
            { id: 'medical_assistance', label: 'Medical' },
            { id: 'shelter_and_support', label: 'Shelter' },
            { id: 'community_support', label: 'Community' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === c.id 
                  ? 'bg-[#087c70] text-white shadow-xs' 
                  : 'bg-[#f2f4ee] text-[#526461] hover:bg-gray-200'
              }`}
            >
              {c.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="text-xs bg-[#f2f4ee] border-none rounded-lg px-2.5 py-1.5 text-[#526461] font-medium focus:ring-1 focus:ring-[#087c70]"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="text-xs bg-[#f2f4ee] border-none rounded-lg px-2.5 py-1.5 text-[#526461] font-medium focus:ring-1 focus:ring-[#087c70]"
            >
              <option value="all">All Availability</option>
              <option value="available">Available Now</option>
              <option value="limited">Limited</option>
            </select>
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      {loading ? (
        <div className="text-center py-20 text-sm text-[#8fa7a0] animate-pulse">
          Loading verified resources...
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#eeeae1] space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-[#173b39]">No Providers Match Your Current Filters</h3>
          <p className="text-xs text-[#697875] max-w-md mx-auto">
            Try resetting your city or category filters. Alternatively, submit a direct Help Request and our matching engine will search regional partners for you.
          </p>
          <button
            onClick={() => {
              setCategory('all');
              setCityFilter('');
              setSearchTerm('');
              setVerificationFilter('all');
              setAvailabilityFilter('all');
            }}
            className="text-xs font-semibold text-[#087c70] underline cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map(prov => (
            <div
              key={prov.id}
              className="bg-white rounded-3xl border border-[#eeeae1] p-6 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {prov.verification_status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-100">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-100">
                        Pending Verification
                      </span>
                    )}

                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      prov.availability_status === 'available'
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {prov.availability_status === 'available' ? 'Available' : 'Limited Capacity'}
                    </span>
                  </div>
                </div>

                {/* Name & Categories */}
                <div>
                  <h3 className="text-lg font-bold text-[#173b39] line-clamp-1">{prov.name}</h3>
                  <div className="text-xs text-[#087c70] font-semibold capitalize mt-0.5">
                    {prov.categories.map(c => c.replace(/_/g, ' ')).join(' · ')}
                  </div>
                </div>

                <p className="text-xs text-[#697875] line-clamp-3 leading-relaxed">
                  {prov.description}
                </p>

                {/* Location */}
                <div className="flex items-center gap-2 text-xs text-[#526461]">
                  <MapPin className="w-3.5 h-3.5 text-[#e47c68] shrink-0" />
                  <span>{prov.city}, {prov.state} (Serves: {prov.service_areas.slice(0, 2).join(', ')})</span>
                </div>

                {/* Assistance chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {prov.assistance_types.map((type, idx) => (
                    <span key={idx} className="bg-[#f2f4ee] text-[#173b39] text-[10px] font-medium px-2 py-0.5 rounded-md">
                      {type}
                    </span>
                  ))}
                </div>

                {/* Track Record */}
                <div className="bg-[#fbfaf6] p-2.5 rounded-xl border border-[#eeeae1] text-[11px] text-[#697875] flex items-center justify-between">
                  <span>Contact History: <strong>{prov.total_contact_attempts} calls</strong></span>
                  <span className="text-[#087c70] font-semibold">{prov.successful_resolutions} confirmed helps</span>
                </div>

                {/* Details Accordion */}
                {expandedProvider === prov.id && (
                  <div className="text-xs text-[#526461] bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2 animate-in fade-in">
                    <div>
                      <strong className="text-[#173b39]">Eligibility:</strong> {prov.eligibility_criteria || 'General public in need.'}
                    </div>
                    <div>
                      <strong className="text-[#173b39]">Address:</strong> {prov.address || `${prov.city}, ${prov.state}`}
                    </div>
                    <div>
                      <strong className="text-[#173b39]">Audit Note:</strong> {prov.verification_notes || 'Documentation under verification.'}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-[#f2f4ee] flex items-center gap-2">
                <button
                  onClick={() => setExpandedProvider(expandedProvider === prov.id ? null : prov.id)}
                  className="flex-1 text-xs font-semibold text-[#526461] hover:text-[#173b39] py-2.5 rounded-xl border border-[#eeeae1] hover:bg-gray-50 transition-colors"
                >
                  {expandedProvider === prov.id ? 'Hide Details' : 'View Details'}
                </button>

                <button
                  onClick={() => setActiveContactProvider(prov)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#087c70] hover:bg-[#075e56] text-white py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Provider
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Contact modal trigger */}
      {activeContactProvider && (
        <ContactModal
          provider={activeContactProvider}
          onClose={() => setActiveContactProvider(null)}
          onSubmitAttempt={async (attemptData) => {
            alert(`Call recorded with outcome: ${attemptData.outcome}. Thank you for maintaining accountable assistance records!`);
            loadProviders();
          }}
        />
      )}

    </div>
  );
}
