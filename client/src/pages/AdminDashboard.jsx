import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Filter,
  Check,
  X,
  Building2,
  RefreshCw
} from 'lucide-react';
import { fetchAdminMetrics, fetchProviders, updateProviderVerification, fetchAdminReports } from '../services/api';

export default function AdminDashboard({ user, setActivePage }) {
  const [metrics, setMetrics] = useState(null);
  const [providers, setProviders] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsRes, providersRes, reportsRes] = await Promise.all([
        fetchAdminMetrics(),
        fetchProviders(),
        fetchAdminReports()
      ]);
      if (metricsRes.success) setMetrics(metricsRes.data);
      if (providersRes.success) setProviders(providersRes.data);
      if (reportsRes.success) setReports(reportsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (providerId, newStatus) => {
    setUpdating(true);
    try {
      const res = await updateProviderVerification(
        providerId, 
        newStatus, 
        verificationNotes || `Verification status updated to ${newStatus} by Lead Administrator.`
      );
      if (res.success) {
        alert(`Provider status updated to: ${newStatus}`);
        setSelectedProvider(null);
        setVerificationNotes('');
        loadData();
      }
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eeeae1] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#087c70]">
              Operational Governance
            </span>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
              Live Database Metrics
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#173b39]">
            Administrative Audit Dashboard
          </h1>
          <p className="text-xs text-[#697875]">
            Real-time platform lifecycle oversight. Unfabricated records directly from active database store.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-[#eeeae1] text-[#173b39] px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Real Aggregate Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-[#eeeae1] shadow-xs space-y-1">
            <div className="text-[11px] font-bold uppercase text-[#8fa7a0]">Total Requests</div>
            <div className="text-2xl font-black text-[#173b39]">{metrics.requests.total}</div>
            <div className="text-[10px] text-[#697875]">Registered Cases</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#eeeae1] shadow-xs space-y-1">
            <div className="text-[11px] font-bold uppercase text-[#8fa7a0]">Matched</div>
            <div className="text-2xl font-black text-[#087c70]">{metrics.requests.matched}</div>
            <div className="text-[10px] text-[#697875]">Awaiting Contact</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#eeeae1] shadow-xs space-y-1">
            <div className="text-[11px] font-bold uppercase text-[#8fa7a0]">In Progress</div>
            <div className="text-2xl font-black text-amber-600">{metrics.requests.in_progress}</div>
            <div className="text-[10px] text-[#697875]">Calls / Intake Active</div>
          </div>

          <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
            <div className="text-[11px] font-bold uppercase text-emerald-800">User Resolved ★</div>
            <div className="text-2xl font-black text-emerald-700">{metrics.requests.resolved_by_user_confirmation}</div>
            <div className="text-[10px] text-emerald-800 font-semibold">Confirmed by User</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#eeeae1] shadow-xs space-y-1">
            <div className="text-[11px] font-bold uppercase text-[#8fa7a0]">Unresolved</div>
            <div className="text-2xl font-black text-rose-600">{metrics.requests.unresolved}</div>
            <div className="text-[10px] text-[#697875]">Fallback Active</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#eeeae1] shadow-xs space-y-1">
            <div className="text-[11px] font-bold uppercase text-[#8fa7a0]">Verified NGOs</div>
            <div className="text-2xl font-black text-[#173b39]">{metrics.providers.verified} / {metrics.providers.total}</div>
            <div className="text-[10px] text-[#697875]">{metrics.providers.pending_verification} Pending Audit</div>
          </div>

        </div>
      )}

      {/* Provider Verification & Trust Review Queue */}
      <div className="bg-white rounded-3xl border border-[#eeeae1] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f2f4ee] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#173b39] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#087c70]" />
              Provider Verification Audit Queue
            </h3>
            <p className="text-xs text-[#697875]">
              Verify NGO legal registration, 80G tax status, physical premises, or civil society empanelment.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#eeeae1] text-[#8fa7a0] font-bold uppercase">
                <th className="pb-3">Provider Name</th>
                <th className="pb-3">Categories</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f4ee]">
              {providers.map(prov => (
                <tr key={prov.id} className="hover:bg-gray-50/50">
                  <td className="py-3 font-semibold text-[#173b39]">
                    <div>{prov.name}</div>
                    <div className="text-[11px] text-[#8fa7a0] font-normal">{prov.phone}</div>
                  </td>
                  <td className="py-3 text-[#526461] capitalize">
                    {prov.categories.map(c => c.replace(/_/g, ' ')).join(', ')}
                  </td>
                  <td className="py-3 text-[#526461]">
                    {prov.city}, {prov.state}
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      prov.verification_status === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {prov.verification_status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelectedProvider(prov)}
                      className="bg-[#f2f4ee] hover:bg-[#087c70] hover:text-white text-[#173b39] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Audit / Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reports & Suspicious Activity Section */}
      <div className="bg-white rounded-3xl border border-[#eeeae1] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#f2f4ee] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#173b39] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#e47c68]" />
              Abuse & Duplicate Protection Reports ({reports.length})
            </h3>
            <p className="text-xs text-[#697875]">
              Community-flagged issues regarding fee demands, suspicious contacts, or duplicates.
            </p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#8fa7a0] bg-[#fbfaf6] rounded-2xl border border-[#eeeae1]">
            No pending abuse or duplicate reports logged. System is operating normally.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#eeeae1] text-[#8fa7a0] font-bold uppercase">
                  <th className="pb-3">Target Entity</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Reporter</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f4ee]">
                {reports.map(rep => (
                  <tr key={rep.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-[#173b39]">{rep.target_name}</td>
                    <td className="py-3 capitalize text-[#526461]">{rep.target_type}</td>
                    <td className="py-3 text-[#526461] max-w-xs">{rep.reason}</td>
                    <td className="py-3 text-[#8fa7a0]">{rep.reporter_contact}</td>
                    <td className="py-3">
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        {rep.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification Action Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eeeae1] space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between border-b border-[#eeeae1] pb-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#087c70]">
                  Official Verification Review
                </span>
                <h3 className="text-lg font-bold text-[#173b39]">
                  {selectedProvider.name}
                </h3>
              </div>
              <button onClick={() => setSelectedProvider(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#526461] space-y-2 bg-[#fbfaf6] p-4 rounded-2xl border border-[#eeeae1]">
              <div><strong>Registered Address:</strong> {selectedProvider.address || `${selectedProvider.city}, ${selectedProvider.state}`}</div>
              <div><strong>Service Areas:</strong> {selectedProvider.service_areas.join(', ')}</div>
              <div><strong>Current Audit Note:</strong> {selectedProvider.verification_notes || 'None logged.'}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#173b39] mb-1">
                Administrator Audit Notes:
              </label>
              <textarea
                rows="3"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="e.g. Inspected 80G tax exemption certificate and confirmed volunteer kitchen operations via local coordinator."
                className="w-full text-xs p-3 rounded-xl border border-[#eeeae1]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedProvider.id, 'rejected')}
                disabled={updating}
                className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold border border-red-200 transition-colors"
              >
                Mark Rejected
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProvider(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedProvider.id, 'verified')}
                  disabled={updating}
                  className="bg-[#087c70] hover:bg-[#075e56] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {updating ? "Saving..." : "Approve as Verified"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
