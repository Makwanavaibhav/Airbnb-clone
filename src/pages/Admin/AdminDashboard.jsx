import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import axios from "axios";
import {
  ShieldCheck, Loader2, ChevronRight, ArrowLeft,
  CheckCircle2, XCircle, FileText, ExternalLink, User, Star, Clock
} from "lucide-react";

const API = "http://localhost:5001";

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending_review: "bg-amber-100 text-amber-800",
    active:         "bg-green-100 text-green-800",
    rejected:       "bg-red-100 text-red-700",
    draft:          "bg-gray-100 text-gray-600",
  };
  const label = { pending_review: "Pending Review", active: "Active", rejected: "Rejected", draft: "Draft" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${status === "active" ? "bg-green-500" : status === "pending_review" ? "bg-amber-500" : status === "rejected" ? "bg-red-500" : "bg-gray-400"}`} />
      {label[status] || status}
    </span>
  );
};

// ── Reject Modal ──────────────────────────────────────────────────────────────
const RejectModal = ({ onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Listing</h3>
        <p className="text-sm text-gray-500 mb-4">Please provide a reason so the host can revise and resubmit.</p>
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4}
          placeholder="e.g. Photos are blurry. Please upload clearer images showing the full experience..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none" />
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => reason.trim() && onConfirm(reason.trim())} disabled={!reason.trim() || loading}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Rejecting..." : "Reject Listing"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Detail view ───────────────────────────────────────────────────────────────
const ListingDetail = ({ listing, onBack, onApprove, onReject }) => {
  const { getToken } = useAuth();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(
          `${API}/api/listings/admin/${listing._listingType}/${listing._id}`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        setDetail(res.data);
      } catch { setDetail(null); }
      finally { setLoading(false); }
    };
    fetch();
  }, [listing._id]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await axios.patch(
        `${API}/api/listings/admin/${listing._listingType}/${listing._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      showToast("Listing approved and is now live!");
      setTimeout(() => { onApprove(); onBack(); }, 1500);
    } catch (e) {
      showToast(e.response?.data?.error || "Approval failed", "error");
    } finally { setActionLoading(false); }
  };

  const handleReject = async (reason) => {
    setActionLoading(true);
    try {
      await axios.patch(
        `${API}/api/listings/admin/${listing._listingType}/${listing._id}/reject`,
        { rejection_reason: reason },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setShowRejectModal(false);
      showToast("Listing rejected. Host notified.");
      setTimeout(() => { onReject(); onBack(); }, 1500);
    } catch (e) {
      showToast(e.response?.data?.error || "Rejection failed", "error");
    } finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );

  const l = detail?.listing || listing;
  const docs = detail?.documents || [];
  const host = l.hostId || {};
  const photos = l.images || [];
  const coverIdx = l.coverImageIndex || 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold flex items-center gap-2 transition-all ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.type === "error" ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {showRejectModal && (
        <RejectModal onConfirm={handleReject} onCancel={() => setShowRejectModal(false)} loading={actionLoading} />
      )}

      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> All listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Preview ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cover photo */}
          {photos.length > 0 && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-gray-100">
              <img src={photos[coverIdx] || photos[0]} alt={l.title} className="w-full h-full object-cover" />
            </div>
          )}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((src, i) => (
                <div key={i} className={`w-16 h-16 rounded-xl shrink-0 overflow-hidden border-2 ${i === coverIdx ? "border-[#E01561]" : "border-transparent"}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Title & meta */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{l.title}</h1>
                <p className="text-sm text-gray-500 mt-1 capitalize">{l._listingType} · {l.city}{l.isRemote ? " (Remote)" : ""}</p>
              </div>
              <StatusBadge status={l.listing_status} />
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-3">
              ₹{(l.pricePerPerson || l.pricePerSession || 0).toLocaleString("en-IN")} / {l._listingType === "experience" ? "person" : "session"}
              {l.duration && <span className="text-gray-400 font-normal"> · {l.duration}</span>}
            </p>
          </div>

          {l.shortDescription && (
            <p className="text-sm text-gray-600 italic border-l-4 border-[#E01561]/30 pl-4">{l.shortDescription}</p>
          )}
          {l.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Full Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{l.description}</p>
            </div>
          )}

          {/* Certifications */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4" /> Certifications & Documents
              <span className="text-xs font-normal text-amber-600">(admin only)</span>
            </h3>
            {docs.length === 0 ? (
              <p className="text-sm text-amber-700">No documents uploaded by host.</p>
            ) : (
              <div className="space-y-2">
                {docs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-amber-100">
                    <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{doc.label || "Document"}</p>
                      <p className="text-xs text-gray-400 truncate">{doc.original_name}</p>
                    </div>
                    {doc.signedUrl ? (
                      <a href={doc.signedUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-[#E01561] hover:underline">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">No URL</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Host + Actions ── */}
        <div className="space-y-5">
          {/* Host card */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Host Profile</h3>
            <div className="flex items-center gap-3 mb-3">
              {host.profilePhoto ? (
                <img src={host.profilePhoto} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-900 text-white flex items-center justify-center font-bold text-lg">
                  {(host.firstName || "?")[0]}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900">{host.firstName} {host.lastName}</p>
                <p className="text-xs text-gray-500">{host.email}</p>
              </div>
            </div>
            {host.createdAt && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <User className="w-3 h-3" /> Member since {new Date(host.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
            )}
          </div>

          {/* Submission meta */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Submission Info</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              Submitted: {l.submitted_at ? new Date(l.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
            </div>
            {l.reviewed_at && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                Reviewed: {new Date(l.reviewed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            )}
            {l.rejection_reason && (
              <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs font-semibold text-red-700 mb-1">Rejection reason:</p>
                <p className="text-xs text-red-600">{l.rejection_reason}</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {l.listing_status === "pending_review" && (
            <div className="space-y-3">
              <button onClick={handleApprove} disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 shadow-sm">
                <CheckCircle2 className="w-5 h-5" /> Approve Listing
              </button>
              <button onClick={() => setShowRejectModal(true)} disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl transition-colors">
                <XCircle className="w-5 h-5" /> Reject with Reason
              </button>
            </div>
          )}
          {l.listing_status === "active" && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> This listing is live
            </div>
          )}
          {l.listing_status === "rejected" && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-semibold">
              <XCircle className="w-5 h-5 text-red-400" /> This listing was rejected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { isLoggedIn, user, getToken } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending_review");
  const [selected, setSelected] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/api/listings/admin?status=${filterStatus}&type=all`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setListings(res.data.listings || []);
    } catch (e) {
      if (e.response?.status === 403) setAccessDenied(true);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    fetchListings();
  }, [isLoggedIn, filterStatus]);

  if (accessDenied) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <ShieldCheck className="w-16 h-16 text-gray-300 mb-4" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-500 mb-6">This page is only available to administrators.</p>
      <button onClick={() => navigate("/")} className="px-6 py-2.5 bg-[#E01561] text-white font-semibold rounded-xl">Go Home</button>
    </div>
  );

  if (selected) return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <ListingDetail
        listing={selected}
        onBack={() => setSelected(null)}
        onApprove={fetchListings}
        onReject={fetchListings}
      />
    </div>
  );

  const STATUS_TABS = [
    { key: "pending_review", label: "Pending Review" },
    { key: "active",         label: "Approved" },
    { key: "rejected",       label: "Rejected" },
    { key: "all",            label: "All" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#E01561]" /> Admin Review
            </h1>
            <p className="text-gray-500 mt-1">Review and approve host listing submissions</p>
          </div>
          <button onClick={() => navigate("/")} className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">← Back to site</button>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6 w-fit">
          {STATUS_TABS.map(t => (
            <button key={t.key} onClick={() => setFilterStatus(t.key)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${filterStatus === t.key ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-24 text-center">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No listings in this category</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Listing","Type","Host","Submitted","Status",""].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {listings.map(l => {
                  const host = l.hostId || {};
                  return (
                    <tr key={l._id} className="hover:bg-gray-50/70 transition-colors cursor-pointer group" onClick={() => setSelected(l)}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {l.images?.[0] && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[200px]">{l.title}</p>
                            <p className="text-xs text-gray-400">{l.city}{l.isRemote ? " · Remote" : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="capitalize px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">{l._listingType}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{host.firstName} {host.lastName}</p>
                        <p className="text-xs text-gray-400">{host.email}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {l.submitted_at ? new Date(l.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={l.listing_status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end">
                          <span className="text-[#E01561] text-xs font-semibold group-hover:underline flex items-center gap-1">
                            Review <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
