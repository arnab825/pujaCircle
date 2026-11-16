import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Ban,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SuspendUserDialog } from "@/components/admin/UserActionDialogs";
import { DeleteConfirmDialog } from "@/components/admin/PriestActionDialogs";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";

import { adminApi } from "@/api/admin.api";
import { formatDate, formatFullDate, formatTime, formatDisplayPhone } from "@/lib/utils";

/**
 * AdminUserDetailsPage
 * Devotee scholar audit dossier and administrative lifecycle management.
 * Dedicated full page at /admin/users/:id matching /admin/priests/:id.
 * 100% Flexbox, zero CSS grids, zero gradients, pure solid white canvas, Haldi gold trims.
 */
export const AdminUserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [devotee, setDevotee] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Action Dialog states
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadDevotee = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await adminApi.getUserById(id);
      if (data) {
        setDevotee(data);
      } else {
        toast.error("Devotee record not found.");
      }
    } catch {
      toast.error("Failed to load devotee profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDevotee();
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-white text-xs text-stone-500 font-medium gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span>Loading Devotee dossier...</span>
      </div>
    );
  }

  if (!devotee) {
    return (
      <div className="container max-w-3xl py-12 space-y-6 text-stone-900">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#780016] font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Devotees Directory
        </Link>
        <div className="text-center p-10 space-y-4 rounded-xl border-2 border-amber-300 bg-white shadow-sm">
          <div className="w-14 h-14 rounded-md bg-amber-100 flex items-center justify-center mx-auto text-amber-700 border border-amber-300">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-serif text-stone-900">
              Devotee Record Not Found
            </h2>
            <p className="text-xs text-stone-600">
              No devotee profile matches ID "{id}".
            </p>
          </div>
          <Link to="/admin/users">
            <Button
              size="sm"
              className="text-xs mt-2 bg-[#780016] hover:bg-red-800 text-white font-bold rounded-md border border-amber-400 h-10 px-5"
            >
              Return to Devotees Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleConfirmSuspend = async (reason: string) => {
    if (!reason.trim()) return;
    const res = await adminApi.suspendUser(devotee.id, reason.trim());
    if (res.success) {
      toast.success(`Account for ${devotee.name} suspended.`);
      setIsSuspendDialogOpen(false);
      loadDevotee();
    } else {
      toast.error(res.message || "Failed to suspend account.");
    }
  };

  const handleReactivate = async () => {
    const res = await adminApi.unsuspendUser(devotee.id);
    if (res.success) {
      toast.success(`Account for ${devotee.name} reactivated.`);
      loadDevotee();
    } else {
      toast.error(res.message || "Failed to reactivate account.");
    }
  };

  const handleConfirmDelete = async (reason?: string) => {
    try {
      const res = await adminApi.deleteUser(devotee.id, reason);
      if (res.success) {
        toast.success(`Devotee account for ${devotee.name} permanently deleted.`);
        setIsDeleteDialogOpen(false);
        navigate("/admin/users");
      } else {
        toast.error(res.message || "Failed to delete devotee account.");
      }
    } catch {
      toast.error("Failed to delete devotee account.");
    }
  };

  const initials = devotee.name
    ? devotee.name
        .split(" ")
        .filter(Boolean)
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DV";

  const isBanned = devotee.accountStatus === "BANNED";

  const effectiveAvatarUrl =
    devotee.avatarUrl ||
    (typeof window !== "undefined"
      ? localStorage.getItem(`devotee_avatar_${devotee.id}`)
      : null);

  return (
    <div className="container max-w-5xl py-4 sm:py-8 px-2 sm:px-6 space-y-4 sm:space-y-6 pb-16 text-stone-900">
      {/* Top Back Navigation */}
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#780016] font-bold transition-colors"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        <span>Back to Devotee Accounts Directory</span>
      </Link>

      {/* Main Devotee Header Card */}
      <div className="border-2 border-amber-400 bg-white shadow-md rounded-xl sm:rounded-2xl overflow-hidden p-4 sm:p-7 relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 min-w-0 w-full sm:w-auto">
            <div className="relative shrink-0">
              <div className="relative block p-1 rounded-full ring-4 ring-amber-400 bg-amber-100 shadow-sm">
                {effectiveAvatarUrl ? (
                  <img
                    src={effectiveAvatarUrl}
                    alt={devotee.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#780016] text-white border-2 border-white flex items-center justify-center font-bold text-xl sm:text-2xl font-serif shrink-0 shadow-xs">
                    {initials}
                  </div>
                )}
              </div>
              {!isBanned && (
                <div
                  className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-1 border-2 border-white shadow-xs pointer-events-none"
                  title="Active Devotee"
                >
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              )}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-3xl font-extrabold font-serif text-stone-950 wrap-break-word">
                  {devotee.name}
                </h1>
                {!isBanned ? (
                  <Badge className="bg-emerald-600 text-white text-xs px-2.5 py-0.5 gap-1 font-bold shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Devotee
                  </Badge>
                ) : (
                  <Badge className="bg-rose-600 text-white text-xs px-2.5 py-0.5 gap-1 font-bold shrink-0">
                    <Ban className="w-3.5 h-3.5" />
                    Suspended Account
                  </Badge>
                )}
              </div>
              <p className="text-xs text-stone-600 font-medium break-all">
                Devotee ID: <span className="font-mono text-stone-800">{devotee.id}</span>
              </p>
              <p className="text-[11px] text-stone-500 font-mono">
                Member Since:{" "}
                {devotee.createdAt
                  ? formatDate(devotee.createdAt)
                  : "Recent"}
              </p>
            </div>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto flex flex-col sm:flex-col justify-center items-center sm:items-end gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-950 bg-amber-100 px-3 py-1 rounded-md border border-amber-300">
              <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{devotee.bookings?.length || 0} Ceremonies Booked</span>
            </div>
            <span className="text-xs text-stone-700 font-bold">
              {devotee.addresses?.length || 0} Sanctum Venues Registered
            </span>
          </div>
        </div>
      </div>

      {/* Suspension Alert Banner */}
      {isBanned && (
        <div className="p-5 rounded-xl border-2 border-rose-300 bg-rose-50/80 text-rose-950 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-700" />
          <div className="space-y-1 text-xs">
            <p className="font-bold">Account Suspended by Platform Administrator</p>
            <p className="text-stone-700">
              {devotee.banReason || "Administrative restriction active. Account cannot request new ceremonies."}
            </p>
          </div>
        </div>
      )}

      {/* Contact Cards Row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
        <div className="flex-1 p-4 sm:p-5 rounded-xl border-2 border-amber-300 bg-white shadow-xs space-y-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            Registered Mobile
          </span>
          <p className="text-base sm:text-lg font-mono font-bold text-stone-900 mt-1 break-all">
            {formatDisplayPhone(devotee.phoneNumber)}
          </p>
        </div>

        <div className="flex-1 p-4 sm:p-5 rounded-xl border-2 border-amber-300 bg-white shadow-xs space-y-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            Email Address
          </span>
          <p className="text-sm sm:text-lg font-medium text-stone-900 mt-1 break-all">
            {devotee.email || "No email on record"}
          </p>
        </div>
      </div>

      {/* Registered Sanctum Venues Card */}
      <div className="border-2 border-amber-400 bg-white shadow-sm rounded-xl p-3.5 sm:p-7 space-y-4">
        <div className="flex items-start gap-2.5 pb-3 border-b border-amber-200">
          <div className="h-8 w-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-amber-700" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-serif font-bold text-stone-950 leading-snug wrap-break-word">
              Registered Sanctum Venues ({devotee.addresses?.length || 0})
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-relaxed">
              Addresses registered by the devotee for in-home Vedic ceremony conduction.
            </p>
          </div>
        </div>

        {devotee.addresses && devotee.addresses.length > 0 ? (
          <div className="flex flex-col gap-3">
            {devotee.addresses.map((addr: any) => (
              <div
                key={addr.id}
                className="p-4 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50/50 hover:bg-amber-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-stone-950 text-sm">
                      {addr.label || "Home Sanctum"}
                    </span>
                    {addr.isDefault && (
                      <Badge className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                        Default Sanctum
                      </Badge>
                    )}
                  </div>
                  <p className="text-stone-700 leading-relaxed">
                    {[
                      addr.houseNo,
                      addr.street,
                      addr.locality,
                      addr.villageTown,
                      addr.city,
                      addr.district,
                      addr.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}{" "}
                    - <span className="font-mono font-bold text-stone-900">{addr.pincode}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-lg border border-stone-200">
            No delivery venues registered by this devotee yet.
          </div>
        )}
      </div>

      {/* Ceremony Bookings History Card */}
      <div className="border-2 border-amber-400 bg-white shadow-sm rounded-xl p-3.5 sm:p-7 space-y-4">
        <div className="flex items-start gap-2.5 pb-3 border-b border-amber-200">
          <div className="h-8 w-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-4 h-4 text-amber-700" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-serif font-bold text-stone-950 leading-snug wrap-break-word">
              Ceremony Booking History ({devotee.bookings?.length || 0})
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-relaxed">
              Past and upcoming Vedic ceremonies scheduled through PujaCircle.
            </p>
          </div>
        </div>

        {devotee.bookings && devotee.bookings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {devotee.bookings.map((booking: any) => {
              const displayDate = booking.scheduledDate || booking.bookingDate;
              const formattedDate = displayDate
                ? (displayDate.includes('T') ? formatDate(displayDate) : formatFullDate(displayDate))
                : 'Date not set';

              return (
                <div
                  key={booking.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
                      <span className="font-serif font-bold text-stone-950 text-sm wrap-break-word">
                        {booking.serviceName}
                      </span>
                      <BookingStatusBadge status={booking.status} withPulse={false} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-stone-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>{formattedDate}</span>
                        {booking.startTime && (
                          <span className="font-mono text-stone-700">
                            ({formatTime(booking.startTime)} – {formatTime(booking.endTime)})
                          </span>
                        )}
                      </span>
                      <span className="truncate">
                        Purohit: <strong className="text-stone-800">{booking.priestName || "Assigned Scholar"}</strong>
                      </span>
                      {booking.completionCode && (
                        <span className="font-mono text-stone-700 bg-amber-100/70 px-1.5 py-0.2 rounded border border-amber-200 font-bold">
                          Code: {booking.completionCode}
                        </span>
                      )}
                    </div>

                    {booking.specialInstructions && (
                      <div className="text-[11px] bg-amber-50/60 p-2 rounded border border-amber-200/80 text-amber-950 mt-1 wrap-break-word">
                        <span className="font-bold">Sankalp / Gotra Notes: </span>
                        {booking.specialInstructions}
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200/80 shrink-0">
                    <div className="text-base sm:text-sm font-bold text-[#780016] font-serif">
                      ₹{Number(booking.totalPrice || 0).toLocaleString("en-IN")}
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono">
                      Ref: {booking.bookingReference}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-lg border border-stone-200">
            No ceremony appointments recorded for this devotee yet.
          </div>
        )}
      </div>

      {/* Administrative Actions Deck */}
      <div className="border-2 border-amber-400 bg-white shadow-sm rounded-xl p-4 sm:p-7 space-y-3">
        <div>
          <h3 className="text-base font-serif font-bold text-stone-950">
            Administrative Actions & Moderation
          </h3>
          <p className="text-xs text-stone-600">
            Suspend devotee account or remove record permanently.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-amber-200">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {!isBanned ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setIsSuspendDialogOpen(true)}
                className="w-full sm:w-auto text-xs h-10 px-4 rounded-md font-bold gap-1.5 cursor-pointer bg-rose-600 hover:bg-rose-700"
              >
                <Ban className="w-4 h-4" />
                Suspend Devotee Account
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleReactivate}
                className="w-full sm:w-auto text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-5 rounded-md gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Reactivate Account
              </Button>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="w-full sm:w-auto text-xs text-red-700 hover:bg-red-50 gap-1.5 h-10 px-3 rounded-md font-bold cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Devotee Account
          </Button>
        </div>
      </div>

      {/* Suspend Confirmation Dialog */}
      <SuspendUserDialog
        isOpen={isSuspendDialogOpen}
        onClose={() => setIsSuspendDialogOpen(false)}
        onConfirm={handleConfirmSuspend}
        user={devotee}
      />

      {/* Delete Confirmation Alert Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Permanently Delete Devotee Account?"
        description={`Permanently deleting the profile of ${devotee.name} will cancel all upcoming ceremonies and remove devotee credentials.`}
      />
    </div>
  );
};

export default AdminUserDetailsPage;
