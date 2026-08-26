import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { mockGetBookings, mockCancelBooking, mockSubmitRating } from '@/mocks/mock-api';
import { Booking } from '@/types/booking.types';
import { RatingInput } from '@/schemas/booking.schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { RatingModal } from '@/components/booking/RatingModal';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Search,
  Phone,
  ArrowRight,
  Star,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

type FilterTab = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

const QUICK_CANCEL_REASONS = [
  'Schedule clash or change of plans',
  'Personal or family emergency',
  'Want to reschedule to another auspicious Muhurat',
  'Purohit requested change of date',
  'Other reasons',
];

export const BookingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cancel Dialog State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(QUICK_CANCEL_REASONS[0]);
  const [customReasonText, setCustomReasonText] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Rating Modal State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [bookingToRate, setBookingToRate] = useState<Booking | null>(null);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const devoteeId = user?.id || 'user-devotee-1';
      const res = await mockGetBookings(devoteeId);
      if (res.success) {
        setBookings(res.data);
      }
    } catch {
      toast.error('Failed to load your ceremony bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user?.id]);

  const handleOpenCancelDialog = (booking: Booking) => {
    setBookingToCancel(booking);
    setSelectedReason(QUICK_CANCEL_REASONS[0]);
    setCustomReasonText('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel || !user) return;
    const finalReason = selectedReason === 'Other reasons' ? customReasonText.trim() : selectedReason;
    if (!finalReason) {
      toast.error('Please specify a cancellation reason.');
      return;
    }

    setIsCancelling(true);
    try {
      const res = await mockCancelBooking(bookingToCancel.id, user.id, finalReason);
      if (res.success) {
        toast.success(res.message);
        setCancelModalOpen(false);
        loadBookings();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenRatingModal = (booking: Booking) => {
    setBookingToRate(booking);
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = async (data: RatingInput) => {
    if (!user) return;
    try {
      const res = await mockSubmitRating(user.id, data);
      if (res.success) {
        toast.success(res.message);
        loadBookings();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to submit rating.');
    }
  };

  // Filter and Search Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Tab Filtering
      if (activeTab === 'PENDING' && b.status !== 'PENDING') return false;
      if (activeTab === 'CONFIRMED' && b.status !== 'CONFIRMED') return false;
      if (activeTab === 'COMPLETED' && b.status !== 'COMPLETED') return false;
      if (
        activeTab === 'CANCELLED' &&
        b.status !== 'CANCELLED' &&
        b.status !== 'REJECTED' &&
        b.status !== 'EXPIRED'
      )
        return false;

      // Query Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const refMatch = b.bookingReference.toLowerCase().includes(q);
        const srvMatch = b.serviceName?.toLowerCase().includes(q);
        const priestMatch = b.priest?.displayName?.toLowerCase().includes(q);
        return refMatch || srvMatch || priestMatch;
      }

      return true;
    });
  }, [bookings, activeTab, searchQuery]);

  return (
    <div className="container py-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Devotee Appointments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
            My Ceremony Bookings
          </h1>
          <p className="text-xs text-muted-foreground">
            Track status, view locked Dakshina amounts, cancel pending requests, and rate completed pujas.
          </p>
        </div>

        <Link to="/user/priests">
          <Button size="sm" className="gap-2 text-xs self-start sm:self-auto">
            <Sparkles className="h-3.5 w-3.5" /> Book New Puja
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search Strip */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-muted/60 rounded-xl border">
          {(
            [
              { id: 'ALL', label: 'All' },
              { id: 'PENDING', label: 'Pending Request' },
              { id: 'CONFIRMED', label: 'Upcoming' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'CANCELLED', label: 'Past / Cancelled' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search booking ref or priest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-muted-foreground">
          Loading your ceremonies...
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="border-border/80 text-center py-12 px-4 shadow-xs">
          <div className="max-w-md mx-auto space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold font-serif text-foreground">No Bookings Found</h2>
            <p className="text-xs text-muted-foreground">
              {activeTab === 'ALL'
                ? 'You have not scheduled any Vedic ceremonies yet.'
                : `No ceremonies found under the "${activeTab}" status.`}
            </p>
            <Link to="/user/priests">
              <Button size="sm" className="text-xs">Find Available Purohits</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((booking) => (
            <Card
              key={booking.id}
              className="border-border/80 hover:border-primary/40 transition-colors shadow-xs"
            >
              <CardContent className="p-5 sm:p-6 space-y-4">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-foreground">
                      {booking.bookingReference}
                    </span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-xs text-muted-foreground">
                      Requested {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <BookingStatusBadge status={booking.status} />
                </div>

                {/* Main Content */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        booking.priest?.profileImageUrl ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
                      }
                      alt={booking.priest?.displayName || 'Priest'}
                      className="h-14 w-14 rounded-xl object-cover border shrink-0 bg-muted"
                    />

                    <div className="space-y-1">
                      <h2 className="font-bold text-base font-serif text-foreground">
                        {booking.serviceName}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Purohit: <strong className="text-foreground">{booking.priest?.displayName || 'Vedic Scholar'}</strong>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {booking.bookingDate} ({booking.startTime} - {booking.endTime})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {booking.address?.city || 'In-home Ceremony'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Locked Dakshina */}
                  <div className="text-right shrink-0 self-end sm:self-auto space-y-1">
                    <span className="text-[11px] text-muted-foreground block">Locked Dakshina</span>
                    <span className="text-base font-bold font-mono text-foreground">
                      ₹{(booking.servicePrice || booking.dakshinaAmount).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">(Offline Cash)</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
                  {/* Status specific helpers */}
                  <div className="text-xs text-muted-foreground">
                    {booking.status === 'PENDING' && (
                      <span className="text-amber-600 font-medium">
                        ⏳ Response deadline: Pandit Ji has 5 hours to accept.
                      </span>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                        <Phone className="h-3.5 w-3.5" /> Pandit Ji Mobile:{' '}
                        <strong className="font-mono">{booking.priest?.phoneNumber || '+919876543211'}</strong>
                      </span>
                    )}
                    {booking.status === 'REJECTED' && (
                      <span className="text-destructive font-medium">
                        Declined reason: {booking.rejectionReason || 'Prior commitment.'}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCancelDialog(booking)}
                        className="text-xs h-8 text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                      </Button>
                    )}

                    {booking.status === 'COMPLETED' && !booking.ratingSubmitted && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenRatingModal(booking)}
                        className="text-xs h-8 gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        <Star className="h-3.5 w-3.5 fill-white" /> Rate Priest
                      </Button>
                    )}

                    {booking.status === 'COMPLETED' && booking.ratingSubmitted && (
                      <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30">
                        ✓ Rating Submitted
                      </Badge>
                    )}

                    <Link to={`/user/bookings/${booking.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs h-8 gap-1">
                        <span>Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-destructive">Cancel Ceremony Booking</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you wish to cancel booking ref <strong>{bookingToCancel?.bookingReference}</strong>? The Purohit will be notified immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Select Reason (Required)</label>
              <div className="space-y-1.5">
                {QUICK_CANCEL_REASONS.map((r) => (
                  <label
                    key={r}
                    className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-muted/30 text-xs"
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={r}
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="text-primary"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedReason === 'Other reasons' && (
              <div className="space-y-1">
                <label className="text-xs font-medium">Please specify reason</label>
                <Textarea
                  placeholder="Enter details..."
                  rows={2}
                  value={customReasonText}
                  onChange={(e) => setCustomReasonText(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)} className="text-xs">
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isCancelling}
              onClick={handleConfirmCancel}
              className="text-xs"
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Modal */}
      {bookingToRate && (
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false);
            setBookingToRate(null);
          }}
          bookingId={bookingToRate.id}
          priestName={bookingToRate.priest?.displayName}
          serviceName={bookingToRate.serviceName}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default BookingsPage;
