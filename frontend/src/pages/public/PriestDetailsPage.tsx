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
} from "@/lib/availabilityUtils";
import { Address } from "@/types/address.types";
import { formatLocalityName, areDistrictsEquivalent } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Modular Subcomponents
import { PriestPublicHeader } from "@/components/booking/PriestPublicHeader";
import { CeremonyOfferingsList } from "@/components/booking/CeremonyOfferingsList";
import { MuhuratSlotPicker } from "@/components/booking/MuhuratSlotPicker";
import { BookingSummaryCard } from "@/components/booking/BookingSummaryCard";
import { BookingConfirmationDialog } from "@/components/booking/BookingConfirmationDialog";

/**
 * ============================================================================
 * [PAGE: PRIEST PUBLIC DETAILS & CEREMONY BOOKING]
 * Devotee booking portal for selected Vedic scholar, ceremony selection,
 * real-time Muhurat slot discovery, and direct cash Dakshina reservation.
 * 100% Flexbox, zero CSS grids, pure solid white canvas, Haldi gold trims.
 * ============================================================================
 */
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
  const [selectedService, setSelectedService] = useState<PriestService | null>(null);
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

  // Load generated slots whenever selectedDate, priest, or ceremony duration changes
  useEffect(() => {
    async function loadSlots() {
      if (!id) return;
      setIsSlotsLoading(true);
      try {
        const ceremonyDuration = selectedService?.durationMinutes || 120;
        const [slots, exceptions] = await Promise.all([
          priestApi.getAvailableSlotsForDate(id, selectedDate, ceremonyDuration),
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

  const isAddressServed = (addr?: Address) => {
    if (!addr) return true;
    const cleanPin = (addr.pincode || (addr as any).pinCode || "").trim().replace(/\D/g, "");
    const priestHomePin = (priest?.pincode || "").trim().replace(/\D/g, "");
    const hasRules = Boolean(
      priestHomePin || (priest?.serviceAreas && priest.serviceAreas.length > 0)
    );
    if (!hasRules) return true;

    if (priestHomePin && cleanPin && priestHomePin === cleanPin) return true;

    const priestAreasStr = JSON.stringify(priest?.serviceAreas || []).toLowerCase();
    if (cleanPin && priestAreasStr.includes(cleanPin)) return true;

    const priestAreas = (priest?.serviceAreas || []).map(formatLocalityName).filter(Boolean);
    const addrTokens = [addr.locality, addr.villageTown, addr.city, addr.district]
      .filter(Boolean)
      .map((t) => t!.toLowerCase().trim());

    const placeMatch = priestAreas.some((area) => {
      const cleanArea = area.toLowerCase().trim();
      return addrTokens.some((token) => token.includes(cleanArea) || cleanArea.includes(token));
    });
    if (placeMatch) return true;

    if (priest?.city && addr.district && areDistrictsEquivalent(addr.district, priest.city)) {
      return true;
    }

    return false;
  };

  const selectedAddress = userAddresses.find((a) => a.id === selectedAddressId);
  const isAddressOutside = Boolean(selectedAddress && !isAddressServed(selectedAddress));

  const selectedAddressSummary = selectedAddress
    ? [selectedAddress.houseNo, selectedAddress.villageTown || selectedAddress.locality]
        .filter(Boolean)
        .join(", ") || selectedAddress.city
    : "Select venue address";

  const selectedAddressDetail = selectedAddress
    ? `${selectedAddress.city}, ${selectedAddress.district || ""} - ${selectedAddress.pincode || (selectedAddress as any).pinCode || ""}`
    : "Click to choose your home ceremony location";

  const handleSubmitBooking = async () => {
    if (!user || !priest || !selectedSlot || !selectedAddressId || !selectedService) {
      toast.error("Please select a ceremony, address, and available time slot.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await bookingApi.createBooking({
        priestId: priest.id,
        priestServiceId: selectedService.id,
        pujaCatalogId: selectedService.pujaCatalogId,
        serviceName: selectedService.serviceName,
        servicePrice: selectedService.price,
        bookingDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        addressId: selectedAddressId,
        specialInstructions: userNotes.trim() || undefined,
      });

      if (res.success && res.data) {
        toast.success("Ceremony booking requested successfully!");
        setIsBookingOpen(false);
        navigate(`/user/bookings/${res.data.id}`);
      } else {
        toast.error(res.message || "Failed to submit booking request.");
      }
    } catch {
      toast.error("An unexpected error occurred while submitting your booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const blackoutForSelectedDate = dayExceptions.find(
    (e) => e.date === selectedDate && e.type !== 'FULL_DAY_LEAVE'
  );

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-white space-y-3">
        <div className="h-10 w-10 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center font-serif font-black text-xl shadow-xs animate-pulse">
          ॐ
        </div>
        <p className="text-xs text-stone-600 font-medium">
          Loading Purohit profile and Muhurat availability...
        </p>
      </div>
    );
  }

  if (!priest) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold font-serif text-stone-900">
          Purohit Profile Not Found
        </h2>
        <p className="text-xs text-stone-600">
          The priest profile you are looking for may have been updated or removed.
        </p>
        <Link to="/priests">
          <button
            type="button"
            className="text-xs bg-[#780016] text-white px-4 py-2 rounded-md font-bold"
          >
            Return to Priests Directory
          </button>
        </Link>
      </div>
    );
  }

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

      {/* 1. Public Priest Header Profile Card */}
      <PriestPublicHeader
        priest={priest}
        onBookClick={() =>
          bookingSectionRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      />

      {/* 2. Main Booking Deck: Left Selection Panel + Right Sticky Summary */}
      <div
        ref={bookingSectionRef}
        className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start w-full"
      >
        {/* Left Column: Ceremony Offerings + Muhurat Slot Picker */}
        <div className="flex-1 w-full bg-white border-2 border-amber-300 rounded-xl sm:rounded-2xl p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-7">
          <CeremonyOfferingsList
            services={priest.services || []}
            selectedService={selectedService}
            onSelectService={(srv) => {
              setSelectedService(srv);
              setSelectedSlot(null);
            }}
          />

          <div className="h-px bg-amber-100" />

          <MuhuratSlotPicker
            selectedDate={selectedDate}
            onSelectDate={(newDate) => {
              setSelectedDate(newDate);
              setSelectedSlot(null);
            }}
            istDate={istDate}
            tomorrowStr={tomorrowStr}
            dayAfterTomorrowStr={dayAfterTomorrowStr}
            isTodayConcluded={isTodayConcluded}
            timeFilter={timeFilter}
            onSetTimeFilter={setTimeFilter}
            availableSlots={availableSlots}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            isSlotsLoading={isSlotsLoading}
            blackoutForSelectedDate={blackoutForSelectedDate}
            onNotice={(msg) => toast.warning(msg)}
          />
        </div>

        {/* Right Column: Sticky Summary & Action Card */}
        <div className="w-full lg:w-88 shrink-0 sticky top-20">
          <BookingSummaryCard
            selectedService={selectedService}
            selectedSlot={selectedSlot}
            selectedDate={selectedDate}
            selectedAddress={selectedAddress}
            isAddressOutside={isAddressOutside}
            selectedAddressSummary={selectedAddressSummary}
            selectedAddressDetail={selectedAddressDetail}
            onOpenAddressPicker={() => setIsBookingOpen(true)}
            onReviewAndBook={handleStartBooking}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      {/* 3. Booking Confirmation Dialog */}
      <BookingConfirmationDialog
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        priest={priest}
        selectedService={selectedService}
        selectedSlot={selectedSlot}
        selectedDate={selectedDate}
        userAddresses={userAddresses}
        selectedAddressId={selectedAddressId}
        onSelectAddressId={setSelectedAddressId}
        userNotes={userNotes}
        onChangeNotes={setUserNotes}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitBooking}
        isAddressServed={isAddressServed}
      />
    </div>
  );
};

export default PriestDetailsPage;
