import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { priestApi } from '@/api/priest.api';
import { addressApi } from '@/api/address.api';
import { bookingApi } from '@/api/booking.api';
import { Priest, PriestSlot, PriestService } from '@/types/priest.types';
import { Address } from '@/types/address.types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatCurrency, formatTime, formatFullDate } from '@/lib/utils';
import {
  Sparkles,
  MapPin,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowLeft,
  Check,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

export const PriestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [priest, setPriest] = useState<Priest | null>(null);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Date & Dynamic Slot Picker
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [availableSlots, setAvailableSlots] = useState<PriestSlot[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  // Booking Flow State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<PriestService | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<PriestSlot | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [userNotes, setUserNotes] = useState('');
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
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        }
      } catch {
        toast.error('Failed to load priest profile.');
      } finally {
        setIsLoading(false);
      }
    }
    loadPriestAndAddresses();
  }, [id, user]);

  // Load generated slots whenever selectedDate or priest changes
  useEffect(() => {
    async function loadSlots() {
      if (!id) return;
      setIsSlotsLoading(true);
      try {
        const slots = await priestApi.getAvailableSlotsForDate(id, selectedDate);
        setAvailableSlots(slots);
      } catch {
        toast.error('Failed to load slots for this date.');
      } finally {
        setIsSlotsLoading(false);
      }
    }
    loadSlots();
  }, [id, selectedDate]);

  const handleStartBooking = (service?: PriestService, slot?: PriestSlot) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to schedule an appointment with this Priest.');
      navigate('/user/login');
      return;
    }
    if (service) setSelectedService(service);
    if (slot) setSelectedSlot(slot);
    setIsBookingOpen(true);
  };

  const handleSubmitBooking = async () => {
    if (!user || !priest || !selectedSlot || !selectedAddressId || !selectedService) {
      toast.error('Please select a service, address, and available time slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await bookingApi.createBooking(
        {
          priestId: priest.id,
          priestServiceId: selectedService.id,
          slotId: selectedSlot.id,
          availabilitySlotId: selectedSlot.id,
          addressId: selectedAddressId,
          bookingDate: selectedSlot.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          userNotes,
        },
        user.id
      );

      if (res.success && res.data) {
        toast.success(res.message);
        setIsBookingOpen(false);
        navigate(`/user/bookings/${res.data.id}`);
      } else {
        toast.error(res.message || 'Failed to submit booking request.');
      }
    } catch {
      toast.error('Failed to submit booking request.');
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
        <h2 className="text-xl font-bold font-serif">Priest Profile Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested priest profile does not exist or is currently pending approval.
        </p>
        <Link to="/user/priests">
          <Button size="sm" variant="outline">← Return to Priest Directory</Button>
        </Link>
      </div>
    );
  }

  const activeBookableSlots = availableSlots.filter((s) => s.status === 'AVAILABLE');

  return (
    <div className="container py-8 space-y-8 max-w-5xl">
      {/* Back Link */}
      <Link
        to="/user/priests"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Priests Directory
      </Link>

      {/* Priest Header Profile Card */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start">
          <img
            src={priest.profileImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
            alt={priest.fullName}
            className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl object-cover border border-border shrink-0 bg-muted"
          />

          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold font-serif text-foreground">
                    {priest.displayName || priest.fullName}
                  </h1>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 text-[11px]"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Verified Purohit
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {priest.rating ? priest.rating.toFixed(1) : '5.0'} ({priest.reviewCount || 10} Reviews)
                  </span>
                  <span>•</span>
                  <span>{priest.experienceYears} Years Experience</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" /> {priest.city}, {priest.state}
                  </span>
                </div>
              </div>

              <Button onClick={() => handleStartBooking()} className="gap-2 text-xs h-9">
                <Calendar className="h-4 w-4" /> Request Booking
              </Button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{priest.bio}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-border/40">
              <div>
                <span className="text-muted-foreground">Languages: </span>
                <strong className="text-foreground">{priest.languages?.join(', ') || 'Hindi, Sanskrit'}</strong>
              </div>
              <span>•</span>
              <div>
                <span className="text-muted-foreground">Serving Localities: </span>
                <strong className="text-foreground">{priest.serviceAreas?.join(', ') || priest.city}</strong>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services and Dynamic Slot Picker Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Offered Services & Rates */}
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Offered Services & Price List
          </h2>

          <div className="space-y-3">
            {!priest.services || priest.services.length === 0 ? (
              <Card className="p-6 text-center text-xs text-muted-foreground border-dashed">
                This priest has not published specific service rates yet.
              </Card>
            ) : (
              priest.services.map((srv) => (
                <Card
                  key={srv.id}
                  className={`border-border/80 cursor-pointer transition-all shadow-2xs ${
                    selectedService?.id === srv.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/40'
                      : 'hover:border-primary/40'
                  }`}
                  onClick={() => setSelectedService(srv)}
                >
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-foreground">{srv.serviceName}</h3>
                        {selectedService?.id === srv.id && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        In-home ceremony with traditional vidhi and samagri guidance
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold font-mono text-foreground">
                        {formatCurrency(srv.price)}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">(Cash Payment)</span>
                      <Button
                        size="sm"
                        variant={selectedService?.id === srv.id ? 'default' : 'outline'}
                        className="mt-1 h-7 text-[11px] px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(srv);
                          handleStartBooking(srv);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Availability Slots with Date Picker */}
        <div className="md:col-span-5 space-y-4">
          <h2 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Available Time Slots
          </h2>

          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-serif">Select Date</CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  Recurring Schedule
                </Badge>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <Input
                  type="date"
                  value={selectedDate}
                  min={todayStr}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs h-8 bg-card border-border"
                />
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-2.5">
              <div className="text-[11px] font-semibold text-muted-foreground mb-2">
                Slots for {formatFullDate(selectedDate)}:
              </div>

              {isSlotsLoading ? (
                <div className="text-center py-6 text-xs text-muted-foreground">Calculating available slots...</div>
              ) : activeBookableSlots.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground space-y-2">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground/40" />
                  <p>No open slots on this date. Please pick another date.</p>
                </div>
              ) : (
                activeBookableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedSlot?.id === slot.id
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                        : 'border-border/70 hover:bg-muted/40'
                    }`}
                    onClick={() => {
                      setSelectedSlot(slot);
                      handleStartBooking(undefined, slot);
                    }}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground font-mono">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>
                          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {slot.ruleId ? 'Standard Working Hours' : 'Special Muhurat Timing'}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]"
                    >
                      Book Now
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Review & Submission Modal */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Review & Confirm Booking Request</DialogTitle>
            <DialogDescription className="text-xs">
              Price is authoritatively locked at request submission. Payment is direct in cash upon ceremony completion.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            {/* Price & Service Summary Box */}
            <div className="p-3.5 rounded-xl bg-muted/40 border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Purohit:</span>
                <strong className="text-foreground">{priest.displayName || priest.fullName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Service / Puja:</span>
                <strong className="text-foreground">{selectedService?.serviceName || 'Selected Ceremony'}</strong>
              </div>
              <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
                <span className="text-muted-foreground">Service Price (Locked Snapshot):</span>
                <strong className="font-mono text-sm font-bold text-primary">
                  {formatCurrency(selectedService?.price || 2100)} (Direct Cash)
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Scheduled Date & Time:</span>
                <span className="text-foreground font-medium">
                  {selectedSlot
                    ? `${formatFullDate(selectedSlot.date)} (${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)})`
                    : `${formatFullDate(selectedDate)} (Please pick a slot)`}
                </span>
              </div>
            </div>

            {/* Address Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Puja Location (Saved Address)</Label>
                <Link
                  to="/user/addresses"
                  className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Address
                </Link>
              </div>

              {userAddresses.length === 0 ? (
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 space-y-2">
                  <p className="text-[11px]">
                    You have no saved addresses. An address with PIN code is required for the priest to arrive.
                  </p>
                  <Link to="/user/addresses">
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Add Address Now
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {userAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between ${
                        selectedAddressId === addr.id
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                          : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {addr.houseNo || addr.houseBuilding}, {addr.villageTown || addr.locality}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                      {selectedAddressId === addr.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Notes */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Special Notes / Family Gotra (Optional)</Label>
              <Textarea
                placeholder="e.g. Please let us know if havan kund is required, or specific samagri list items..."
                rows={2}
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="text-xs resize-none"
              />
            </div>

            {/* 5-Hour Response SLA Notice */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>5-Hour Response SLA:</strong> The priest will accept or decline your request within{' '}
                <strong>5 hours</strong>. Payment is strictly in cash upon ceremony completion.
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBookingOpen(false)}
              className="text-xs"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting || !selectedSlot || !selectedAddressId || !selectedService}
              onClick={handleSubmitBooking}
              className="text-xs"
            >
              {isSubmitting ? 'Submitting Request...' : 'Submit Booking Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriestDetailsPage;
