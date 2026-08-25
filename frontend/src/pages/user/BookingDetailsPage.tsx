import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Hourglass,
  XCircle,
  Ban,
  CalendarCheck2,
  Phone,
  Award,
  Coins,
  ShieldCheck,
  AlertCircle,
  Share2,
  Printer,
  Check,
  Info,
  FileText,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

import { mockGetBookingById, mockCancelBooking } from '@/mocks/mock-api';
import { Booking, BookingStatus } from '@/types/booking.types';

const QUICK_CANCEL_REASONS = [
  'Schedule clash or change of plans',
  'Personal or family emergency',
  'Want to reschedule to another auspicious Muhurat',
  'Purohit requested change of date',
  'Other reasons',
];

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [selectedReason, setSelectedReason] = useState<string>(QUICK_CANCEL_REASONS[0]);
  const [customReasonText, setCustomReasonText] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Fetch Booking Details from Mock API
  const fetchBooking = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await mockGetBookingById(id);
      setBooking(data);
    } catch (err) {
      console.error('Failed to load booking:', err);
      toast.error('Failed to load ceremony booking details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  // Handle Confirm Cancel
  const handleConfirmCancel = async () => {
    if (!booking) return;

    const finalReason =
      selectedReason === 'Other reasons'
        ? customReasonText.trim() || 'Cancelled by devotee without detailed reason'
        : customReasonText.trim()
        ? `${selectedReason} - ${customReasonText.trim()}`
        : selectedReason;

    setIsCancelling(true);
    try {
      const updated = await mockCancelBooking(booking.id, finalReason);
      setBooking(updated);
      toast.success(`Booking ${booking.bookingReference} cancelled successfully.`, {
        description: 'The assigned Purohit has been notified of the schedule update.',
      });
      setCancelModalOpen(false);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error('Failed to cancel the ceremony appointment. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Helper to copy booking reference
  const handleCopyReference = () => {
    if (!booking?.bookingReference) return;
    navigator.clipboard.writeText(booking.bookingReference);
    toast.success(`Reference ${booking.bookingReference} copied to clipboard!`);
  };

  // Helper to format ceremony date
  const formatCeremonyDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50 hover:bg-amber-500/20 font-medium text-xs flex items-center gap-1.5 py-1 px-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Confirmed & Scheduled
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700/50 hover:bg-orange-500/20 font-medium text-xs flex items-center gap-1.5 py-1 px-3">
            <Hourglass className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            Pending Purohit Confirmation
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-500/20 font-medium text-xs flex items-center gap-1.5 py-1 px-3">
            <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Ceremony Completed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/50 hover:bg-rose-500/20 font-medium text-xs flex items-center gap-1.5 py-1 px-3">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Appointment Cancelled
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-zinc-500/15 text-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700/50 hover:bg-zinc-500/20 font-medium text-xs flex items-center gap-1.5 py-1 px-3">
            <Ban className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
            Declined by Purohit
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        );
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <div className="h-6 w-36 bg-muted rounded animate-pulse" />
        <div className="p-8 border rounded-2xl bg-card space-y-6 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-8 w-28 bg-muted rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-44 bg-muted rounded-xl" />
            <div className="h-44 bg-muted rounded-xl" />
          </div>
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  // Not Found State
  if (!booking) {
    return (
      <div className="container max-w-2xl py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-serif text-foreground">
            Booking Appointment Not Found
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We couldn't locate booking reference <span className="font-mono font-semibold">{id}</span>. It may have been archived or removed.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('/bookings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to All Bookings
          </Button>
          <Link to="/rituals">
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" />
              Book New Ceremony
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCancellable = booking.status === 'CONFIRMED' || booking.status === 'PENDING';

  return (
    <div className="container max-w-4xl py-8 space-y-6 print:py-0 print:max-w-none">
      {/* Back link & Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors print:hidden"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Bookings
        </Link>

        <div className="flex items-center gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyReference}
            className="text-xs h-8 gap-1.5"
            title="Copy Reference ID"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Ref
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs h-8 gap-1.5"
            title="Print Ceremony Summary"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </Button>
        </div>
      </div>

      {/* Main Booking Summary Card */}
      <Card className="border-border shadow-xs overflow-hidden bg-card">
        {/* Top Header Banner with Brand Styling */}
        <div className="p-6 bg-gradient-to-r from-primary/10 via-amber-500/5 to-secondary/10 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-background/90 text-foreground border rounded-md shadow-2xs">
                {booking.bookingReference || booking.id}
              </span>
              <span className="text-xs text-muted-foreground">
                Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground tracking-tight pt-1">
              {booking.ritual?.name || 'Vedic Ceremony Appointment'}
            </h1>
          </div>

          <div className="flex sm:flex-col sm:items-end gap-2">
            {renderStatusBadge(booking.status)}
            <span className="text-[11px] text-muted-foreground font-medium">
              Vedic Heritage Certified
            </span>
          </div>
        </div>

        {/* Cancellation Notice Alert if Cancelled */}
        {booking.cancellationReason && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-semibold text-sm">Appointment Cancelled</h4>
              <p>
                <span className="font-medium">Reason provided:</span> {booking.cancellationReason}
              </p>
              {booking.cancelledBy && (
                <p className="opacity-80">
                  Cancelled by: <span className="font-semibold">{booking.cancelledBy}</span>
                  {booking.cancelledAt && ` on ${new Date(booking.cancelledAt).toLocaleString('en-IN')}`}
                </p>
              )}
            </div>
          </div>
        )}

        <CardContent className="p-6 space-y-6">
          {/* Primary Two-Column Grid: Muhurat Schedule & Assigned Purohit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Auspicious Muhurat & Timing Card */}
            <div className="p-5 rounded-xl border bg-muted/20 space-y-4">
              <div className="flex items-center gap-2 text-primary font-serif font-semibold text-base">
                <Clock className="w-4 h-4 text-primary" />
                <h3>Auspicious Muhurat & Timing</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      Ceremony Date
                    </span>
                    <div className="text-sm font-semibold text-foreground">
                      {formatCeremonyDate(booking.bookingDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      Muhurat Time Window
                    </span>
                    <div className="text-sm font-semibold text-foreground">
                      {booking.startTime} - {booking.endTime}
                    </div>
                    {booking.ritual?.approximateDurationMinutes && (
                      <span className="text-[11px] text-muted-foreground">
                        Estimated ritual duration: {Math.floor(booking.ritual.approximateDurationMinutes / 60)}h{' '}
                        {booking.ritual.approximateDurationMinutes % 60 > 0 ? `${booking.ritual.approximateDurationMinutes % 60}m` : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t flex items-start gap-2 text-[11px] text-muted-foreground bg-background/50 p-2.5 rounded-lg border">
                  <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>
                    The assigned Purohit will arrive <strong>20-30 minutes prior</strong> to the Muhurat for holy Vedi and Kalash preparations.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Assigned Vedic Purohit Card */}
            <div className="p-5 rounded-xl border bg-muted/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-serif font-semibold text-base">
                  <Award className="w-4 h-4 text-primary" />
                  <h3>Assigned Purohit</h3>
                </div>
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                </Badge>
              </div>

              {booking.priest ? (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3.5">
                    {booking.priest.profileImageUrl ? (
                      <img
                        src={booking.priest.profileImageUrl}
                        alt={booking.priest.fullName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shadow-xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-serif">
                        {booking.priest.fullName.charAt(0)}
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-foreground">
                        {booking.priest.displayName || booking.priest.fullName}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{booking.priest.experienceYears} Years Vedic Experience</span>
                        {booking.priest.rating && (
                          <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {booking.priest.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {booking.priest.bio && (
                    <p className="text-xs text-muted-foreground italic line-clamp-2">
                      "{booking.priest.bio}"
                    </p>
                  )}

                  {booking.priest.languages && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-muted-foreground font-medium">Languages:</span>
                      {booking.priest.languages.map((lang) => (
                        <span key={lang} className="px-2 py-0.5 bg-background border rounded text-xs">
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}

                  {booking.priest.phoneNumber && (
                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Direct Contact:</span>
                      <a
                        href={`tel:${booking.priest.phoneNumber}`}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {booking.priest.phoneNumber}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Purohit details will be assigned and updated shortly.
                </p>
              )}
            </div>
          </div>

          {/* 3. Venue Details & Dakshina Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Venue Address Card */}
            <div className="p-5 rounded-xl border bg-muted/20 space-y-3">
              <div className="flex items-center gap-2 text-primary font-serif font-semibold text-base">
                <MapPin className="w-4 h-4 text-secondary" />
                <h3>Ceremony Venue</h3>
              </div>

              {booking.address ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold text-primary border-primary/30">
                      {booking.address.label || 'Home'}
                    </Badge>
                    <span className="font-semibold text-foreground">
                      {booking.address.recipientName}
                    </span>
                    {booking.address.phoneNumber && (
                      <span className="text-muted-foreground font-mono">
                        ({booking.address.phoneNumber})
                      </span>
                    )}
                  </div>

                  <p className="text-foreground leading-relaxed">
                    {booking.address.houseBuilding}
                    {booking.address.street && `, ${booking.address.street}`}
                    {booking.address.locality && `, ${booking.address.locality}`}
                    <br />
                    {booking.address.landmark && (
                      <span className="text-muted-foreground">
                        Landmark: {booking.address.landmark}
                        <br />
                      </span>
                    )}
                    {booking.address.city}, {booking.address.state} -{' '}
                    <span className="font-mono font-semibold">{booking.address.pincode}</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Devotee Registered Residence (Address on profile)
                </p>
              )}
            </div>

            {/* Offline Dakshina & Payment Details Card */}
            <div className="p-5 rounded-xl border bg-muted/20 space-y-3">
              <div className="flex items-center gap-2 text-primary font-serif font-semibold text-base">
                <Coins className="w-4 h-4 text-primary" />
                <h3>Purohit Dakshina & Payment</h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-baseline justify-between p-3 rounded-lg bg-background border">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                      Ceremony Dakshina
                    </span>
                    <span className="text-xs text-muted-foreground">Cash on Completion</span>
                  </div>
                  <span className="text-2xl font-bold font-serif text-foreground text-primary">
                    ₹{booking.dakshinaAmount?.toLocaleString('en-IN') || '2,100'}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>No advance online payment required.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Hand over Dakshina directly to Purohit upon completion of the ritual.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Sacred Samagri & Requirements Checklist */}
          {booking.ritual && (
            <div className="p-5 rounded-xl border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-serif font-semibold text-base">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3>Sacred Samagri & Devotee Preparation Checklist</h3>
                </div>
                {booking.ritual.category && (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Category: {booking.ritual.category}
                  </span>
                )}
              </div>

              {booking.ritual.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {booking.ritual.description}
                </p>
              )}

              <Separator />

              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground block">
                  Items to arrange at home before the Purohit arrives:
                </span>

                {booking.ritual.requirements && booking.ritual.requirements.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {booking.ritual.requirements.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 border text-xs text-foreground"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Standard puja samagri (Ghee, Flowers, Fruits, Agarbatti, and Panchamrit). Purohit will carry special Vedic utensils.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 5. Special Devotee Instructions if any */}
          {booking.specialInstructions && (
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Special Devotee Request / Sankalp Notes:</span>
              </div>
              <p className="text-muted-foreground italic pl-5">
                "{booking.specialInstructions}"
              </p>
            </div>
          )}

          {/* 6. Footer Actions Bar */}
          <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <div>
              {isCancellable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCancelModalOpen(true)}
                  className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel Ceremony Appointment
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link to="/bookings" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Back to Bookings
                </Button>
              </Link>
              <Link to="/rituals" className="w-full sm:w-auto">
                <Button size="sm" className="w-full text-xs gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  Explore More Pujas
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Reason Dialog */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Cancel Puja Appointment
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to cancel booking{' '}
              <span className="font-semibold font-mono text-foreground">
                {booking.bookingReference || booking.id}
              </span>
              ? This will release the Pandit's allocated Muhurat slot.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Reason for Cancellation:
              </label>
              <div className="space-y-1.5">
                {QUICK_CANCEL_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedReason === reason
                        ? 'border-primary bg-primary/5 font-medium'
                        : 'border-border hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancellationReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="accent-primary"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Additional Notes / Feedback (Optional):
              </label>
              <Textarea
                placeholder="Share any other context or request for rescheduling..."
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              disabled={isCancelling}
              className="text-xs"
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="text-xs gap-1.5"
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingDetailsPage;
