import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import {
  mockGetPriestById,
  mockGetPriestSlots,
  mockGetAddresses,
  mockCreateBooking,
} from '@/mocks/mock-api';
import { Priest, PriestSlot, PriestService } from '@/types/priest.types';
import { Address } from '@/types/address.types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
  const [slots, setSlots] = useState<PriestSlot[]>([]);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Flow State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<PriestService | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<PriestSlot | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [userNotes, setUserNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const [priestRes, slotsRes] = await Promise.all([
          mockGetPriestById(id),
          mockGetPriestSlots(id),
        ]);

        if (priestRes.success && priestRes.data) {
          setPriest(priestRes.data);
          if (priestRes.data.services && priestRes.data.services.length > 0) {
            setSelectedService(priestRes.data.services[0]);
          }
        }
        if (slotsRes.success) {
          setSlots(slotsRes.data);
        }

        if (user) {
          const addrRes = await mockGetAddresses(user.id);
          if (addrRes.success) {
            setUserAddresses(addrRes.data);
            const defaultAddr = addrRes.data.find((a) => a.isDefault) || addrRes.data[0];
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, user]);

  const handleStartBooking = (service?: PriestService, slot?: PriestSlot) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to schedule a puja appointment.');
      navigate('/user/login');
      return;
    }
    if (service) setSelectedService(service);
    if (slot) setSelectedSlot(slot);
    setIsBookingOpen(true);
  };

  const handleSubmitBooking = async () => {
    if (!user || !priest || !selectedSlot || !selectedAddressId) {
      toast.error('Please select an address and available time slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await mockCreateBooking(user.id, {
        priestId: priest.id,
        priestServiceId: selectedService?.id,
        slotId: selectedSlot.id,
        availabilitySlotId: selectedSlot.id,
        addressId: selectedAddressId,
        bookingDate: selectedSlot.date,
        userNotes,
      });

      if (res.success && res.data) {
        toast.success(res.message);
        setIsBookingOpen(false);
        navigate(`/user/bookings/${res.data.id}`);
      } else {
        toast.error(res.message);
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
        Loading Purohit profile...
      </div>
    );
  }

  if (!priest) {
    return (
      <div className="container py-12 text-center space-y-4 max-w-md">
        <h2 className="text-xl font-bold font-serif">Purohit Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested priest profile does not exist or has been deactivated.</p>
        <Link to="/user/priests">
          <Button size="sm" variant="outline">← Return to Directory</Button>
        </Link>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.status === 'AVAILABLE');

  return (
    <div className="container py-8 space-y-8 max-w-5xl">
      {/* Back Button */}
      <Link to="/user/priests" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Purohits Directory
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
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 text-[11px]">
                    <CheckCircle2 className="h-3 w-3" /> Verified Vedic Scholar
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {priest.rating ? priest.rating.toFixed(1) : '5.0'} ({priest.reviewCount || 10} Devotee Reviews)
                  </span>
                  <span>•</span>
                  <span>{priest.experienceYears} Years Vedic Experience</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" /> {priest.city}, {priest.state}
                  </span>
                </div>
              </div>

              <Button onClick={() => handleStartBooking()} className="gap-2 text-xs h-9">
                <Calendar className="h-4 w-4" /> Request Puja Booking
              </Button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {priest.bio}
            </p>

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

      {/* Services and Available Slots Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Services & Prices */}
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Offered Ceremonies & Custom Dakshina
          </h2>

          <div className="space-y-3">
            {(!priest.services || priest.services.length === 0) ? (
              <p className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg">No services listed yet.</p>
            ) : (
              priest.services.map((srv) => (
                <Card
                  key={srv.id}
                  className={`border-border/80 cursor-pointer transition-all shadow-xs ${
                    selectedService?.id === srv.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/40'
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
                      <p className="text-[11px] text-muted-foreground">In-home sacred Vedic vidhi with samagri guidance</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold font-mono text-foreground">₹{srv.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-muted-foreground block">(Offline Cash)</span>
                      <Button
                        size="sm"
                        variant={selectedService?.id === srv.id ? 'default' : 'outline'}
                        className="mt-1 h-7 text-[11px] px-3"
                        onClick={(e) => {
                          e.stopPropagation();
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

        {/* Right Column: Muhurat Availability Slots */}
        <div className="md:col-span-5 space-y-4">
          <h2 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Available Muhurat Slots
          </h2>

          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-serif">Open Appointment Timings</CardTitle>
              <CardDescription className="text-[11px]">
                Click an open slot to schedule this Pandit Ji for your ceremony.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {availableSlots.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground space-y-2">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground/40" />
                  <p>No available slots right now. Check back soon or request a custom timing.</p>
                </div>
              ) : (
                availableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                      selectedSlot?.id === slot.id ? 'border-primary bg-primary/10' : 'border-border/70 hover:bg-muted/40'
                    }`}
                    onClick={() => {
                      setSelectedSlot(slot);
                      handleStartBooking(undefined, slot);
                    }}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>{slot.date}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {slot.startTime} – {slot.endTime}
                      </p>
                    </div>

                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                      Available
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Initiation Modal */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Confirm Puja Booking Request</DialogTitle>
            <DialogDescription className="text-xs">
              Review ritual specifics, locked service Dakshina, and select your home address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            {/* Summary Box */}
            <div className="p-3.5 rounded-xl bg-muted/40 border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Purohit:</span>
                <strong className="text-foreground">{priest.displayName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ceremony:</span>
                <strong className="text-foreground">{selectedService?.serviceName || 'Custom Puja'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Locked Dakshina:</span>
                <strong className="text-foreground font-mono text-sm">
                  ₹{(selectedService?.price || 2100).toLocaleString('en-IN')} (Offline Cash)
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Scheduled Timing:</span>
                <span className="text-foreground font-medium">
                  {selectedSlot ? `${selectedSlot.date} (${selectedSlot.startTime} - ${selectedSlot.endTime})` : 'Select a slot'}
                </span>
              </div>
            </div>

            {/* Address Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Select Puja Address</Label>
                <Link to="/user/addresses" className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add New Address
                </Link>
              </div>

              {userAddresses.length === 0 ? (
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 space-y-2">
                  <p className="text-[11px]">You have no saved addresses. An address with PIN code is required for the Purohit to arrive.</p>
                  <Link to="/user/addresses">
                    <Button size="sm" variant="outline" className="text-xs h-7">Add Address Now</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {userAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between ${
                        selectedAddressId === addr.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/30'
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

            {/* Notes */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Special Notes / Samagri Requirements (Optional)</Label>
              <Textarea
                placeholder="e.g. Please bring list of fruits/flowers, or let us know if havan kund is required."
                rows={2}
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="text-xs resize-none"
              />
            </div>

            {/* 5-Hour Expiry Notice */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Response Window:</strong> Pandit Ji will accept or decline within <strong>5 hours</strong>. Direct payment in offline cash happens upon ceremony completion.
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsBookingOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting || !selectedSlot || !selectedAddressId}
              onClick={handleSubmitBooking}
              className="text-xs"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriestDetailsPage;
