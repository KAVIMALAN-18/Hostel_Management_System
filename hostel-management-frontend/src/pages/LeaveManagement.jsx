import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { leaveAPI } from "../services/api";
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  BuildingIcon,
  FileTextIcon,
  AlertCircleIcon,
  MoreVerticalIcon,
  ChevronRightIcon,
  XIcon,
} from "../components/common/Icons";

const LeaveManagement = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  const isAdmin = user?.role === "admin";
  const isWarden = user?.role === "warden";

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveAPI.getAll();
      if (res.success) {
        setLeaves(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id, status, reason = "") => {
    if (status === "Rejected" && !reason) {
      setShowRejectionInput(true);
      return;
    }

    setActionLoading(true);
    try {
      const res = await leaveAPI.update(id, status, reason);
      if (res.success) {
        setLeaves((prev) =>
          prev.map((l) =>
            l._id === id ? { ...l, status, rejectionReason: reason } : l,
          ),
        );
        setSelectedLeave(null);
        setShowRejectionInput(false);
        setRejectionReason("");
      }
    } catch (error) {
      alert(`Error: ${error.message || "Operation failed"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "Pending").length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
            Authorization Queue
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mt-2">
            Executive jurisdiction over student travel and residential leaves.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {stats.pending} Pending
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {stats.approved} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Request Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"
            ></div>
          ))
        ) : leaves.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem]">
            <FileTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Clear queue. No unauthorized travel requests.
            </p>
          </div>
        ) : (
          leaves.map((leave) => (
            <div
              key={leave._id}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-8 shadow-soft hover:shadow-premium transition-all duration-500 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 p-6`}>
                <StatusBadge status={leave.status} />
              </div>

              <div className="flex items-start gap-5 mb-8">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                  {leave.studentName.charAt(0)}
                </div>
                <div className="mt-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                    {leave.studentName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 opacity-60">
                    <BuildingIcon className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {leave.hostelName} • {leave.floor}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 px-1">
                    Mission Window
                  </p>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors group-hover:bg-white dark:group-hover:bg-slate-900">
                    <CalendarIcon className="w-4 h-4 text-brand-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight tabular-nums">
                      {new Date(leave.fromDate).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      —{" "}
                      {new Date(leave.toDate).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 px-1">
                    Leave Description
                  </p>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors overflow-hidden">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate" title={leave.reason}>
                      "{leave.reason}"
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    ID Verified
                  </span>
                </div>
                {(isAdmin || isWarden) && (
                  <div className="flex items-center gap-2">
                    {leave.status === "Pending" ? (
                      <>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleUpdateStatus(leave._id, "Rejected", "Denied directly by administration.");
                          }}
                          className="px-5 py-2.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-rose-500/20"
                        >
                          Reject
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(leave._id, "Approved"); }}
                          className="px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
                        >
                          Approve
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(leave._id, "Pending"); }}
                        className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Decision Modal */}
      {selectedLeave && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setSelectedLeave(null)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium modal-panel overflow-hidden border border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider mb-1">
                    Authorization Dossier
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide opacity-80">
                    Reference: {selectedLeave._id.slice(-8)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLeave(null)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-10 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-center text-3xl font-bold text-slate-300">
                  {selectedLeave.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {selectedLeave.studentName}
                  </h3>
                  <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mt-1">
                    {selectedLeave.hostelName} • {selectedLeave.floor}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                    Authorization Reason
                  </p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{selectedLeave.reason}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Departure
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                      {new Date(selectedLeave.fromDate).toDateString()}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Exp. Return
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                      {new Date(selectedLeave.toDate).toDateString()}
                    </p>
                  </div>
                </div>

                {selectedLeave.status === "Rejected" &&
                  selectedLeave.rejectionReason && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/50">
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2 px-1">
                        Rejection Foundation
                      </p>
                      <p className="text-sm font-medium text-rose-900 dark:text-rose-100 italic leading-relaxed">
                        "{selectedLeave.rejectionReason}"
                      </p>
                    </div>
                  )}
              </div>

              {(isAdmin || isWarden) && (
                <div className="flex flex-col gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {selectedLeave.status === "Pending" ? (
                    <>
                      {showRejectionInput ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="bg-rose-50 dark:bg-rose-950/20 p-5 rounded-3xl border border-rose-100 dark:border-rose-900/50">
                            <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3 block px-1">
                              Official Rejection Protocol - Provide Reason
                            </label>
                            <textarea
                              autoFocus
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                              placeholder="State the official grounds for denial..."
                              rows="3"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setShowRejectionInput(false)}
                              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                            >
                              BACK
                            </button>
                            <button
                              disabled={actionLoading || !rejectionReason.trim()}
                              onClick={() =>
                                handleUpdateStatus(
                                  selectedLeave._id,
                                  "Rejected",
                                  rejectionReason,
                                )
                              }
                              className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all disabled:opacity-50"
                            >
                              {actionLoading
                                ? "DENYING..."
                                : "CONFIRM REJECTION"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            disabled={actionLoading}
                            onClick={() => setShowRejectionInput(true)}
                            className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700"
                          >
                            DECLINE REQUEST
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() =>
                              handleUpdateStatus(selectedLeave._id, "Approved")
                            }
                            className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all"
                          >
                            {actionLoading
                              ? "PROCESSING..."
                              : "GRANT AUTHORIZATION"}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      disabled={actionLoading}
                      onClick={() =>
                        handleUpdateStatus(
                          selectedLeave._id,
                          selectedLeave.status === "Approved"
                            ? "Cancelled"
                            : "Approved",
                        )
                      }
                      className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      {selectedLeave.status === "Approved"
                        ? "REVOKE AUTHORIZATION"
                        : "RE-APPROVE MISSION"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// UI Components
const StatusBadge = ({ status }) => {
  const config = {
    Pending:
      "bg-amber-100/50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800",
    Approved:
      "bg-emerald-100/50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800",
    Rejected:
      "bg-rose-100/50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800",
    Cancelled:
      "bg-slate-100/50 text-slate-400 border-slate-200 dark:bg-slate-900/30 dark:border-slate-700",
  };

  return (
    <span
      className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${config[status] || config["Pending"]}`}
    >
      {status}
    </span>
  );
};

export default LeaveManagement;
