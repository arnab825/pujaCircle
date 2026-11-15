import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { priestApi } from "@/api/priest.api";
import { adminApi } from "@/api/admin.api";
import { bookingApi } from "@/api/booking.api";
import { Priest } from "@/types/priest.types";
import { Booking } from "@/types/booking.types";
import { formatLocalityName } from "@/lib/utils";

// Modular Subcomponents
import { PriestDossierHeader } from "@/components/admin/priest/PriestDossierHeader";
import { PriestBookingsTable } from "@/components/admin/priest/PriestBookingsTable";
import {
  RejectPriestDialog,
  BanPriestDialog,
  DeleteConfirmDialog,
} from "@/components/admin/PriestActionDialogs";

/**
 * ============================================================================
 * [PAGE: ADMIN PRIEST DETAILS]
 * Scholar dossier audit and administrative lifecycle management.
 * 100% Flexbox, zero CSS grids, pure solid white canvas, Haldi gold trims.
 * ============================================================================
 */
export const AdminPriestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [priest, setPriest] = useState<Priest | null>(null);
  const [priestBookings, setPriestBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal dialog states
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    async function loadPriestDossier() {
      if (!id) return;
      setIsLoading(true);
      try {
        // Optimized: Uses server-side filtered booking query instead of fetching all platform bookings
        const [priestData, bookingsData] = await Promise.all([
          priestApi.getPriestById(id),
          bookingApi.getPriestBookings(id).catch(() => []),
        ]);

        if (priestData) {
          setPriest(priestData);
          setPriestBookings(Array.isArray(bookingsData) ? bookingsData : []);
        }
      } catch {
        toast.error("Failed to load priest profile.");
      } finally {
        setIsLoading(false);
      }
    }
    loadPriestDossier();
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-white text-xs text-stone-500 font-medium gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
        <span>Loading Purohit scholar dossier...</span>
      </div>
    );
  }

  if (!priest) {
    return (
      <div className="container max-w-3xl py-12 space-y-6 text-stone-900">
        <Link
          to="/admin/priests"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-red-700 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Manage Priests
        </Link>
        <div className="text-center p-10 space-y-4 rounded-xl border-2 border-amber-300 bg-white shadow-sm">
          <div className="w-14 h-14 rounded-md bg-amber-100 flex items-center justify-center mx-auto text-amber-700 border border-amber-300">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-serif text-stone-900">
              Priest Record Not Found
            </h2>
            <p className="text-xs text-stone-600">
              No Vedic priest or applicant matches ID "{id}".
            </p>
          </div>
          <Link to="/admin/priests">
            <Button
              size="sm"
              className="text-xs mt-2 bg-[#780016] hover:bg-red-800 text-white font-bold rounded-md border border-amber-400 h-10 px-5"
            >
              Return to Priests Roster
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Lifecycle action handlers
  const handleApprove = async () => {
    const res = await adminApi.approvePriest(priest.id);
    if (res.success) {
      setPriest({
        ...priest,
        approvalStatus: "APPROVED",
        rejectionReason: undefined,
      });
      toast.success(res.message);
    } else {
      toast.error(res.message || "Failed to approve application.");
    }
  };

  const handleConfirmReject = async (reason: string) => {
    const res = await adminApi.rejectPriest(priest.id, reason);
    if (res.success) {
      setPriest({
        ...priest,
        approvalStatus: "REJECTED",
        rejectionReason: reason,
      });
      toast.success(res.message);
      setIsRejectDialogOpen(false);
    } else {
      toast.error(res.message || "Failed to reject application.");
    }
  };

  const handleConfirmBan = async (reason: string) => {
    const res = await adminApi.banPriest(priest.id, reason);
    if (res.success) {
      setPriest({ ...priest, accountStatus: "BANNED", banReason: reason });
      toast.success(res.message);
      setIsBanDialogOpen(false);
    } else {
      toast.error(res.message || "Failed to suspend account.");
    }
  };

  const handleLiftBan = async () => {
    const res = await adminApi.unbanPriest(priest.id);
    if (res.success) {
      setPriest({ ...priest, accountStatus: "ACTIVE", banReason: undefined });
      toast.success(res.message);
    } else {
      toast.error(res.message || "Failed to unban priest.");
    }
  };

  const handleReopen = async () => {
    const res = await adminApi.reopenPriestApplication(priest.id);
    if (res.success) {
      setPriest({
        ...priest,
        approvalStatus: "PENDING",
        rejectionReason: undefined,
      });
      toast.success(res.message);
    } else {
      toast.error(res.message || "Failed to re-open application.");
    }
  };

  const handleConfirmDelete = async (reason?: string) => {
    try {
      const res = await adminApi.deletePriest(priest.id, reason);
      if (res.success) {
        toast.success(`Priest ${priest.fullName} record deleted permanently.`);
        setIsDeleteDialogOpen(false);
        navigate("/admin/priests");
      } else {
        toast.error(res.message || "Failed to delete priest profile.");
      }
    } catch {
      toast.error("Failed to delete priest profile.");
    }
  };

  return (
    <div className="container max-w-5xl py-4 sm:py-8 px-2 sm:px-6 space-y-4 sm:space-y-6 pb-16 text-stone-900">
      {/* Top Back Navigation */}
      <Link
        to="/admin/priests"
        className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#780016] font-bold transition-colors"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        <span>Back to Manage Priests Directory</span>
      </Link>

      {/* 1. Scholar Dossier Header & Lifecycle Control Bar */}
      <PriestDossierHeader
        priest={priest}
        onApprove={handleApprove}
        onOpenReject={() => setIsRejectDialogOpen(true)}
        onOpenBan={() => setIsBanDialogOpen(true)}
        onLiftBan={handleLiftBan}
        onReopen={handleReopen}
        onOpenDelete={() => setIsDeleteDialogOpen(true)}
      />

      {/* 2. Vedic Lineage & Bio */}
      <div className="border-2 border-amber-300 bg-white shadow-sm rounded-xl p-4 sm:p-7 space-y-3">
        <h3 className="text-base font-serif font-bold text-stone-950">
          Vedic Lineage & Spiritual Bio
        </h3>
        <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
          {priest.bio || "No formal bio or lineage background recorded."}
        </p>
      </div>

      {/* 3. Service Areas */}
      <div className="border-2 border-amber-300 bg-white shadow-sm rounded-xl p-4 sm:p-7 space-y-3">
        <h3 className="text-base font-serif font-bold text-stone-950">
          Registered Service Localities ({priest.serviceAreas?.length || 0})
        </h3>
        <div className="flex flex-wrap gap-2">
          {priest.serviceAreas && priest.serviceAreas.length > 0 ? (
            priest.serviceAreas.map((area, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 border border-amber-300 text-stone-800"
              >
                {formatLocalityName(area)}
              </span>
            ))
          ) : (
            <p className="text-xs text-stone-500 italic">No specific localities registered.</p>
          )}
        </div>
      </div>

      {/* 4. Assigned Ceremony Bookings Table */}
      <PriestBookingsTable bookings={priestBookings} />

      {/* Shared Lifecycle Dialogs */}
      <RejectPriestDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={handleConfirmReject}
        priest={priest}
      />

      <BanPriestDialog
        isOpen={isBanDialogOpen}
        onClose={() => setIsBanDialogOpen(false)}
        onConfirm={handleConfirmBan}
        priest={priest}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Permanently Delete Priest Profile?"
        description={`Are you sure you want to permanently remove ${priest.fullName} from the platform roster? All active and pending ceremony bookings will be automatically cancelled with email notifications sent to the priest and devotees.`}
      />
    </div>
  );
};

export default AdminPriestDetailsPage;
