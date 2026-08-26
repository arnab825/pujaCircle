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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { CancelBookingDialog } from '@/components/booking/CancelBookingDialog';
import { RatingModal } from '@/components/booking/RatingModal';
import { EmptyState } from '@/components/common/EmptyState';
import { BOOKING_STATUS_CONFIG } from '@/lib/constants';
import { formatINR, formatDate, cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Phone,
  ArrowRight,
  Star,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';

type FilterTab = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export const BookingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dialog States
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
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

  const handleConfirmCancel = async (reason: string) => {
    if (!bookingToCancel || !user) return;
    const res = await mockCancelBooking(bookingToCancel.id, user.id, reason);
    if (res.success) {
      toast.success('Puja appointment cancelled.');
      setCancelModalOpen(false);
      loadBookings();
    } else {
      toast.error(res.message || 'Failed to cancel.');
    }
  };

  const handleRatingSubmit = async (data: RatingInput) => {
    if (!user || !bookingToRate) return;
    const res = await mockSubmitRating(user.id, data);
    if (res.success) {
      toast.success('Thank you for rating your Purohit!');
      setRatingModalOpen(false);
      loadBookings();
    } else {
      toast.error(res.message || 'Failed to submit rating.');
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Tab filter
      if (activeTab === 'PENDING' && b.status !== 'PENDING') return false;
      if (activeTab === 'CONFIRMED' && b.status !== 'CONFIRMED') return false;
      if (activeTab === 'COMPLETED' && b.status !== 'COMPLETED') return false;
      if (activeTab === 'CANCELLED' && !['CANCELLED', 'REJECTED', 'EXPIRED'].includes(b.status)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const refMatch = (b.bookingReference || b.id).toLowerCase().includes(query);
        const ritualMatch = (b.serviceName || '').toLowerCase().includes(query);
        const priestMatch = (b.priest?.displayName || b.priest?.fullName || '').toLowerCase().includes(query);
        return refMatch || ritualMatch || priestMatch;
      }
      return true;
    });
  }, [bookings, activeTab, searchQuery]);

  // Tab Counts
  const counts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === 'PENDING').length,
      confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
      completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      cancelled: bookings.filter((b) => ['CANCELLED', 'REJECTED', 'EXPIRED'].includes(b.status)).length,
    };
  }, [bookings]);

  return (
    <div className="container py-6 sm:py-8 space-y-6 max-w-5xl">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">My Puja Bookings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Track upcoming sacred appointments, view Purohit details, and manage completed rituals.
          </p>
        </div>
        <Link to="/user/priests" className="w-full sm:w-auto">
          <Button size="sm" className="gap-1.5 text-xs w-full sm:w-auto h-9">
            Book New Ceremony
          </Button>
        </Link>
      </div>

      {/* Tabs & Search Filter */}
      <div className="space-y-4">
        <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as FilterTab)}>
            <TabsList className="inline-flex h-10 items-center justify-start rounded-xl bg-muted/60 p-1 text-muted-foreground border border-border/80 min-w-max gap-1">
              <TabsTrigger
                value="ALL"
                className="text-xs px-3 py-1.5 h-8 gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs font-medium"
              >
                <span>All</span>
                <span className="px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                  {counts.all}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="PENDING"
                className="text-xs px-3 py-1.5 h-8 gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs font-medium"
              >
                <span>Pending</span>
                {counts.pending > 0 ? (
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-semibold", BOOKING_STATUS_CONFIG.PENDING.pillClass)}>
                    {counts.pending}
                  </span>
                ) : null}
              </TabsTrigger>

              <TabsTrigger
                value="CONFIRMED"
                className="text-xs px-3 py-1.5 h-8 gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs font-medium"
              >
                <span>Confirmed</span>
                {counts.confirmed > 0 ? (
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-semibold", BOOKING_STATUS_CONFIG.CONFIRMED.pillClass)}>
                    {counts.confirmed}
                  </span>
                ) : null}
              </TabsTrigger>

              <TabsTrigger
                value="COMPLETED"
                className="text-xs px-3 py-1.5 h-8 gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs font-medium"
              >
                <span>Completed</span>
                {counts.completed > 0 ? (
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-semibold", BOOKING_STATUS_CONFIG.COMPLETED.pillClass)}>
                    {counts.completed}
                  </span>
                ) : null}
              </TabsTrigger>

              <TabsTrigger
                value="CANCELLED"
                className="text-xs px-3 py-1.5 h-8 gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs font-medium"
              >
                <span>Cancelled</span>
                {counts.cancelled > 0 ? (
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-semibold", BOOKING_STATUS_CONFIG.CANCELLED.pillClass)}>
                    {counts.cancelled}
                  </span>
                ) : null}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings by ceremony, purohit, or reference ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">Loading your bookings...</div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const canCancel = b.status === 'PENDING' || b.status === 'CONFIRMED';
            const canRate = b.status === 'COMPLETED' && !b.ratingSubmitted;

            return (
              <Card key={b.id} className="border shadow-xs overflow-hidden hover:shadow-sm transition-all bg-card">
                <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-foreground font-serif">
                        {b.serviceName || 'Puja Ceremony'}
                      </span>
                      <BookingStatusBadge status={b.status} />
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {b.bookingReference || b.id.slice(0, 8)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{formatDate(b.bookingDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{b.slot ? `${b.slot.startTime} - ${b.slot.endTime}` : 'Morning Muhurat'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">
                          {b.address ? `${b.address.villageTown || b.address.city}, ${b.address.city}` : 'Home Address'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs">
                      <span className="text-muted-foreground">
                        Dakshina: <strong className="text-foreground">{formatINR(b.servicePrice || b.dakshinaAmount || 2100)}</strong>
                      </span>
                      {b.status === 'CONFIRMED' && b.priest?.phoneNumber && (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3 text-primary" />
                          <strong className="text-foreground font-mono">{b.priest.phoneNumber}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions - Block full width on mobile, inline on desktop */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto">
                    <Link to={`/user/bookings/${b.id}`} className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="gap-1 text-xs w-full sm:w-auto h-9">
                        View Details <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>

                    {canRate && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setBookingToRate(b);
                          setRatingModalOpen(true);
                        }}
                        className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto h-9"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        Rate
                      </Button>
                    )}

                    {canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBookingToCancel(b);
                          setCancelModalOpen(true);
                        }}
                        className="gap-1 text-xs text-destructive hover:text-destructive border-destructive/30 w-full sm:w-auto h-9"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description={
            searchQuery ? 'No appointments match your search criteria.' : 'You have no bookings in this category.'
          }
        />
      )}

      {/* Modals */}
      <CancelBookingDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        bookingReference={bookingToCancel?.bookingReference || bookingToCancel?.id}
      />

      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        bookingId={bookingToRate?.id || ''}
        priestName={bookingToRate?.priest?.displayName || bookingToRate?.priest?.fullName}
        serviceName={bookingToRate?.serviceName}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
};

export default BookingsPage;
