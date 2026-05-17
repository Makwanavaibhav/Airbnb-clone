import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { X, ChevronLeft, ChevronRight, Upload, Star, CheckCircle2, AlertCircle } from "lucide-react";

const API = "http://localhost:5001";

const EXPERIENCE_CATEGORIES = ["Adventure","Arts & Crafts","Cooking & Food","Culture","Dance","Fitness","History","Music","Nature","Photography","Sports","Wellness"];
const SERVICE_CATEGORIES = ["Personal Training","Yoga & Meditation","Photography","Music Lessons","Language Tutoring","Cooking Classes","Beauty & Grooming","Home Services","Pet Care","Tech Support","Consulting","Other"];

const STEPS = ["Basics","Details","Media","Certifications","Review & Submit"];

export default function ExperienceServiceWizard({ onClose, initialType = null }) {
  const { getToken, user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    type: initialType || "experience",
    title: "",
    category: "",
    shortDescription: "",
    description: "",
    duration: "2 hours",
    city: "",
    location: "",
    isRemote: false,
    price: "",
    availability: [],
  });

  const [photos, setPhotos] = useState([]);       // File[]
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [coverIdx, setCoverIdx] = useState(0);
  const [certFiles, setCertFiles] = useState([]);  // File[]
  const [certLabels, setCertLabels] = useState([]);

  const photoRef = useRef();
  const certRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Validation per step ───────────────────────────────────────────────────
  const validateStep = () => {
    if (step === 0) {
      if (!form.title.trim()) return "Title is required";
      if (!form.category) return "Category is required";
      if (!form.shortDescription.trim()) return "Short description is required";
    }
    if (step === 1) {
      if (!form.description.trim()) return "Full description is required";
      if (!form.city.trim()) return "City is required";
      if (!form.price || isNaN(form.price) || Number(form.price) <= 0) return "Valid price is required";
    }
    if (step === 2) {
      if (photos.length < 3) return "Please upload at least 3 photos";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep(s => s + 1);
  };
  const back = () => { setError(""); setStep(s => s - 1); };

  // ── Photo handling ────────────────────────────────────────────────────────
  const onPhotos = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = [...photos, ...files].slice(0, 15);
    setPhotos(newPhotos);
    setPhotoPreviews(newPhotos.map(f => URL.createObjectURL(f)));
  };
  const removePhoto = (i) => {
    const p = photos.filter((_, idx) => idx !== i);
    setPhotos(p);
    setPhotoPreviews(p.map(f => URL.createObjectURL(f)));
    if (coverIdx >= p.length) setCoverIdx(0);
  };

  // ── Cert handling ─────────────────────────────────────────────────────────
  const onCerts = (e) => {
    const files = Array.from(e.target.files);
    setCertFiles(cf => [...cf, ...files]);
    setCertLabels(cl => [...cl, ...files.map(() => "")]);
  };
  const removeCert = (i) => {
    setCertFiles(cf => cf.filter((_, idx) => idx !== i));
    setCertLabels(cl => cl.filter((_, idx) => idx !== i));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("shortDescription", form.shortDescription);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("city", form.city);
      fd.append("location", form.location);
      fd.append("isRemote", form.isRemote ? "true" : "false");
      fd.append("coverImageIndex", coverIdx);

      if (form.type === "experience") {
        fd.append("pricePerPerson", form.price);
        fd.append("duration", form.duration);
        fd.append("groupSize", form.groupSize || 10);
      } else {
        fd.append("pricePerSession", form.price);
        fd.append("serviceType", form.category);
      }
      
      if (form.availability) {
        // Convert comma-separated string to JSON array for backend
        const days = form.availability.split(',').map(d => d.trim()).filter(Boolean);
        fd.append("availability", JSON.stringify(days));
      }

      if (form.timeSlots) {
        const times = form.timeSlots.split(',').map(t => t.trim()).filter(Boolean);
        fd.append("timeSlots", JSON.stringify(times));
      }

      photos.forEach(f => fd.append("photos", f));

      const endpoint = form.type === "experience" ? "/api/listings/experience" : "/api/listings/service";
      const res = await axios.post(`${API}${endpoint}`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      const listingId = res.data.listing._id;

      // Upload certs if any
      if (certFiles.length > 0) {
        const cf = new FormData();
        certFiles.forEach(f => cf.append("documents", f));
        cf.append("labels", JSON.stringify(certLabels));
        await axios.post(`${API}/api/listings/${form.type}/${listingId}/documents`, cf, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Listing Submitted!</h2>
          <p className="text-gray-500 mb-8">Your listing is now under review. We'll notify you within 48 hours once it's been approved.</p>
          <button onClick={onClose} className="w-full py-3 bg-[#E01561] hover:bg-[#D70466] text-white font-semibold rounded-xl transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 0 ? "Create a Listing" : STEPS[step]}
          </h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-8 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-1">
            {STEPS.map((s, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-[#E01561]" : "bg-gray-200"}`} />
            ))}
          </div>
          <p className="text-xs text-gray-400 text-right">Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

          {/* ── Step 0: Basics ── */}
          {step === 0 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Listing type</label>
                <div className="grid grid-cols-2 gap-3">
                  {["experience","service"].map(t => (
                    <button key={t} onClick={() => set("type", t)}
                      className={`py-4 rounded-xl border-2 font-semibold capitalize transition-all ${form.type === t ? "border-[#E01561] bg-pink-50 text-[#E01561]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {t === "experience" ? "🌟 Experience" : "🛠️ Service"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input value={form.title} onChange={e => set("title", e.target.value)} maxLength={80}
                  placeholder={form.type === "experience" ? "e.g. Sunset Cooking Class in Goa" : "e.g. Personal Photography Session"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E01561]/30 focus:border-[#E01561]" />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.title.length}/80</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                <select value={form.category} onChange={e => set("category", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E01561]/30 focus:border-[#E01561] bg-white">
                  <option value="">Select a category...</option>
                  {(form.type === "experience" ? EXPERIENCE_CATEGORIES : SERVICE_CATEGORIES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short description <span className="text-red-500">*</span></label>
                <textarea value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)}
                  rows={2} maxLength={150} placeholder="A one-line summary shown on listing cards..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E01561]/30 focus:border-[#E01561] resize-none" />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.shortDescription.length}/150</p>
              </div>
            </>
          )}

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full description <span className="text-red-500">*</span></label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)}
                  rows={5} placeholder="Describe what guests can expect, what's included, and what makes this special..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E01561]/30 focus:border-[#E01561] resize-none" />
              </div>
              {form.type === "experience" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration</label>
                  <select value={form.duration} onChange={e => set("duration", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E01561]/30 focus:border-[#E01561]">
                    {["1 hour","1.5 hours","2 hours","3 hours","4 hours","Half day","Full day"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                  <input value={form.city} onChange={e => set("city", e.target.value)}
                    placeholder="e.g. Goa" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E01561]/30 focus:border-[#E01561]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                  <input type="number" value={form.price} onChange={e => set("price", e.target.value)} min="0"
                    placeholder={form.type === "experience" ? "per person" : "per session"}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E01561]/30 focus:border-[#E01561]" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {form.type === "experience" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max People</label>
                    <input type="number" value={form.groupSize || 10} onChange={e => set("groupSize", e.target.value)} min="1" max="50"
                      placeholder="e.g. 10" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E01561]/30 focus:border-[#E01561]" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Available Days</label>
                  <input value={form.availability || ''} onChange={e => set("availability", e.target.value)}
                    placeholder="e.g. Mon, Tue, Fri" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E01561]/30 focus:border-[#E01561]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time Slots</label>
                  <input value={form.timeSlots || ''} onChange={e => set("timeSlots", e.target.value)}
                    placeholder="e.g. 10:00 AM, 2:00 PM" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E01561]/30 focus:border-[#E01561]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address / Meeting point</label>
                <input value={form.location} onChange={e => set("location", e.target.value)}
                  placeholder="Exact address or area" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E01561]/30 focus:border-[#E01561]" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isRemote} onChange={e => set("isRemote", e.target.checked)}
                  className="w-4 h-4 accent-[#E01561]" />
                <span className="text-sm font-medium text-gray-700">This is available remotely / online</span>
              </label>
            </>
          )}

          {/* ── Step 2: Media ── */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Photos <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(min 3, max 15)</span></label>
                <p className="text-xs text-gray-400 mb-3">Click a photo to set it as the cover image.</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {photoPreviews.map((src, i) => (
                    <div key={i} onClick={() => setCoverIdx(i)}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${coverIdx === i ? "border-[#E01561] shadow-lg" : "border-transparent"}`}>
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {coverIdx === i && (
                        <div className="absolute top-1.5 left-1.5 bg-[#E01561] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-2.5 h-2.5" /> Cover
                        </div>
                      )}
                      <button onClick={e => { e.stopPropagation(); removePhoto(i); }}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center text-xs">×</button>
                    </div>
                  ))}
                  {photos.length < 15 && (
                    <button onClick={() => photoRef.current.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-[#E01561] flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#E01561] transition-colors">
                      <Upload className="w-5 h-5" />
                      <span className="text-xs font-medium">Add</span>
                    </button>
                  )}
                </div>
                <input ref={photoRef} type="file" multiple accept="image/*" className="hidden" onChange={onPhotos} />
                {photos.length === 0 && (
                  <button onClick={() => photoRef.current.click()}
                    className="w-full py-10 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-3 text-gray-400 hover:border-[#E01561] hover:text-[#E01561] transition-colors">
                    <Upload className="w-8 h-8" />
                    <span className="font-semibold">Click to upload photos</span>
                    <span className="text-xs">JPG, PNG — max 10MB each</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── Step 3: Certifications ── */}
          {step === 3 && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Admin-only — not shown publicly</p>
                  <p className="text-xs text-amber-700 mt-0.5">These files are stored securely and only visible to our review team. Upload any licenses, certifications, or proof of expertise.</p>
                </div>
              </div>
              <div>
                <input ref={certRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={onCerts} />
                <button onClick={() => certRef.current.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2 text-gray-400 hover:border-[#E01561] hover:text-[#E01561] transition-colors">
                  <Upload className="w-7 h-7" />
                  <span className="font-semibold text-sm">Upload certifications or licenses</span>
                  <span className="text-xs">PDF, Images, Word documents — max 20MB each</span>
                </button>
              </div>
              {certFiles.length > 0 && (
                <div className="space-y-2">
                  {certFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                        {f.name.split(".").pop().toUpperCase().slice(0, 3)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                        <input value={certLabels[i]} onChange={e => { const l = [...certLabels]; l[i] = e.target.value; setCertLabels(l); }}
                          placeholder="Label (e.g. Yoga Certification)"
                          className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#E01561]/30" />
                      </div>
                      <button onClick={() => removeCert(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 text-center">Certifications are optional but speed up the review process.</p>
            </>
          )}

          {/* ── Step 4: Review & Submit ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-gray-900 text-base">Listing Summary</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <span className="text-gray-500">Type</span><span className="font-medium capitalize">{form.type}</span>
                  <span className="text-gray-500">Title</span><span className="font-medium">{form.title}</span>
                  <span className="text-gray-500">Category</span><span className="font-medium">{form.category}</span>
                  <span className="text-gray-500">City</span><span className="font-medium">{form.city}</span>
                  <span className="text-gray-500">Price</span><span className="font-medium">₹{Number(form.price).toLocaleString("en-IN")} / {form.type === "experience" ? "person" : "session"}</span>
                  {form.type === "experience" && <><span className="text-gray-500">Duration</span><span className="font-medium">{form.duration}</span></>}
                  <span className="text-gray-500">Remote</span><span className="font-medium">{form.isRemote ? "Yes" : "No"}</span>
                  <span className="text-gray-500">Photos</span><span className="font-medium">{photos.length} uploaded</span>
                  <span className="text-gray-500">Documents</span><span className="font-medium">{certFiles.length} uploaded</span>
                </div>
              </div>
              {photoPreviews.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Photos preview</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden ${coverIdx === i ? "ring-2 ring-[#E01561]" : ""}`}>
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        {coverIdx === i && <div className="absolute bottom-0 inset-x-0 bg-[#E01561] text-white text-[9px] text-center font-bold py-0.5">COVER</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">What happens next?</p>
                <p className="text-blue-700 text-xs leading-relaxed">Your listing will be submitted for admin review. Once approved (usually within 48 hours), it will appear live in search results and you'll receive a notification.</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-white">
          <button onClick={step === 0 ? onClose : back}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            {step === 0 ? <><X className="w-4 h-4" /> Cancel</> : <><ChevronLeft className="w-4 h-4" /> Back</>}
          </button>
          {step < 4 ? (
            <button onClick={next}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#E01561] hover:bg-[#D70466] text-white font-semibold rounded-xl transition-colors shadow-sm">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-8 py-2.5 bg-[#E01561] hover:bg-[#D70466] text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Submitting...</>
              ) : "Submit for Review"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
