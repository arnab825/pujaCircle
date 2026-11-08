import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { bookingApi } from "@/api/booking.api";
import { Booking } from "@/types/booking.types";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { BookingTimelineCard } from "@/components/booking/BookingTimelineCard";
import { CancelBookingDialog } from "@/components/booking/CancelBookingDialog";
import { RatingModal } from "@/components/booking/RatingModal";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate, formatFullDate } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Phone,
  Star,
  Ban,
  Check,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Copy,
  KeyRound,
  AlertCircle,
  FileText,
  UserCheck,
  Flame,
  BadgeCheck,
} from "lucide-react";
import { CountdownTimer } from "@/components/common/CountdownTimer";
import { toast } from "sonner";

/**
 * BookingDetailsPage
 * Auspicious ceremony appointment pass and live progress hub for devotees.
 * Divine vermilion (#780016), radiant Haldi gold, and pure white canvas.
 */
export const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [manualRating, setManualRating] = useState<number>(0);
  const [manualReview, setManualReview] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const fetchBooking = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await bookingApi.getBookingById(id);
      if (data) {
        setBooking(data);
        if (data.rating) setManualRating(data.rating);
        if (data.review) setManualReview(data.review);
      } else {
        toast.error("Booking not found.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleCancelConfirm = async (reason: string) => {
    if (!booking || !user) return;
    const res = await bookingApi.cancelBooking(booking.id, reason);
    if (res.success) {
      toast.success("Puja appointment cancelled successfully.");
      fetchBooking();
    } else {
      toast.error(res.message || "Failed to cancel booking.");
    }
  };

  const handleRatingSubmit = async (ratingData: any) => {
    if (!booking) return;
    const res = await bookingApi.submitRating(booking.id, {
      rating: ratingData.rating || 5,
      review: ratingData.review,
    });
    if (res.success) {
      toast.success("Thank you for rating and reviewing the ceremony!");
      setIsRatingModalOpen(false);
      fetchBooking();
    } else {
      toast.error(res.message || "Failed to submit review.");
    }
  };

  const handleManualReviewSubmit = async () => {
    if (!booking) return;
    const finalRating = manualRating || booking.rating || 0;
    if (!finalRating) {
      toast.error("Please select a star rating (1 to 5) before submitting.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await bookingApi.submitRating(booking.id, {
        rating: finalRating,
        review: manualReview.trim(),
      });
      if (res.success) {
        toast.success("Thank you for your rating and review!");
        await fetchBooking();
      } else {
        toast.error(res.message || "Failed to submit review.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCopyText = (
    text: string,
    label: string,
    setCopiedFn?: (v: boolean) => void,
  ) => {
    navigator.clipboard.writeText(text);
    if (setCopiedFn) {
      setCopiedFn(true);
      setTimeout(() => setCopiedFn(false), 2000);
    }
    toast.success(`${label} copied to clipboard!`);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-serif font-black text-2xl shadow-md animate-pulse">
            ॐ
          </div>
          <p className="text-sm text-stone-700 font-semibold font-serif">
            Loading sacred ceremony appointment...
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl border-2 border-amber-300 bg-white shadow-lg">
          <div className="h-12 w-12 mx-auto rounded-xl bg-[#780016] text-white flex items-center justify-center font-serif font-bold text-2xl shadow-sm">
            ॐ
          </div>
          <h2 className="text-xl font-bold font-serif text-stone-900">
            Ceremony Record Not Found
          </h2>
          <p className="text-xs text-stone-600">
            The requested ceremony appointment could not be located in your
            account.
          </p>
          <Link to="/user/bookings">
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-[#780016] hover:bg-red-800 text-white font-bold rounded-lg h-10 px-5 border border-amber-400"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to My Bookings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isDevoteeOwner =
    !booking.userId ||
    !user?.id ||
    user.id.toLowerCase() === booking.userId.toLowerCase() ||
    user.role === "USER";
  const canCancel =
    (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
    isDevoteeOwner;
  const canRate = booking.status === "COMPLETED" && isDevoteeOwner;

  const addressString = booking.address
    ? `${booking.address.houseNo ? `${booking.address.houseNo}, ` : ""}${booking.address.villageTown ? `${booking.address.villageTown}, ` : ""}${booking.address.city}, ${booking.address.state} - ${booking.address.pincode}`
    : "Primary Devotee Residence";

  const defaultSamagriItems = [
    "Ganga Jal & Panchamrit (Milk, Curd, Honey, Sugar, Ghee)",
    "Roli, Chandan, Haldi & Akshat (Unbroken Sacred Rice)",
    "Betel Leaves (Paan), Supari, Clove & Cardamom",
    "Fresh Yellow & Red Flowers, Tulsi Patra, Bel Patra",
    "Coconut with Husk (Shriphal) & Red Kalava / Mauli Thread",
    "Dhoop Cones, Camphor (Kapur) & Pure Cow Ghee Diya",
    "Seasonal Fruits (5 varieties) & Sweets / Modak / Kheer Prasad",
    "Havan Kund, Dry Mango Wood & Sacred Havan Samagri Herbs",
  ];

  // Sanitize and clean samagri items
  const rawSamagri =
    booking.samagriList && booking.samagriList.length > 0
      ? booking.samagriList
      : (booking.ritual as any)?.samagriList &&
          (booking.ritual as any).samagriList.length > 0
        ? (booking.ritual as any).samagriList
        : defaultSamagriItems;

  const samagriItems = rawSamagri
    .map((item: string) => item.replace(/^["'\s]+|["',\s]+$/g, "").trim())
    .filter(Boolean);

  // Resilient Priest Resolution
  const priestDisplayName =
    booking.priest?.displayName ||
    booking.priest?.fullName ||
    (booking as any).priestName ||
    (booking as any).priestProfile?.user?.name ||
    "Acharya Rebortak Roy";

  const priestPhone =
    booking.priest?.phoneNumber ||
    (booking as any).priestPhone ||
    (booking as any).priestProfile?.user?.phoneNumber ||
    "";

  const priestAvatar =
    booking.priest?.profileImageUrl ||
    booking.priest?.avatarUrl ||
    (booking as any).priestAvatar ||
    (booking as any).priestProfile?.profileImageUrl ||
    (booking as any).priestProfile?.user?.avatarUrl ||
    "";

  const priestInitial = priestDisplayName.charAt(0).toUpperCase() || "प";

  const ceremonyDateStr =
    booking.bookingDate || (booking as any).scheduledDate || "";
  const formattedFullCeremonyDate = ceremonyDateStr
    ? formatFullDate(ceremonyDateStr)
    : "Auspicious Shubh Muhurat Date";
  const muhuratTimeRange = booking.slot
    ? `${booking.slot.startTime} – ${booking.slot.endTime}`
    : booking.startTime && booking.endTime
      ? `${booking.startTime} – ${booking.endTime}`
      : "08:00 AM – 09:00 AM";

  const bookingRef = booking.bookingReference || booking.id;

  return (
    <div className="w-full text-stone-900 py-3 sm:py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-3.5 sm:space-y-6">
        {/* Top Navigation Bar with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <Link
            to="/user/bookings"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-[#780016] transition-colors group"
          >
            <div className="h-7 w-7 rounded-md bg-stone-100 group-hover:bg-amber-100 text-stone-700 group-hover:text-[#780016] flex items-center justify-center transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span>Back to My Bookings</span>
          </Link>

          <div className="flex items-center gap-2.5">
            {canRate && (
              <Button
                size="sm"
                onClick={() => setIsRatingModalOpen(true)}
                className="w-full sm:w-auto justify-center gap-1.5 text-xs bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold rounded-lg shadow-sm h-9 px-4 cursor-pointer active:scale-95 transition-transform"
              >
                <Star className="w-3.5 h-3.5 fill-stone-950" /> Rate Ceremony
              </Button>
            )}

            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full sm:w-auto justify-center gap-1.5 text-xs text-red-700 hover:text-red-800 border-red-200 hover:bg-red-50 rounded-lg h-9 px-4 cursor-pointer active:scale-95 transition-transform"
              >
                <Ban className="w-3.5 h-3.5" /> Cancel Appointment
              </Button>
            )}
          </div>
        </div>

        {/* Master Sacred Pass Container */}
        <div className="w-full bg-white border border-amber-300 rounded-xl sm:rounded-2xl shadow-md overflow-hidden">
          {/* Grand Regal Header Banner */}
          <div className="relative p-4 sm:p-7 md:p-8 bg-linear-to-r from-[#50000e] via-[#780016] to-[#45000c] text-white border-b-2 border-amber-400">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-start gap-3 sm:gap-5 min-w-0">
                {/* ॐ Sacred Medallion */}
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-linear-to-br from-amber-300 via-amber-400 to-amber-500 text-stone-950 flex items-center justify-center font-serif font-black text-2xl sm:text-4xl shadow-lg border-2 border-amber-200 shrink-0 select-none">
                  ॐ
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Booking Reference Pill */}
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          bookingRef,
                          "Booking reference",
                          setCopiedRef,
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-0.5 bg-black/30 hover:bg-black/50 text-amber-200 rounded-md border border-amber-400/40 transition-colors cursor-pointer"
                      title="Click to copy booking reference"
                    >
                      <span className="truncate max-w-50 sm:max-w-none">
                        Ref: {bookingRef}
                      </span>
                      {copiedRef ? (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 text-amber-300 shrink-0" />
                      )}
                    </button>

                    <span className="text-[11px] text-amber-200/90 font-medium">
                      Requested on {formatDate(booking.createdAt)}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-serif text-white tracking-tight flex items-center gap-2 flex-wrap">
                    <span className="wrap-break-word">
                      {booking.serviceName || "Sacred Puja Ceremony"}
                    </span>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0 inline-block" />
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-amber-100 font-medium pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      {formattedFullCeremonyDate}
                    </span>
                    <span className="text-amber-400">•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      {muhuratTimeRange} (Shubh Muhurat)
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 self-start lg:self-center pt-1 lg:pt-0">
                <BookingStatusBadge
                  status={booking.status}
                  cancelledBy={booking.cancelledBy}
                  isDevoteeView={true}
                />
              </div>
            </div>
          </div>

          {/* Main Content Body */}
          <div className="p-3 sm:p-6 lg:p-7 space-y-3.5 sm:space-y-6 bg-white">
            {/* Sequential 3-Step Ceremony Progress Pipeline */}
            <BookingTimelineCard
              status={booking.status}
              cancelledBy={booking.cancelledBy}
              cancellationReason={booking.cancellationReason}
              rejectionReason={booking.rejectionReason}
            />

            {/* Live 5-Hour SLA Countdown for Pending Requests */}
            {booking.status === "PENDING" && booking.responseDeadline && (
              <CountdownTimer
                targetDate={booking.responseDeadline}
                label="Purohit Acceptance Window"
              />
            )}

            {/* Sacred Handshake Token & Ceremony Verification Code (Confirmed Bookings) */}
            {booking.status === "CONFIRMED" && (
              <div className="p-5 rounded-xl border-2 border-emerald-400/80 bg-linear-to-r from-emerald-50 via-white to-amber-50/40 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <KeyRound className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-950 font-serif">
                        Ceremony Completion Verification Code
                      </h3>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                        Devotee Handshake
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                      Share this sacred 4-digit code with Pandit Ji{" "}
                      <strong>only after</strong> all rituals, aarti, and
                      blessings are concluded, and cash Dakshina is handed over.
                    </p>
                  </div>

                  {/* High-Contrast Code Box */}
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border-2 border-emerald-500 shadow-sm shrink-0 self-start sm:self-center">
                    <span className="font-mono text-3xl font-black tracking-widest text-emerald-950 select-all">
                      {booking.completionCode || "— — — —"}
                    </span>
                    {booking.completionCode && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            booking.completionCode!,
                            "Verification code",
                            setCopiedCode,
                          )
                        }
                        className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                        title="Copy Verification Code"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Core Appointment Overview Deck (Flexbox 2-Column Grid) */}
            <div className="flex flex-col md:flex-row items-stretch gap-3.5 sm:gap-6 w-full">
              {/* Left Column: Auspicious Muhurat & Sanctum Venue */}
              <div className="flex-1 space-y-3 p-3 sm:p-5 rounded-xl border border-amber-300 bg-linear-to-b from-amber-50/30 to-white shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-amber-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#780016] shrink-0" />
                    <span>Auspicious Muhurat & Venue</span>
                  </h3>
                  <span className="text-[10px] font-semibold text-stone-600 bg-white px-2 py-0.5 rounded border border-amber-200 shrink-0">
                    Sanctum Details
                  </span>
                </div>

                <div className="space-y-2.5 sm:space-y-3 text-xs">
                  {/* Date Card */}
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-white border border-amber-200 shadow-2xs">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-amber-100 text-[#780016] flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-stone-500 uppercase font-bold block">
                        Ceremony Date
                      </span>
                      <strong className="text-stone-900 text-xs sm:text-sm font-serif block truncate">
                        {formattedFullCeremonyDate}
                      </strong>
                    </div>
                  </div>

                  {/* Time Window Card */}
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-white border border-amber-200 shadow-2xs">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-stone-500 uppercase font-bold block">
                        Shubh Muhurat Window
                      </span>
                      <strong className="text-stone-900 text-xs sm:text-sm font-serif block truncate">
                        {muhuratTimeRange}
                      </strong>
                    </div>
                  </div>

                  {/* Venue Address Card */}
                  <div className="p-2.5 sm:p-3.5 rounded-lg bg-white border border-amber-200 shadow-2xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
                        <MapPin className="w-4 h-4 text-[#780016] shrink-0" />
                        <span>Ceremony Venue (Sanctum)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(addressString, "Sanctum address")
                        }
                        className="text-[11px] text-[#780016] hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 transition-colors shrink-0"
                      >
                        <Copy className="w-3 h-3" /> Copy Address
                      </button>
                    </div>
                    <p className="text-stone-800 text-xs leading-relaxed font-medium pl-1 wrap-break-word">
                      {addressString}
                    </p>
                  </div>

                  {/* Special Devotee Instructions & Gotra Card */}
                  <div className="p-2.5 sm:p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
                      <FileText className="w-4 h-4 text-[#780016] shrink-0" />
                      <span>Special Instructions & Gotra</span>
                    </div>
                    {booking.specialInstructions ||
                    booking.notes ||
                    booking.userNotes ? (
                      <p className="text-stone-800 text-xs leading-relaxed font-serif italic pl-1 border-l-2 border-amber-400 wrap-break-word">
                        "
                        {booking.specialInstructions ||
                          booking.notes ||
                          booking.userNotes}
                        "
                      </p>
                    ) : (
                      <p className="text-stone-500 text-xs italic pl-1">
                        Standard Vedic Sankalp with family Gotra chanting at
                        ceremony venue.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Appointed Purohit & Cash Dakshina */}
              <div className="flex-1 space-y-3 p-3 sm:p-5 rounded-xl border border-amber-300 bg-linear-to-b from-amber-50/30 to-white shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-amber-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#780016] shrink-0" />
                    <span>Appointed Purohit & Dakshina</span>
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                    Vedic Verified
                  </span>
                </div>

                <div className="space-y-2.5 sm:space-y-3 text-xs">
                  {/* Resilient Priest Profile Card */}
                  <div className="p-3 sm:p-4 rounded-lg bg-white border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-linear-to-br from-[#780016] to-[#50000e] text-amber-300 flex items-center justify-center font-serif font-black text-base sm:text-lg border-2 border-amber-400 shadow-sm shrink-0 overflow-hidden">
                        {priestAvatar ? (
                          <img
                            src={priestAvatar}
                            alt={priestDisplayName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display =
                                "none";
                              const fallback = e.currentTarget
                                .nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-full w-full items-center justify-center ${
                            priestAvatar ? "hidden" : "flex"
                          }`}
                        >
                          {priestInitial}
                        </div>
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-stone-900 text-sm sm:text-base font-serif truncate">
                            {priestDisplayName}
                          </span>
                          <BadgeCheck className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-600">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold truncate">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />{" "}
                            Gurukul Trained Lineage
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 block truncate">
                          Languages: Sanskrit, Bengali, Hindi
                        </span>
                      </div>
                    </div>

                    {booking.status === "CONFIRMED" && priestPhone && (
                      <a
                        href={`tel:${priestPhone}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-transform shrink-0 w-full sm:w-auto"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Pandit Ji
                      </a>
                    )}
                  </div>

                  {/* Cash Dakshina Transparent Pricing Card */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-linear-to-br from-amber-50 to-white border-2 border-amber-300 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-500 block">
                          Shastric Cash Dakshina
                        </span>
                        <span className="text-xs font-semibold text-stone-700">
                          Pay directly after puja
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-2xl sm:text-3xl font-extrabold font-serif text-[#780016]">
                          {formatINR(
                            booking.servicePrice ||
                              booking.totalPrice ||
                              booking.dakshinaAmount ||
                              2500,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Trust Guarantees */}
                    <div className="pt-2 border-t border-amber-200/80 space-y-1.5 text-[11px] text-stone-700">
                      <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Zero online advance deposit required.</span>
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          100% direct cash or UPI to Purohit after ritual
                          completion.
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          Standard guaranteed Dakshina rate without hidden fees.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sacred Samagri Preparation Checklist Section (Rendered Single, Elegant) */}
            <div className="w-full p-3.5 sm:p-6 rounded-xl border border-amber-300 bg-linear-to-b from-amber-50/20 via-white to-amber-50/20 shadow-xs space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200">
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2 font-serif">
                    <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Sacred Samagri Preparation Checklist</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-600">
                    Please keep the following sacred articles prepared in your
                    home sanctum before Pandit Ji arrives:
                  </p>
                </div>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-md border border-amber-300 self-start sm:self-center shrink-0">
                  Devotee Reference
                </span>
              </div>

              {/* Samagri Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1">
                {samagriItems.map((item: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-lg border border-amber-200/90 bg-white hover:border-amber-400 hover:bg-amber-50/30 text-xs text-stone-800 font-medium transition-colors shadow-2xs"
                  >
                    <div className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <span className="leading-snug wrap-break-word">{item}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 text-[11px] text-stone-700 flex items-center gap-2 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="leading-relaxed">
                  Tip: Pandit Ji will bring the sacred Havan Kund and Vedic
                  Samidha herbs. Devotees are requested to keep fruits, flowers,
                  and milk ready.
                </span>
              </div>
            </div>

            {/* Manual Ceremony Review & Rating Section (For Completed Appointments) */}
            {booking.status === "COMPLETED" && isDevoteeOwner && (
              <div className="w-full p-4 sm:p-6 rounded-xl border-2 border-amber-400 bg-amber-50/40 space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2 font-serif">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                    <span>Ceremony Rating & Devotee Review</span>
                  </h3>
                  {booking.rating && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300 self-start sm:self-center">
                      ✓ Review Recorded
                    </span>
                  )}
                </div>

                <div className="space-y-3 p-3.5 sm:p-4 bg-white rounded-lg border border-amber-200 shadow-2xs">
                  {booking.rating && (
                    <div className="p-3 bg-amber-50/60 rounded-md border border-amber-200 space-y-1.5 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= (booking.rating || 0) ? "fill-amber-400 text-amber-400" : "text-stone-300"}`}
                          />
                        ))}
                        <span className="text-xs font-bold text-stone-800 ml-1.5">
                          Current Rating: {booking.rating} / 5 Stars
                        </span>
                      </div>
                      {booking.review && (
                        <p className="text-xs text-stone-700 italic border-l-2 border-amber-400 pl-2.5 py-0.5 font-serif wrap-break-word">
                          "{booking.review}"
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1.5">
                      {booking.rating
                        ? "Update Your Star Rating:"
                        : "Select Star Rating:"}
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setManualRating(star)}
                          className="p-1 rounded hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${manualRating > 0 && star <= manualRating ? "fill-amber-400 text-amber-400" : "text-stone-300"} transition-colors`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-stone-700 sm:ml-2 w-full sm:w-auto mt-1 sm:mt-0">
                        {manualRating === 5 && "Outstanding & Divine (5/5)"}
                        {manualRating === 4 && "Very Good (4/5)"}
                        {manualRating === 3 && "Satisfactory (3/5)"}
                        {manualRating === 2 && "Needs Improvement (2/5)"}
                        {manualRating === 1 && "Disappointing (1/5)"}
                        {manualRating === 0 && "Select 1 to 5 stars"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="devotee-manual-review-box"
                      className="text-xs font-bold text-stone-800 block mb-1.5"
                    >
                      Share Your Sacred Experience:
                    </label>
                    <textarea
                      id="devotee-manual-review-box"
                      rows={3}
                      value={manualReview}
                      onChange={(e) => setManualReview(e.target.value)}
                      placeholder="Share details about punctuality, Vedic pronunciation, samagri guidance, and overall ritual sanctity..."
                      className="w-full text-xs p-3 rounded-lg border border-amber-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 resize-none bg-white text-stone-900"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      disabled={
                        isSubmittingReview || (!manualRating && !booking.rating)
                      }
                      onClick={handleManualReviewSubmit}
                      className="w-full sm:w-auto text-xs font-bold bg-[#780016] hover:bg-red-800 text-white rounded-lg h-9 px-5 shadow-xs cursor-pointer border border-amber-400 disabled:opacity-50"
                    >
                      {isSubmittingReview
                        ? "Submitting Review..."
                        : booking.rating || booking.review
                          ? "Update Review & Rating"
                          : "Submit Review"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Cancellation / Rejection Alerts */}
            {booking.rejectionReason && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-1">
                <strong className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                  Declined by Priest:
                </strong>
                <p className="pl-5 text-stone-700 font-medium">
                  {booking.rejectionReason}
                </p>
              </div>
            )}
            {booking.cancellationReason && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                  booking.cancelledBy === "USER"
                    ? "bg-amber-50/80 border-amber-300 text-amber-950"
                    : "bg-stone-100 border-stone-300 text-stone-800"
                }`}
              >
                <strong className="font-bold flex items-center gap-1.5 text-stone-900">
                  <Ban className="w-4 h-4 text-[#780016] shrink-0" />
                  {booking.cancelledBy === "USER"
                    ? "Cancelled by You (Devotee):"
                    : "Appointment Cancellation Reason:"}
                </strong>
                <p className="pl-5 text-stone-800 font-medium leading-relaxed font-serif">
                  "{booking.cancellationReason}"
                </p>
                {booking.cancelledAt && (
                  <p className="pl-5 text-[11px] text-stone-500">
                    Cancelled on {formatDate(booking.cancelledAt)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CancelBookingDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        bookingReference={bookingRef}
      />

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        bookingId={booking.id}
        priestName={priestDisplayName}
        serviceName={booking.serviceName}
        initialRating={booking.rating || manualRating || 0}
        initialReview={booking.review || manualReview || ""}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
};

export default BookingDetailsPage;
