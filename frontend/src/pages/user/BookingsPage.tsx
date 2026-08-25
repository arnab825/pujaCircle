import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Hourglass,
  Phone,
  ArrowRight,
  Filter,
  Coins,
  Ban,
  CalendarCheck2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

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

import { useAuthStore } from '@/store/auth.store';
import { mockGetBookings, mockCancelBooking } from '@/mocks/mock-api';
import { Booking, BookingStatus } from '@/types/booking.types';

type FilterTab = 'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

const QUICK_CANCEL_REASONS = [
  'Schedule clash or change of plans',
  'Personal or family emergency',
  'Want to reschedule to another auspicious Muhurat',
  'Purohit requested change of date',
  'Other reasons',
];

const BookingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cancel Dialog state
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(QUICK_CANCEL_REASONS[0]);
  const [customReasonText, setCustomReasonText] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Load Bookings from centralized mock API
  const loadBookings = async () => {
    setIsLoading(true);
    try {
      // Fetch bookings for current devotee or default devotee mock user
      const devoteeId = user?.id || 'user-devotee-1';
      const data = await mockGetBookings(devoteeId);
      
      // If devotee has no bookings (e.g. logged in with a fresh test user),
      // also fallback to user-devotee-1 mock data for rich presentation
      if (data.length === 0 && devoteeId !== 'user-devotee-1') {
        const fallbackData = await mockGetBookings('user-devotee-1');
        setBookings(fallbackData);
      } else {
        setBookings(data);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      toast.error('Failed to load your ceremony bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user?.id]);

  // Open Cancel Dialog
  const handleOpenCancelDialog = (booking: Booking) => {
    setBookingToCancel(booking);
    setSelectedReason(QUICK_CANCEL_REASONS[0]);
    setCustomReasonText('');
    setCancelModalOpen(true);
  };

  // Submit Cancellation
  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    const finalReason =
      selectedReason === 'Other reasons'
        ? customReasonText.trim() || 'Cancelled by devotee without detailed reason'
        : customReasonText.trim()
        ? `${selectedReason} - ${customReasonText.trim()}`
        : selectedReason;

    setIsCancelling(true);
    try {
      const updated = await mockCancelBooking(bookingToCancel.id, finalReason);
      
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
      );

      toast.success(`Booking ${bookingToCancel.bookingReference} cancelled successfully.`, {
        description: 'The assigned Purohit has been notified of the schedule update.',
      });
      setCancelModalOpen(false);
      setBookingToCancel(null);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error('Failed to cancel the ceremony appointment. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Status Badge Component
  const renderStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50 hover:bg-amber-500/20 font-medium text-xs flex items-center gap-1.5 py-0.5 px-2.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Confirmed
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700/50 hover:bg-orange-500/20 font-medium text-xs flex items-center gap-1.5 py-0.5 px-2.5">
            <Hourglass className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            Pending Purohit Confirmation
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-500/20 font-medium text-xs flex items-center gap-1.5 py-0.5 px-2.5">
            <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Completed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/50 hover:bg-rose-500/20 font-medium text-xs flex items-center gap-1.5 py-0.5 px-2.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Cancelled
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-zinc-500/15 text-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700/50 hover:bg-zinc-500/20 font-medium text-xs flex items-center gap-1.5 py-0.5 px-2.5">
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

  // Metrics Calculation
  const metrics = useMemo(() => {
    const total = bookings.length;
    const upcoming = bookings.filter(
      (b) => b.status === 'CONFIRMED' || b.status === 'PENDING'
    ).length;
    const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
    const cancelled = bookings.filter(
      (b) => b.status === 'CANCELLED' || b.status === 'REJECTED'
    ).length;
    return { total, upcoming, completed, cancelled };
  }, [bookings]);

  // Filter & Search Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Tab filter
      let matchesTab = true;
      if (activeTab === 'UPCOMING') {
        matchesTab = booking.status === 'CONFIRMED' || booking.status === 'PENDING';
      } else if (activeTab === 'COMPLETED') {
        matchesTab = booking.status === 'COMPLETED';
      } else if (activeTab === 'CANCELLED') {
        matchesTab = booking.status === 'CANCELLED' || booking.status === 'REJECTED';
      }

      if (!matchesTab) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const refMatch = booking.bookingReference?.toLowerCase().includes(q);
      const ritualMatch = booking.ritual?.name?.toLowerCase().includes(q);
      const priestMatch =
        booking.priest?.fullName?.toLowerCase().includes(q) ||
        booking.priest?.displayName?.toLowerCase().includes(q);
      const cityMatch = booking.address?.city?.toLowerCase().includes(q);

      return refMatch || ritualMatch || priestMatch || cityMatch;
    });
  }, [bookings, activeTab, searchQuery]);

  // Format Helper for Muhurat Date
  const formatCeremonyDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-serif tracking-tight text-foreground">
              My Puja Bookings
            </h1>
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary font-medium rounded-full">
              Devotee Portal
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track your upcoming Vedic rituals, auspicious Muhurat schedules, and Purohit appointments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBookings}
            disabled={isLoading}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/rituals">
            <Button size="sm" className="h-9 gap-2 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Book New Ceremony
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'ALL'
              ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20'
              : 'bg-card hover:bg-muted/40 border-border'
          }`}
        >
          <span className="text-xs font-medium text-muted-foreground">All Bookings</span>
          <div className="text-2xl font-bold font-serif text-foreground mt-1">
            {metrics.total}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('UPCOMING')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'UPCOMING'
              ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20'
              : 'bg-card hover:bg-muted/40 border-border'
          }`}
        >
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Upcoming
          </span>
          <div className="text-2xl font-bold font-serif text-foreground mt-1">
            {metrics.upcoming}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'COMPLETED'
              ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20'
              : 'bg-card hover:bg-muted/40 border-border'
          }`}
        >
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
          <div className="text-2xl font-bold font-serif text-foreground mt-1">
            {metrics.completed}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CANCELLED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'CANCELLED'
              ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20'
              : 'bg-card hover:bg-muted/40 border-border'
          }`}
        >
          <span className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
          <div className="text-2xl font-bold font-serif text-foreground mt-1">
            {metrics.cancelled}
          </div>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-2 rounded-xl border">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant={activeTab === 'ALL' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 text-xs font-medium rounded-lg"
            onClick={() => setActiveTab('ALL')}
          >
            All ({metrics.total})
          </Button>
          <Button
            variant={activeTab === 'UPCOMING' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 text-xs font-medium rounded-lg"
            onClick={() => setActiveTab('UPCOMING')}
          >
            Upcoming ({metrics.upcoming})
          </Button>
          <Button
            variant={activeTab === 'COMPLETED' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 text-xs font-medium rounded-lg"
            onClick={() => setActiveTab('COMPLETED')}
          >
            Completed ({metrics.completed})
          </Button>
          <Button
            variant={activeTab === 'CANCELLED' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 text-xs font-medium rounded-lg"
            onClick={() => setActiveTab('CANCELLED')}
          >
            Cancelled ({metrics.cancelled})
          </Button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Search ritual, pandit, ref ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-9 pr-3 text-xs bg-background rounded-lg border-border"
          />
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 border rounded-xl bg-card animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 bg-muted rounded w-1/4" />
                <div className="h-5 bg-muted rounded w-24" />
              </div>
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        /* Empty State */
        <div className="p-12 border border-dashed rounded-2xl bg-card text-center space-y-4 max-w-md mx-auto my-8 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-serif text-foreground">
              No Bookings Found
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {searchQuery
                ? `No ceremony bookings match "${searchQuery}". Try a different keyword.`
                : activeTab !== 'ALL'
                ? `You have no ${activeTab.toLowerCase()} ceremony appointments at the moment.`
                : 'You have not booked any Vedic ceremonies yet.'}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
            <Link to="/rituals">
              <Button size="sm" className="text-xs gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" /> Explore Ceremonies
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Booking Cards Grid / List */
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isCancellable =
              booking.status === 'CONFIRMED' || booking.status === 'PENDING';

            return (
              <Card
                key={booking.id}
                className="overflow-hidden border-border/80 hover:border-primary/40 transition-all hover:shadow-md bg-card group"
              >
                <CardContent className="p-0">
                  {/* Top Bar with Reference & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 bg-muted/40 border-b">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-background border rounded text-foreground">
                        {booking.bookingReference || booking.id}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {formatCeremonyDate(booking.bookingDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {renderStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1: Ritual & Priest Information */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] tracking-wider uppercase font-semibold text-primary">
                          Sacred Ritual
                        </span>
                        <h3 className="text-lg font-bold font-serif text-foreground group-hover:text-primary transition-colors">
                          {booking.ritual?.name || 'Vedic Puja Ceremony'}
                        </h3>
                        {booking.ritual?.category && (
                          <span className="inline-block text-[11px] text-muted-foreground mt-0.5">
                            Category: {booking.ritual.category}
                          </span>
                        )}
                      </div>

                      {/* Pandit Card Snippet */}
                      <div className="p-2.5 rounded-lg bg-muted/30 border text-xs space-y-1">
                        <div className="font-semibold text-foreground flex items-center justify-between">
                          <span>
                            {booking.priest?.displayName ||
                              booking.priest?.fullName ||
                              'Vedic Purohit'}
                          </span>
                          {booking.priest?.experienceYears && (
                            <span className="text-[10px] text-muted-foreground font-normal">
                              {booking.priest.experienceYears}y exp
                            </span>
                          )}
                        </div>
                        {booking.priest?.specializations && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {booking.priest.specializations.slice(0, 2).join(' • ')}
                          </p>
                        )}
                        {booking.priest?.phoneNumber && (
                          <div className="flex items-center gap-1 text-[11px] text-primary/90 font-mono pt-0.5">
                            <Phone className="w-3 h-3" />
                            {booking.priest.phoneNumber}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Muhurat Time & Venue Address */}
                    <div className="space-y-3">
                      {/* Muhurat Slot */}
                      <div className="space-y-1">
                        <span className="text-[10px] tracking-wider uppercase font-semibold text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary" /> Auspicious Muhurat Slot
                        </span>
                        <div className="text-sm font-semibold text-foreground">
                          {booking.startTime} - {booking.endTime}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Please prepare venue 30 mins prior to Muhurat.
                        </p>
                      </div>

                      {/* Venue Address */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] tracking-wider uppercase font-semibold text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-secondary" /> Ceremony Venue
                        </span>
                        <div className="text-xs text-foreground font-medium">
                          {booking.address?.label && (
                            <span className="font-semibold capitalize text-primary mr-1">
                              [{booking.address.label}]:
                            </span>
                          )}
                          {booking.address ? (
                            <span>
                              {booking.address.houseBuilding}
                              {booking.address.street && `, ${booking.address.street}`}
                              {booking.address.locality && `, ${booking.address.locality}`}
                              {booking.address.city && `, ${booking.address.city}`} - {booking.address.pincode}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">
                              Devotee Registered Residence
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Dakshina, Instructions, and Actions */}
                    <div className="flex flex-col justify-between space-y-4 md:border-l md:pl-6">
                      {/* Dakshina Amount & Payment Mode */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] tracking-wider uppercase font-semibold text-muted-foreground flex items-center gap-1">
                          <Coins className="w-3 h-3 text-primary" /> Purohit Dakshina
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold font-serif text-foreground">
                            ₹{booking.dakshinaAmount?.toLocaleString('en-IN') || '2,100'}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            (Offline Cash)
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Info className="w-3 h-3 text-muted-foreground shrink-0" />
                          Pay directly to Pandit upon completion of ritual.
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <Link
                          to={`/bookings/${booking.id}`}
                          className="flex-1 min-w-[120px]"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs h-8 gap-1 border-border/80 hover:border-primary/50 group-hover:bg-primary/5"
                          >
                            View Details
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          </Button>
                        </Link>

                        {isCancellable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenCancelDialog(booking)}
                            className="text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive px-2.5"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Reason Note if Cancelled */}
                  {booking.cancellationReason && (
                    <div className="px-5 py-2.5 bg-destructive/5 border-t border-destructive/20 text-xs flex items-start gap-2 text-destructive">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Cancellation Note: </span>
                        <span>{booking.cancellationReason}</span>
                        {booking.cancelledBy && (
                          <span className="text-[10px] opacity-80 ml-1.5 font-mono">
                            (by {booking.cancelledBy})
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Special Instructions if any */}
                  {booking.specialInstructions && !booking.cancellationReason && (
                    <div className="px-5 py-2 bg-muted/20 border-t text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <span className="font-medium text-foreground">Special Note:</span>
                      <span className="italic">"{booking.specialInstructions}"</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
                {bookingToCancel?.bookingReference}
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

export default BookingsPage;
