import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MessageSquare, Calendar, Send, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["New", "Contacted", "Negotiation", "Won", "Lost"];
const STATUS_COLORS = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-yellow-100 text-yellow-700",
  Negotiation: "bg-orange-100 text-orange-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
};
const COMM_ICONS = { call: Phone, email: Mail, meeting: Building2, note: MessageSquare };
const COMM_COLORS = {
  call: "bg-blue-50 text-blue-600",
  email: "bg-purple-50 text-purple-600",
  meeting: "bg-amber-50 text-amber-600",
  note: "bg-stone-50 text-stone-600",
};

const fmt = (n) => {
  if (!n) return "₹0";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

export default function LeadDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commForm, setCommForm] = useState({ type: "call", message: "" });
  const [sending, setSending] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editFollowUp, setEditFollowUp] = useState("");

  const fetchLead = () => {
    api.get(`/leads/${id}`)
      .then((r) => {
        setLead(r.data);
        setEditStatus(r.data.status);
        setEditFollowUp(r.data.nextFollowUp ? r.data.nextFollowUp.split("T")[0] : "");
      })
      .catch(() => { toast.error("Lead not found"); navigate("/leads"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLead(); }, [id]);

  const updateField = async (field, value) => {
    try {
      const updated = await api.put(`/leads/${id}`, { [field]: value });
      setLead(updated.data);
      toast.success("Updated");
    } catch { toast.error("Update failed"); }
  };

  const addCommunication = async (e) => {
    e.preventDefault();
    if (!commForm.message.trim()) { toast.error("Message required"); return; }
    setSending(true);
    try {
      const res = await api.post(`/leads/${id}/communicate`, commForm);
      setLead(res.data);
      setCommForm({ type: "call", message: "" });
      toast.success("Communication logged");
    } catch { toast.error("Failed to log"); }
    finally { setSending(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex bg-stone-100">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-7 h-7 border-4 border-stone-800 border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-stone-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link to="/leads" className="text-stone-500 hover:text-stone-900 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-stone-900">{lead.companyName}</h1>
            <p className="text-stone-500 text-sm">{lead.industry || "No industry specified"}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={editStatus}
              onChange={(e) => { setEditStatus(e.target.value); updateField("status", e.target.value); }}
              className={`text-sm font-semibold px-3 py-1.5 rounded-full cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-stone-900 ${STATUS_COLORS[editStatus]}`}
            >
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Left: Details */}
          <div className="col-span-1 space-y-4">
            {/* Contact info */}
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <h3 className="font-semibold text-stone-900 mb-3 text-sm">Contact Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-stone-600">
                  <Building2 size={14} className="text-stone-400" />
                  <span>{lead.contactPerson || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Mail size={14} className="text-stone-400" />
                  <span>{lead.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone size={14} className="text-stone-400" />
                  <span>{lead.phone || "—"}</span>
                </div>
              </div>
            </div>

            {/* Deal info */}
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <h3 className="font-semibold text-stone-900 mb-3 text-sm">Deal Info</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Value</span>
                  <span className="font-semibold text-stone-900">{fmt(lead.dealValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Source</span>
                  <span className="text-stone-700 capitalize">{lead.source || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Priority</span>
                  <span className={`font-semibold ${
                    lead.priority === "High" ? "text-red-500" :
                    lead.priority === "Medium" ? "text-amber-500" : "text-stone-400"
                  }`}>{lead.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Product</span>
                  <span className="text-stone-700">{lead.product || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Assigned</span>
                  <span className="text-stone-700">{lead.assignedToName || "—"}</span>
                </div>
              </div>
            </div>

            {/* Follow-up */}
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <h3 className="font-semibold text-stone-900 mb-3 text-sm flex items-center gap-2">
                <Calendar size={14} /> Next Follow-up
              </h3>
              <input
                type="date"
                value={editFollowUp}
                onChange={(e) => setEditFollowUp(e.target.value)}
                onBlur={(e) => e.target.value && updateField("nextFollowUp", e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                <h3 className="font-semibold text-stone-900 mb-1 text-sm">Notes</h3>
                <p className="text-stone-600 text-sm">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Right: Communications */}
          <div className="col-span-2">
            <div className="bg-white rounded-xl border border-stone-200 h-full flex flex-col">
              <div className="px-5 py-4 border-b border-stone-100">
                <h3 className="font-semibold text-stone-900">Communication Log</h3>
                <p className="text-xs text-stone-400 mt-0.5">{lead.communications?.length || 0} entries</p>
              </div>

              {/* Add new communication */}
              <form onSubmit={addCommunication} className="px-5 py-4 border-b border-stone-100">
                <div className="flex gap-2 mb-2">
                  {["call", "email", "meeting", "note"].map((t) => {
                    const Icon = COMM_ICONS[t];
                    return (
                      <button key={t} type="button"
                        onClick={() => setCommForm({ ...commForm, type: t })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                          commForm.type === t ? "bg-stone-900 text-white border-stone-900" : "border-stone-300 text-stone-600 hover:border-stone-500"
                        }`}>
                        <Icon size={12} />
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    value={commForm.message}
                    onChange={(e) => setCommForm({ ...commForm, message: e.target.value })}
                    placeholder={`Log a ${commForm.type}…`}
                    className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                  <button type="submit" disabled={sending}
                    className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 disabled:opacity-60 transition-colors">
                    <Send size={14} />
                  </button>
                </div>
              </form>

              {/* Log entries */}
              <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-stone-50 max-h-96">
                {!lead.communications?.length && (
                  <p className="text-center text-stone-400 text-sm py-10">No communications logged yet.</p>
                )}
                {lead.communications?.map((c) => {
                  const Icon = COMM_ICONS[c.type] || MessageSquare;
                  return (
                    <div key={c._id} className="px-5 py-3 flex gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${COMM_COLORS[c.type]}`}>
                        <Icon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-stone-700 capitalize">{c.type}</span>
                          <span className="text-xs text-stone-400">
                            {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600 mt-0.5">{c.message}</p>
                        <p className="text-xs text-stone-400 mt-0.5">— {c.addedByName}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
