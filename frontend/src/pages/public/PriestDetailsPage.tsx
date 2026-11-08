import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { priestApi } from "@/api/priest.api";
import { addressApi } from "@/api/address.api";
import { bookingApi } from "@/api/booking.api";
import { Priest, PriestService } from "@/types/priest.types";
import {
  CalculatedSlot,
  PriestException,
  getISTNow,
  getISTTomorrow,
  formatTimeAmPm,
} from "@/lib/availabilityUtils";
import { Address } from "@/types/address.types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  formatCurrency,
  formatTime,
  formatFullDate,
  getInitials,
} from "@/lib/utils";
import {
  MapPin,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowLeft,
  Check,
  AlertCircle,
  Plus,
  Sun,
  Sunrise,
  Moon,
  ShieldCheck,
  Award,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

export const PriestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const bookingSectionRef = useRef<HTMLDivElement>(null);

  const [priest, setPriest] = useState<Priest | null>(null);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Date & Dynamic Slot Picker (Asia/Kolkata IST)
  const { istDate, istMinutes } = getISTNow();
  const tomorrowStr = getISTTomorrow();
  const dayAfterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const dayAfterTomorrowStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(dayAfterTomorrow);

  // Standard day window concludes around 21:00. Purohits require at least 12 hours advance notice
  // to review prior bookings and prepare samagri. After 9:00 AM IST (540 mins), all remaining slots for today
  // fall within the 12-hour notice buffer, so today is locked for new bookings.
  const isTodayConcluded = istMinutes + 12 * 60 >= 21 * 60;
  const initialDate = isTodayConcluded ? tomorrowStr : istDate;
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [availableSlots, setAvailableSlots] = useState<CalculatedSlot[]>([]);
  const [dayExceptions, setDayExceptions] = useState<PriestException[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<
    "ALL" | "MORNING" | "AFTERNOON" | "EVENING"
  >("ALL");

  // Booking Flow State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<PriestService | null>(
    null,
  );
  const [selectedSlot, setSelectedSlot] = useState<CalculatedSlot | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [userNotes, setUserNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadPriestAndAddresses() {
      if (!id) return;
      setIsLoading(true);
      try {
        const priestData = await priestApi.getPriestById(id);
        if (priestData) {
          setPriest(priestData);
          if (priestData.services && priestData.services.length > 0) {
            setSelectedService(priestData.services[0]);
          }
        }

        if (user) {
          const addrs = await addressApi.getAddresses(user.id);
          setUserAddresses(addrs);
          const priestCity = priestData?.city?.trim().toLowerCase();
          const matchingAddrs = priestCity
            ? addrs.filter((a) => a.city?.trim().toLowerCase() === priestCity)
            : addrs;
          const defaultAddr =
            matchingAddrs.find((a) => a.isDefault) || matchingAddrs[0];
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        }
      } catch {
        toast.error("Failed to load priest profile.");
      } finally {
        setIsLoading(false);
      }
    }
    loadPriestAndAddresses();
  }, [id, user]);

  // Load generated slots whenever selectedDate, priest, or selected ceremony duration changes
  useEffect(() => {
    async function loadSlots() {
      if (!id) return;
      setIsSlotsLoading(true);
      try {
        const ceremonyDuration = selectedService?.durationMinutes || 120;
        const [slots, exceptions] = await Promise.all([
          priestApi.getAvailableSlotsForDate(
            id,
            selectedDate,
            ceremonyDuration,
          ),
          priestApi.getPriestExceptions(id),
        ]);
        setAvailableSlots(slots);
        setDayExceptions(exceptions || []);
      } catch {
        toast.error("Failed to load slots for this date.");
      } finally {
        setIsSlotsLoading(false);
      }
    }
    loadSlots();
  }, [id, selectedDate, selectedService?.durationMinutes]);

  const handleStartBooking = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to schedule an appointment with this Priest.");
      navigate("/user/login");
      return;
    }
    setIsBookingOpen(true);
  };

  const handleSubmitBooking = async () => {
    if (
      !user ||
      !priest ||
      !selectedSlot ||
      !selectedAddressId ||
      !selectedService
    ) {
      toast.error(
        "Please select a ceremony, address, and available time slot.",
      );
      return;
    }

    const selectedAddress = userAddresses.find(
      (a) => a.id === selectedAddressId,
    );
    if (selectedAddress) {
      const selectedPin = (
        selectedAddress.pincode ||
        selectedAddress.pinCode ||
        ""
      )
        .trim()
        .replace(/\D/g, "");
      const priestHomePin = (priest?.pincode || "").trim().replace(/\D/g, "");
      const priestAreasStr = (priest?.serviceAreas || []).join(" ");
      const hasLocationRules = Boolean(
        priestHomePin ||
        (priest?.serviceAreas && priest.serviceAreas.length > 0),
      );
      const isServed =
        (priestHomePin && priestHomePin === selectedPin) ||
        (selectedPin && priestAreasStr.includes(selectedPin));

      if (hasLocationRules && !isServed) {
        toast.error(
          `This Purohit does not provide puja ceremonies in PIN code ${selectedAddress.pincode || selectedAddress.pinCode}. Please select a venue address within their service localities.`,
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await bookingApi.createBooking({
        priestId: priest.id,
        priestServiceId: selectedService.id,
        slotId: selectedSlot.id,
        availabilitySlotId: selectedSlot.id,
        addressId: selectedAddressId,
        bookingDate: selectedSlot.slotDate || selectedSlot.date || selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        specialInstructions: userNotes.trim() || undefined,
        notes: userNotes.trim() || undefined,
        userNotes: userNotes.trim() || undefined,
      });

      if (res.success && res.data) {
        toast.success(res.message);
        setIsBookingOpen(false);
        navigate(`/user/bookings/${res.data.id}`);
      } else {
        toast.error(res.message || "Failed to submit booking request.");
      }
    } catch {
      toast.error("Failed to submit booking request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 text-center text-xs text-muted-foreground">
        Loading Priest profile and services...
      </div>
    );
  }

  if (!priest) {
    return (
      <div className="container py-12 text-center space-y-4 max-w-md">
        <h2 className="text-xl font-bold font-serif">
          Priest Profile Not Found
        </h2>
        <p className="text-xs text-muted-foreground">
          The requested priest profile does not exist or is currently pending
          approval.
        </p>
        <Link to="/priests">
          <Button
            size="sm"
            variant="outline"
            className="border-2 border-amber-300 rounded-md hover:bg-amber-50"
          >
            ← Return to Priest Directory
          </Button>
        </Link>
      </div>
    );
  }

  const blackoutForSelectedDate = dayExceptions.find(
    (e) =>
      e.date === selectedDate &&
      (e.type === "PARTIAL_BLACKOUT" || e.exceptionType === "BLOCK") &&
      e.type !== "FULL_DAY_LEAVE",
  );

  // Filter slots by Time of Day
  const filteredSlots = availableSlots.filter((slot) => {
    if (timeFilter === "ALL") return true;
    const hour = parseInt(slot.startTime.split(":")[0], 10);
    if (timeFilter === "MORNING") return hour < 12;
    if (timeFilter === "AFTERNOON") return hour >= 12 && hour < 17;
    if (timeFilter === "EVENING") return hour >= 17;
    return true;
  });

  const morningCount = availableSlots.filter(
    (s) =>
      s.status === "AVAILABLE" && parseInt(s.startTime.split(":")[0], 10) < 12,
  ).length;
  const afternoonCount = availableSlots.filter(
    (s) =>
      s.status === "AVAILABLE" &&
      parseInt(s.startTime.split(":")[0], 10) >= 12 &&
      parseInt(s.startTime.split(":")[0], 10) < 17,
  ).length;
  const eveningCount = availableSlots.filter(
    (s) =>
      s.status === "AVAILABLE" && parseInt(s.startTime.split(":")[0], 10) >= 17,
  ).length;

  const selectedAddress = userAddresses.find((a) => a.id === selectedAddressId);
  const isPincodeServed = (pincodeStr?: string) => {
    if (!pincodeStr) return true;
    const cleanPin = pincodeStr.trim().replace(/\D/g, "");
    const priestHomePin = (priest?.pincode || "").trim().replace(/\D/g, "");
    const priestAreasStr = (priest?.serviceAreas || []).join(" ");
    const hasRules = Boolean(
      priestHomePin || (priest?.serviceAreas && priest.serviceAreas.length > 0),
    );
    if (!hasRules) return true;
    return (
      (priestHomePin && priestHomePin === cleanPin) ||
      priestAreasStr.includes(cleanPin)
    );
  };
  const isAddressOutside = Boolean(
    selectedAddress &&
    !isPincodeServed(selectedAddress.pincode || selectedAddress.pinCode),
  );
  const selectedAddressSummary = selectedAddress
    ? [
        selectedAddress.houseNo || selectedAddress.houseBuilding,
        selectedAddress.villageTown || selectedAddress.locality,
      ]
        .filter(Boolean)
        .join(", ") || selectedAddress.city
    : "Select venue address";
  const selectedAddressDetail = selectedAddress
    ? `${selectedAddress.city}, ${selectedAddress.district || ""} - ${selectedAddress.pincode || selectedAddress.pinCode || ""}`
    : "Click to choose your home ceremony location";

  return (
    <div className="max-w-6xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Back Link */}
      <Link
        to="/priests"
        className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-red-700 font-bold transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 text-red-700" />
        <span>Back to Vedic Purohit Directory</span>
      </Link>

      {/* Priest Header Profile Card */}
      <div className="bg-white border-2 border-amber-300 rounded-xl p-4 sm:p-7 shadow-xs flex flex-col md:flex-row gap-4 sm:gap-6 items-start relative">
        <div className="relative shrink-0 mx-auto md:mx-0">
          {priest.profileImageUrl ? (
            <img
              src={priest.profileImageUrl}
              alt={priest.fullName}
              className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg object-cover ring-2 ring-amber-400 ring-offset-2 shrink-0 bg-amber-50 shadow-xs"
            />
          ) : (
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg bg-[#780016] text-amber-100 flex items-center justify-center font-serif text-2xl sm:text-4xl font-bold ring-2 ring-amber-400 ring-offset-2 shadow-xs select-none">
              {getInitials(priest.displayName || priest.fullName)}
            </div>
          )}
          <div
            className="absolute -bottom-1 -right-1 bg-red-700 text-white rounded-full p-1.5 shadow-sm border-2 border-white"
            title="Gurukul Lineage Verified"
          >
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-3 flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-bold font-serif text-stone-900 wrap-break-words">
                  {priest.displayName || priest.fullName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-red-700 text-white text-[11px] font-semibold shadow-2xs shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Vedic Verified</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mt-2">
                <span className="inline-flex items-center gap-1 font-bold text-stone-900 bg-amber-100 px-2.5 py-0.5 rounded-sm border border-amber-300">
                  <Star
                    className={`h-3.5 w-3.5 ${priest.reviewCount && priest.rating && Number(priest.rating) > 0 ? "fill-amber-500 text-amber-500" : "text-stone-400"}`}
                  />
                  {priest.reviewCount &&
                  priest.rating &&
                  Number(priest.rating) > 0
                    ? `${Number(priest.rating).toFixed(1)} (${priest.reviewCount} ${priest.reviewCount === 1 ? "Review" : "Reviews"})`
                    : "No ratings yet"}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-stone-900 bg-amber-400 px-2.5 py-0.5 rounded-sm">
                  <Award className="h-3 w-3 text-stone-950" />
                  {priest.experienceYears}+ Yrs Shastric Exp
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-white bg-red-950 px-2.5 py-0.5 rounded-sm">
                  <Flame className="h-3 w-3 text-amber-400" />
                  {priest.completedPujas ?? 0}{" "}
                  {(priest.completedPujas ?? 0) === 1
                    ? "Puja Conducted"
                    : "Pujas Conducted"}
                </span>
                <span className="flex items-center gap-1 font-semibold text-stone-700">
                  <MapPin className="h-3.5 w-3.5 text-red-700 shrink-0" />{" "}
                  {priest.city}, {priest.state}
                </span>
              </div>
            </div>

            <Button
              onClick={() =>
                bookingSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="gap-2 text-xs font-bold bg-[#780016] hover:bg-red-800 text-white rounded-md shadow-xs h-10 px-5 cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <Calendar className="h-4 w-4" />
              <span>Book Ceremony</span>
            </Button>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            {priest.bio ||
              "Experienced Purohit offering authentic Vedic Vidhi rituals and sacred mantra chanting across Kolkata."}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs pt-2 border-t border-amber-100">
            <div>
              <span className="text-stone-500 font-medium">Languages: </span>
              <strong className="text-stone-900">
                {priest.languages?.join(", ") || "Bengali, Sanskrit, Hindi"}
              </strong>
            </div>
            <span>•</span>
            <div>
              <span className="text-stone-500 font-medium">
                Serving Localities:{" "}
              </span>
              <strong className="text-stone-900">
                {priest.serviceAreas?.join(", ") || priest.city}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Booking Section: Left Cohesive Sanctum + Right Sticky Summary */}
      <div
        ref={bookingSectionRef}
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start w-full"
      >
        {/* Left Column (8 cols): Single Unified Flow Panel */}
        <div className="lg:col-span-8 bg-white border-2 border-amber-300 rounded-xl sm:rounded-2xl p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-7">
          {/* STEP 1: Choose Ritual Ceremony */}
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#780016] text-white font-bold text-xs shrink-0">
                  1
                </span>
                <h2 className="text-sm sm:text-base font-bold font-serif text-stone-900">
                  Select Sacred Ceremony & Dakshina Rate
                </h2>
              </div>
              <span className="text-[10px] sm:text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shrink-0">
                Direct Cash After Puja
              </span>
            </div>

            {!priest.services || priest.services.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 border border-dashed border-amber-300 bg-amber-50/40 rounded-lg">
                This priest has not configured specific ritual packages yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {priest.services.map((srv) => {
                  const isSelected = selectedService?.id === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 text-left ${
                        isSelected
                          ? "border-[#780016] ring-2 ring-red-700/20 bg-amber-50/40 shadow-xs"
                          : "border-amber-200 hover:border-amber-400 bg-white"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-stone-900 font-serif leading-snug">
                            {srv.serviceName}
                          </h3>
                          {isSelected && (
                            <span className="h-5 w-5 rounded-full bg-[#780016] text-white flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3 stroke-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-600 line-clamp-2">
                          Traditional Shastric Vidhi with complete samagri
                          guidance and auspicious mantras.
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-amber-100 text-xs">
                        <span className="text-stone-500 font-medium">
                          Dakshina:
                        </span>
                        <strong className="text-base font-serif font-bold text-[#780016]">
                          {formatCurrency(srv.price)}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-px bg-amber-100" />

          {/* STEP 2: Choose Auspicious Date */}
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#780016] text-white font-bold text-xs shrink-0">
                  2
                </span>
                <h2 className="text-sm sm:text-base font-bold font-serif text-stone-900">
                  Select Auspicious Ceremony Date
                </h2>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-sm shrink-0">
                Verified Calendar
              </span>
            </div>

            {/* Quick Date Pills & Date Input */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!isTodayConcluded) {
                    setSelectedDate(istDate);
                    setSelectedSlot(null);
                  } else {
                    toast.warning(
                      "Purohits require 12 hours advance booking notice. Today's slots are within this window; please book for tomorrow.",
                    );
                  }
                }}
                disabled={isTodayConcluded}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  selectedDate === istDate
                    ? "bg-[#780016] text-white border-[#780016] shadow-2xs"
                    : isTodayConcluded
                      ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-60"
                      : "bg-white text-stone-800 border-amber-300 hover:bg-amber-50"
                }`}
              >
                <span>Today</span>
                {isTodayConcluded && (
                  <span className="text-[10px] text-amber-700 font-semibold">
                    (12h Notice)
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDate(tomorrowStr);
                  setSelectedSlot(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  selectedDate === tomorrowStr
                    ? "bg-[#780016] text-white border-[#780016] shadow-2xs"
                    : "bg-white text-stone-800 border-amber-300 hover:bg-amber-50"
                }`}
              >
                <span>Tomorrow ({tomorrowStr.slice(5)})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDate(dayAfterTomorrowStr);
                  setSelectedSlot(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  selectedDate === dayAfterTomorrowStr
                    ? "bg-[#780016] text-white border-[#780016] shadow-2xs"
                    : "bg-white text-stone-800 border-amber-300 hover:bg-amber-50"
                }`}
              >
                <span>In 2 Days ({dayAfterTomorrowStr.slice(5)})</span>
              </button>

              <div className="flex items-center gap-1.5 w-full sm:w-auto sm:ml-auto pt-1 sm:pt-0">
                <Calendar className="h-4 w-4 text-[#780016] shrink-0" />
                <Input
                  type="date"
                  value={selectedDate}
                  min={istDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setSelectedDate(newDate);
                    setSelectedSlot(null);
                  }}
                  className="text-xs h-9 flex-1 sm:w-38 rounded-lg border-amber-300 focus-visible:ring-red-700 font-mono"
                />
              </div>
            </div>

            {/* Today 12-Hour Notice Warning */}
            {selectedDate === istDate && isTodayConcluded && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-[#780016] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#780016]">
                    12-Hour Advance Notice Required:
                  </strong>
                  <p className="text-[11px] text-stone-700 mt-0.5">
                    Purohits require at least 12 hours advance booking notice to
                    review prior commitments, verify schedule availability, and
                    prepare sacred Vedic samagri. Same-day bookings for today
                    are within this preparation window. Please pick tomorrow (
                    {formatFullDate(tomorrowStr)}) or an upcoming auspicious
                    date.
                  </p>
                </div>
              </div>
            )}

            {/* Priest Blocked Break Alert */}
            {blackoutForSelectedDate && (
              <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-300 text-xs text-amber-950 flex items-start gap-2 shadow-2xs">
                <Clock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#780016]">
                    Purohit Blocked / Break Window:
                  </strong>
                  <p className="text-[11px] text-stone-700 mt-0.5">
                    {formatTimeAmPm(blackoutForSelectedDate.startTime || "")} –{" "}
                    {formatTimeAmPm(blackoutForSelectedDate.endTime || "")} (
                    {blackoutForSelectedDate.reason || "Blocked Break"}). All
                    other open slots shown below are fully bookable.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-amber-100" />

          {/* STEP 3: Choose Shubh Muhurat Slot */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 pb-2 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#780016] text-white font-bold text-xs shrink-0">
                  3
                </span>
                <h2 className="text-sm sm:text-base font-bold font-serif text-stone-900">
                  Choose Auspicious Muhurat Slot
                </h2>
              </div>
              <span className="text-xs text-stone-500 font-medium pl-8 sm:pl-0">
                {formatFullDate(selectedDate)}
              </span>
            </div>

            {/* 12-Hour Advance Notice Policy Reminder */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900">
              <Clock className="w-3.5 h-3.5 text-[#780016] shrink-0" />
              <span>
                <strong>12-Hour Advance Notice Policy:</strong> Purohits require
                at least 12 hours notice to review existing commitments, verify
                schedule availability, and prepare authentic puja samagri.
              </span>
            </div>

            {/* Time of Day Tabs */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTimeFilter("ALL")}
                className={`px-3 py-1.5 rounded-md font-bold transition-all border cursor-pointer ${
                  timeFilter === "ALL"
                    ? "bg-[#780016] text-white border-[#780016]"
                    : "bg-white text-stone-700 border-amber-200 hover:bg-amber-50"
                }`}
              >
                All Slots ({availableSlots.length})
              </button>

              <button
                type="button"
                onClick={() => setTimeFilter("MORNING")}
                className={`px-3 py-1.5 rounded-md font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                  timeFilter === "MORNING"
                    ? "bg-[#780016] text-white border-[#780016]"
                    : "bg-white text-stone-700 border-amber-200 hover:bg-amber-50"
                }`}
              >
                <Sunrise className="w-3.5 h-3.5 text-amber-600" />
                <span>Morning ({morningCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setTimeFilter("AFTERNOON")}
                className={`px-3 py-1.5 rounded-md font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                  timeFilter === "AFTERNOON"
                    ? "bg-[#780016] text-white border-[#780016]"
                    : "bg-white text-stone-700 border-amber-200 hover:bg-amber-50"
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Afternoon ({afternoonCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setTimeFilter("EVENING")}
                className={`px-3 py-1.5 rounded-md font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                  timeFilter === "EVENING"
                    ? "bg-[#780016] text-white border-[#780016]"
                    : "bg-white text-stone-700 border-amber-200 hover:bg-amber-50"
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Evening ({eveningCount})</span>
              </button>
            </div>

            {/* Slots Grid */}
            {isSlotsLoading ? (
              <div className="text-center py-10 text-xs text-stone-500 font-medium">
                Calculating auspicious Muhurat slots...
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="p-8 text-center space-y-2 border border-dashed border-amber-300 rounded-lg bg-amber-50/30">
                <Clock className="w-8 h-8 text-amber-600/50 mx-auto" />
                <p className="text-xs font-bold text-stone-800">
                  No slots available for this filter.
                </p>
                <p className="text-[11px] text-stone-500">
                  Try switching to 'All Slots' or pick another auspicious date.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                {filteredSlots.map((slot) => {
                  if (slot.isBlocked) {
                    return (
                      <div
                        key={slot.id}
                        className="p-2.5 sm:p-3 rounded-lg border border-stone-200 bg-stone-50/70 text-stone-400 cursor-not-allowed select-none flex flex-col items-center justify-center text-center gap-1 opacity-70"
                      >
                        <span className="font-mono text-xs font-semibold line-through">
                          {formatTime(slot.startTime)} –{" "}
                          {formatTime(slot.endTime)}
                        </span>
                        <span className="text-[9px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded">
                          {slot.blockedReason || "Unavailable"}
                        </span>
                      </div>
                    );
                  }

                  if (slot.status !== "AVAILABLE") return null;

                  const isSlotSelected = selectedSlot?.id === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                        isSlotSelected
                          ? "border-[#780016] bg-amber-50/70 text-[#780016] font-bold shadow-xs ring-2 ring-red-700/20"
                          : "border-amber-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 text-stone-900"
                      }`}
                    >
                      <div className="flex items-center gap-1 font-mono text-xs font-bold">
                        <Clock className="w-3 h-3 text-[#780016] shrink-0" />
                        <span>
                          {formatTime(slot.startTime)} –{" "}
                          {formatTime(slot.endTime)}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-medium">
                        Shubh Muhurat
                      </span>
                      {isSlotSelected && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#780016]">
                          <Check className="w-3 h-3 stroke-3" /> Selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Sticky Sacred Booking Summary Card */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          <div className="bg-white border-2 border-amber-400 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <h3 className="font-serif font-black text-base text-stone-950 flex items-center gap-1.5">
                <span className="text-[#780016] text-lg">ॐ</span>
                <span>Sacred Booking Summary</span>
              </h3>
              <span className="text-[10px] text-amber-900 bg-amber-100 border border-amber-300 font-bold px-2 py-0.5 rounded">
                Direct Cash
              </span>
            </div>

            {/* Selected Ceremony Detail */}
            <div className="space-y-1 text-xs">
              <span className="text-stone-500 font-medium">Chosen Ritual:</span>
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <strong className="font-serif text-stone-900 text-xs sm:text-sm">
                  {selectedService?.serviceName || "Select a ceremony"}
                </strong>
                <span className="font-bold font-serif text-[#780016]">
                  {selectedService
                    ? formatCurrency(selectedService.price)
                    : "—"}
                </span>
              </div>
            </div>

            {/* Selected Muhurat Detail */}
            <div className="space-y-1 text-xs">
              <span className="text-stone-500 font-medium">
                Scheduled Muhurat:
              </span>
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 space-y-0.5">
                <div className="font-bold text-stone-900">
                  {formatFullDate(selectedDate)}
                </div>
                <div className="text-[11px] font-mono text-[#780016] font-bold">
                  {selectedSlot
                    ? `${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}`
                    : "Please pick a time slot"}
                </div>
              </div>
            </div>

            {/* Venue Address Selector (Clean Card with Modal Trigger - No Raw HTML Select) */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">
                  Sanctum Venue (Address):
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddressPickerOpen(true)}
                  className="text-[11px] text-[#780016] hover:underline font-bold cursor-pointer"
                >
                  {selectedAddress ? "Change" : "+ Select"}
                </button>
              </div>

              <div
                onClick={() => setIsAddressPickerOpen(true)}
                className="p-3 rounded-xl border-2 border-amber-200 hover:border-amber-400 bg-amber-50/40 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-[#780016] shrink-0" />
                    <span className="truncate">{selectedAddressSummary}</span>
                  </span>
                  {isAddressOutside && (
                    <span className="text-[9px] text-red-700 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded font-bold shrink-0">
                      Outside Service PIN
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 truncate pl-5">
                  {selectedAddressDetail}
                </p>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1 text-xs">
              <span className="text-stone-500 font-medium">
                Special Instructions (Optional):
              </span>
              <Input
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Gotra, landmark, or specific requests"
                className="h-8.5 text-xs border-amber-300 focus-visible:ring-red-700 font-sans"
              />
            </div>

            {/* Booking CTA Button */}
            <Button
              disabled={
                isSubmitting ||
                !selectedService ||
                !selectedSlot ||
                !selectedAddressId ||
                isAddressOutside
              }
              onClick={() => handleStartBooking()}
              className={`w-full h-11 text-xs font-bold gap-2 rounded-lg shadow-sm cursor-pointer ${
                !selectedService ||
                !selectedSlot ||
                !selectedAddressId ||
                isAddressOutside
                  ? "bg-stone-300 text-stone-600 cursor-not-allowed"
                  : "bg-[#780016] hover:bg-red-800 text-white"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>
                {!selectedService
                  ? "1. Select Ceremony"
                  : !selectedSlot
                    ? "2. Pick a Muhurat Slot"
                    : !selectedAddressId
                      ? "3. Choose Venue Address"
                      : isAddressOutside
                        ? "Venue Outside Purohit Service PIN"
                        : "Confirm Ceremony Request →"}
              </span>
            </Button>

            <p className="text-[10px] text-center text-stone-500 leading-tight">
              100% Direct Cash Dakshina after puja. No advance payment taken.
            </p>
          </div>
        </div>
      </div>

      {/* Clean Address Selector Modal (Replaces clunky HTML dropdown) */}
      <Dialog open={isAddressPickerOpen} onOpenChange={setIsAddressPickerOpen}>
        <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-w-lg p-4 sm:p-5 bg-white border-2 border-amber-300 rounded-xl shadow-2xl">
          <DialogHeader className="pr-8 sm:pr-10 space-y-1 text-left">
            <DialogTitle className="font-serif text-lg font-bold text-stone-900">
              Choose Sanctum Venue Address
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-600">
              Select the residence address where the Purohit will conduct the
              puja.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 py-3 max-h-[55vh] overflow-y-auto">
            {userAddresses.length === 0 ? (
              <div className="p-4 rounded-lg border border-amber-300 bg-amber-50 text-center text-xs space-y-2">
                <p className="text-stone-700">No saved addresses found.</p>
                <Link to="/user/addresses">
                  <Button size="sm" className="bg-[#780016] text-white">
                    + Add Address
                  </Button>
                </Link>
              </div>
            ) : (
              userAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                const isOutside = !isPincodeServed(
                  addr.pincode || addr.pinCode,
                );
                const line1 =
                  [
                    addr.houseNo || addr.houseBuilding,
                    addr.villageTown || addr.locality,
                  ]
                    .filter(Boolean)
                    .join(", ") || addr.city;
                const line2 = `${addr.city}, ${addr.state} - ${addr.pincode || addr.pinCode}`;

                return (
                  <div
                    key={addr.id}
                    onClick={() => {
                      setSelectedAddressId(addr.id);
                      setIsAddressPickerOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-[#780016] bg-amber-50/60 shadow-xs"
                        : "border-stone-200 hover:border-amber-400 bg-white"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                        <MapPin className="h-3.5 w-3.5 text-[#780016] shrink-0" />
                        <span className="truncate">{line1}</span>
                        {isOutside && (
                          <span className="text-[10px] text-red-700 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded font-bold shrink-0">
                            Outside Service PIN
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">
                        {line2}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-[#780016] text-white flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-3" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter className="flex items-center justify-between border-t border-amber-100 pt-3">
            <Link
              to="/user/addresses"
              className="text-xs font-bold text-[#780016] hover:underline flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Manage / Add Address
            </Link>
            <Button
              size="sm"
              onClick={() => setIsAddressPickerOpen(false)}
              className="bg-[#780016] text-white text-xs font-bold px-4"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Review & Final Submission Modal */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          className="sm:max-w-md w-[calc(100%-2rem)] max-w-lg max-h-[88vh] flex flex-col p-4 sm:p-5 bg-white border-2 border-amber-300 rounded-xl shadow-2xl gap-3.5"
        >
          <DialogHeader className="shrink-0 pr-8 sm:pr-10 space-y-1 text-left">
            <DialogTitle className="font-serif text-lg sm:text-xl font-bold text-stone-900">
              Confirm Ceremony Request
            </DialogTitle>
            <DialogDescription className="text-[11px] text-stone-600 leading-snug">
              Price is locked at request submission. Dakshina is payable
              directly in cash after ritual completion.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto pr-3 space-y-4 text-xs custom-scrollbar">
            {/* Price & Service Summary Box */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Appointed Purohit:</span>
                <strong className="text-stone-900 font-serif text-xs sm:text-sm">
                  {priest.displayName || priest.fullName}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Ritual / Ceremony:</span>
                <strong className="text-stone-900 font-serif text-xs sm:text-sm">
                  {selectedService?.serviceName || "Selected Ceremony"}
                </strong>
              </div>
              <div className="flex items-center justify-between border-t border-amber-200 pt-1.5">
                <span className="text-stone-600">Service Dakshina:</span>
                <strong className="font-serif text-sm sm:text-base font-bold text-red-800">
                  {formatCurrency(selectedService?.price || 2100)} (Direct Cash)
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Scheduled Muhurat:</span>
                <span className="text-stone-900 font-bold text-[11px] sm:text-xs text-right">
                  {selectedSlot
                    ? `${formatFullDate(selectedSlot.date)} (${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)})`
                    : `${formatFullDate(selectedDate)} (Please pick a slot)`}
                </span>
              </div>
            </div>

            {/* Address Selection in Modal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-stone-900">
                  Puja Sanctum Venue (Home Address)
                </Label>
                <Link
                  to="/user/addresses"
                  className="text-xs text-red-700 hover:underline font-bold flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Address
                </Link>
              </div>

              {userAddresses.length === 0 ? (
                <div className="p-3 rounded-md border border-amber-300 bg-amber-50 text-stone-800 space-y-2">
                  <p className="text-xs">
                    You have no saved addresses. An address with PIN code is
                    required for the priest to arrive.
                  </p>
                  <Link to="/user/addresses">
                    <Button
                      size="sm"
                      className="text-xs h-7.5 bg-red-700 hover:bg-red-800 text-white rounded-md"
                    >
                      + Add Address
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {userAddresses.map((addr) => {
                    const line1 =
                      [
                        addr.houseNo || addr.houseBuilding,
                        addr.villageTown || addr.locality,
                      ]
                        .filter(Boolean)
                        .join(", ") || addr.city;
                    const line2 = `${addr.city}, ${addr.state} - ${addr.pincode || addr.pinCode}`;
                    const isOutside = !isPincodeServed(
                      addr.pincode || addr.pinCode,
                    );

                    return (
                      <div
                        key={addr.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                          selectedAddressId === addr.id
                            ? "border-red-700 bg-amber-50/50"
                            : "border-stone-200 hover:border-amber-300"
                        }`}
                        onClick={() => setSelectedAddressId(addr.id)}
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                            <span>{line1}</span>
                            {isOutside && (
                              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200 font-bold">
                                Outside Service PIN
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500">{line2}</p>
                        </div>
                        {selectedAddressId === addr.id && (
                          <Check className="h-4 w-4 text-red-700 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Special Instructions Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-900">
                Special Notes or Requests (Optional)
              </Label>
              <Textarea
                placeholder="Gotra details, specific mantras, apartment floor/landmark, etc."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="text-xs min-h-15 border-amber-300 focus-visible:ring-red-700"
              />
            </div>
          </div>

          <DialogFooter className="shrink-0 flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBookingOpen(false)}
              className="text-xs border-amber-300 hover:bg-amber-50 rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting || !selectedAddressId || !selectedSlot}
              onClick={handleSubmitBooking}
              className="text-xs bg-[#780016] hover:bg-red-800 text-white rounded-md gap-1.5 font-bold shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                "Submitting Request..."
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Confirm Ceremony Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriestDetailsPage;
