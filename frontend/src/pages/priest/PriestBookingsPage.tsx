import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Sparkles,
  User,
  Check,
  Copy,
  CheckCheck,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  mockBookings,
  mockUsers,
  mockRituals,
  mockAddresses,
  mockPriests,
} from '@/mocks/db';
import { Booking, BookingStatus } from '@/types/booking.types';
import { useAuthStore } from '@/store/auth.store';

/**
 * Helper to calculate remaining time out of the 5-hour decision window
 */
function get5HourRemainingTime(createdAtStr: string): {
  remainingMs: number;
  formattedText: string;
  isExpired: boolean;
  hours: number;
  minutes: number;
} {
  const WINDOW_MS = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
  const createdTime = new Date(createdAtStr).getTime();
  const expiresAt = createdTime + WINDOW_MS;
  const now = Date.now();
  const diff = expiresAt - now;

  if (diff <= 0) {
    return {
      remainingMs: 0,
      formattedText: 'Decision window expired',
      isExpired: true,
      hours: 0,
      minutes: 0,
    };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return {
    remainingMs: diff,
    formattedText: `${hours}h ${minutes}m left to respond`,
    isExpired: false,
    hours,
    minutes,
  };
}

/**
 * PAGE: Priest Bookings & Request Decision Ledger (/priest/bookings)
 * 
 * ACCESS:
 * - PRIEST role only
 * 
 * PURPOSE:
 * - Operational table ledger of all assigned ceremony appointments.
 * - Accept or decline pending booking requests within a 5-hour decision window.
 * - Distinct handling for REJECTED (priest declined) vs CANCELLED (devotee cancelled).
 * 
 * DATA SOURCE:
 * - Centralized mock data from @/mocks/db with reactive local state.
 */
const PriestBookingsPage: React.FC = () => {
  const { user } = useAuthStore();

  // 1. Resolve current logged-in priest (defaulting to demo priest-1)
  const currentPriest = useMemo(() => {
    return (
      mockPriests.find((p) => p.email === user?.email || p.id === 'priest-1') ||
      mockPriests[0]
    );
  }, [user]);

  // 2. Local state initialized from centralized mockBookings for this priest
  const [bookings, setBookings] = useState<Booking[]>(() => {
    return mockBookings.filter(
      (b) => b.priestId === currentPriest.id || !b.priestId || b.priestId === 'priest-1'
    );
  });

  // Current timestamp for live timer updates
  const [, setTimerTick] = useState<number>(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setTimerTick(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter and Search states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dialog & interaction states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Helper to join devotee, ritual, and address data for each booking
  const getBookingDetails = (booking: Booking) => {
    const devotee = mockUsers.find((u) => u.id === booking.userId);
    const ritual = mockRituals.find((r) => r.id === booking.ritualId);
    const address = mockAddresses.find((a) => a.id === booking.addressId);

    const fullAddress = address
      ? `${address.houseBuilding}, ${address.street}, ${address.locality}, ${address.city} - ${address.pincode}`
      : 'Address details on confirmation';

    return {
      devoteeName: devotee?.name || 'Devotee Family',
      devoteePhone: devotee?.phoneNumber || '+91 98765 43210',
      ritualName: ritual?.name || 'Vedic Ritual Ceremony',
      ritualCategory: ritual?.category || 'Puja & Havan',
      durationMinutes: ritual?.approximateDurationMinutes || 120,
      venueLocality: address ? `${address.locality}, ${address.city}` : 'Mumbai',
      fullAddress,
    };
  };

  // 3. Computed KPI metrics (Total, Pending, Upcoming, Completed)
  const kpiStats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'PENDING').length;
    const upcoming = bookings.filter((b) => b.status === 'CONFIRMED').length;
    const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;
    const rejected = bookings.filter((b) => b.status === 'REJECTED').length;

    return { total, pending, upcoming, completed, cancelled, rejected };
  }, [bookings]);

  // List of active pending requests
  const pendingRequests = useMemo(() => {
    return bookings.filter((b) => b.status === 'PENDING');
  }, [bookings]);

  // 4. Filtered bookings list based on tab and live search query
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Status tab filter
      if (statusFilter === 'PENDING' && booking.status !== 'PENDING') return false;
      if (statusFilter === 'CONFIRMED' && booking.status !== 'CONFIRMED') return false;
      if (statusFilter === 'COMPLETED' && booking.status !== 'COMPLETED') return false;
      if (statusFilter === 'CANCELLED' && booking.status !== 'CANCELLED') return false;
      if (statusFilter === 'REJECTED' && booking.status !== 'REJECTED') return false;

      // Live search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const details = getBookingDetails(booking);
        const matchesRef = booking.bookingReference.toLowerCase().includes(q);
        const matchesDevotee = details.devoteeName.toLowerCase().includes(q);
        const matchesRitual = details.ritualName.toLowerCase().includes(q);
        const matchesLocality = details.venueLocality.toLowerCase().includes(q);
        const matchesPhone = details.devoteePhone.includes(q);

        if (!matchesRef && !matchesDevotee && !matchesRitual && !matchesLocality && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, statusFilter, searchQuery]);

  // Actions: Accept Booking Request
  const handleAcceptRequest = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'CONFIRMED' as BookingStatus,
            }
          : b
      )
    );
    toast.success('Booking Request Accepted!', {
      description: 'The ceremony is now confirmed and scheduled in your upcoming roster.',
    });
  };

  // Actions: Decline / Reject Booking Request
  const handleDeclineRequest = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'REJECTED' as BookingStatus,
              cancelledBy: 'PRIEST',
              cancelledAt: new Date().toISOString(),
              cancellationReason: 'Declined by Purohit due to schedule conflict',
            }
          : b
      )
    );
    toast.error('Booking Request Declined', {
      description: 'The devotee has been notified that the request was declined.',
    });
  };

  // Actions: Mark Confirmed Ceremony as Completed
  const handleMarkCompleted = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'COMPLETED' as BookingStatus,
              paymentStatus: 'PAID_OFFLINE',
            }
          : b
      )
    );
    toast.success('Ceremony marked as COMPLETED!', {
      description: 'Dakshina payment status updated to Paid Offline.',
    });
  };

  // Actions: Copy Devotee Phone Number
  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    toast.info(`Copied phone: ${phone}`);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  // Helper formatting for Muhurat Dates
  const formatBookingDate = (dateStr: string) => {
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
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <div className="border-b pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant="outline"
            className="text-primary border-primary/30 text-[11px] font-medium bg-primary/5"
          >
            <Sparkles className="w-3 h-3 mr-1 text-primary" />
            Purohit Operational Console
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
          Ceremony Appointments
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Review incoming devotee requests, manage confirmed muhurats, and complete post-ritual settlements.
        </p>
      </div>

      {/* 2. Top Summary KPI Cards (4 Cards, No Dakshina Card) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Appointments */}
        <Card className="border shadow-xs hover:border-primary/40 transition-colors">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Ceremonies
              </p>
              <p className="text-2xl font-bold font-serif text-foreground mt-1">
                {kpiStats.total}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Calendar className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests (with amber alert highlight) */}
        <Card className="border shadow-xs hover:border-amber-500/40 transition-colors border-l-4 border-l-amber-500 bg-amber-500/5">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                Pending Requests
                {kpiStats.pending > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </p>
              <p className="text-2xl font-bold font-serif text-amber-700 dark:text-amber-400 mt-1">
                {kpiStats.pending}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming / Confirmed Pujas */}
        <Card className="border shadow-xs hover:border-primary/40 transition-colors border-l-4 border-l-primary">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wider">
                Upcoming / Confirmed
              </p>
              <p className="text-2xl font-bold font-serif text-primary mt-1">
                {kpiStats.upcoming}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Completed Pujas */}
        <Card className="border shadow-xs hover:border-emerald-500/40 transition-colors border-l-4 border-l-emerald-500">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Completed Pujas
              </p>
              <p className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
                {kpiStats.completed}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Dedicated Pending Booking Requests Section (5-Hour Response Window) */}
      {pendingRequests.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold font-serif text-foreground flex items-center gap-2">
                  Action Required: {pendingRequests.length} Pending Booking Request{pendingRequests.length > 1 ? 's' : ''}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Please accept or decline devotee requests within the 5-hour decision window.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-amber-700 dark:text-amber-300 border-amber-500/30 bg-amber-500/10 text-xs font-medium w-fit">
              5-Hour Decision Policy
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingRequests.map((request) => {
              const details = getBookingDetails(request);
              const timer = get5HourRemainingTime(request.createdAt);

              return (
                <div
                  key={request.id}
                  className="p-3.5 rounded-md border border-amber-500/25 bg-card space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                        {request.bookingReference}
                      </span>
                      <h3 className="font-bold font-serif text-sm text-foreground">
                        {details.ritualName}
                      </h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium ${
                        timer.isExpired
                          ? 'border-destructive/30 text-destructive bg-destructive/5'
                          : 'border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10'
                      }`}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {timer.formattedText}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-y py-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Yajamana:</span>
                      <span className="font-semibold text-foreground">{details.devoteeName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Muhurat:</span>
                      <span className="font-semibold text-foreground">
                        {formatBookingDate(request.bookingDate)} ({request.startTime})
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-muted-foreground block">Venue:</span>
                      <span className="text-foreground">{details.venueLocality}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                      onClick={() => handleDeclineRequest(request.id)}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      <CheckCheck className="w-3.5 h-3.5 mr-1" />
                      Accept Request
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Filter Tabs & Live Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border overflow-x-auto">
          {[
            { key: 'ALL', label: 'All', count: kpiStats.total },
            { key: 'PENDING', label: 'Pending Requests', count: kpiStats.pending },
            { key: 'CONFIRMED', label: 'Upcoming / Confirmed', count: kpiStats.upcoming },
            { key: 'COMPLETED', label: 'Completed', count: kpiStats.completed },
            { key: 'CANCELLED', label: 'Cancelled', count: kpiStats.cancelled },
            { key: 'REJECTED', label: 'Rejected', count: kpiStats.rejected },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === tab.key
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.key
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search devotee, ritual, ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 5. Pure Table-Only Bookings Roster */}
      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No appointments found</h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? `No ceremony matches your search "${searchQuery}".`
                : `No appointments found under the "${statusFilter.toLowerCase()}" tab.`}
            </p>
            {(searchQuery || statusFilter !== 'ALL') && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px] text-xs">Reference</TableHead>
                  <TableHead className="text-xs">Ritual Ceremony</TableHead>
                  <TableHead className="text-xs">Yajamana (Devotee)</TableHead>
                  <TableHead className="text-xs">Muhurat Date & Time</TableHead>
                  <TableHead className="text-xs">Venue</TableHead>
                  <TableHead className="text-xs">Dakshina</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const details = getBookingDetails(booking);
                  const isPending = booking.status === 'PENDING';
                  const isConfirmed = booking.status === 'CONFIRMED';
                  const isCompleted = booking.status === 'COMPLETED';
                  const isCancelled = booking.status === 'CANCELLED';
                  const isRejected = booking.status === 'REJECTED';

                  const timer = isPending ? get5HourRemainingTime(booking.createdAt) : null;

                  return (
                    <TableRow key={booking.id} className="text-xs hover:bg-muted/30">
                      {/* Reference ID */}
                      <TableCell className="font-mono font-semibold text-muted-foreground">
                        {booking.bookingReference}
                      </TableCell>

                      {/* Ritual Ceremony */}
                      <TableCell className="font-medium text-foreground">
                        <div>
                          <p className="font-bold font-serif text-sm">{details.ritualName}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {details.durationMinutes} mins • {details.ritualCategory}
                          </span>
                        </div>
                      </TableCell>

                      {/* Yajamana Devotee */}
                      <TableCell>
                        <p className="font-semibold text-foreground">{details.devoteeName}</p>
                        <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                          <a
                            href={`tel:${details.devoteePhone}`}
                            className="text-primary hover:underline text-[11px] font-mono flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {details.devoteePhone}
                          </a>
                          <button
                            onClick={() => handleCopyPhone(details.devoteePhone, booking.id)}
                            className="text-muted-foreground hover:text-foreground p-0.5"
                            title="Copy phone"
                          >
                            {copiedPhoneId === booking.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </TableCell>

                      {/* Muhurat Date & Time */}
                      <TableCell>
                        <p className="font-semibold text-foreground">
                          {formatBookingDate(booking.bookingDate)}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </TableCell>

                      {/* Venue Address */}
                      <TableCell>
                        <p className="font-medium text-foreground">{details.venueLocality}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-[170px]">
                          {details.fullAddress}
                        </p>
                      </TableCell>

                      {/* Dakshina */}
                      <TableCell>
                        <p className="font-bold font-serif text-foreground">
                          ₹{booking.dakshinaAmount}
                        </p>
                        <span
                          className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            booking.paymentStatus === 'PAID_OFFLINE'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {booking.paymentStatus === 'PAID_OFFLINE' ? 'Paid Offline' : 'Pending'}
                        </span>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        {isPending && (
                          <div className="space-y-1">
                            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-semibold">
                              <Clock className="w-2.5 h-2.5 mr-1" />
                              Pending
                            </Badge>
                            {timer && (
                              <p className="text-[9px] text-amber-600 font-medium whitespace-nowrap">
                                {timer.formattedText}
                              </p>
                            )}
                          </div>
                        )}
                        {isConfirmed && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
                            <CheckCheck className="w-2.5 h-2.5 mr-1" />
                            Confirmed
                          </Badge>
                        )}
                        {isCompleted && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-semibold">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {isCancelled && (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground border-muted-foreground/30 text-[10px] font-medium"
                          >
                            <Ban className="w-2.5 h-2.5 mr-1" />
                            Cancelled by User
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge
                            variant="destructive"
                            className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-medium"
                          >
                            <XCircle className="w-2.5 h-2.5 mr-1" />
                            Rejected by Priest
                          </Badge>
                        )}
                      </TableCell>

                      {/* Action Buttons */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs px-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={() => handleDeclineRequest(booking.id)}
                                title="Decline Request"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-primary text-primary-foreground font-medium px-2.5"
                                onClick={() => handleAcceptRequest(booking.id)}
                                title="Accept Request"
                              >
                                <CheckCheck className="w-3 h-3 mr-1" />
                                Accept
                              </Button>
                            </>
                          )}

                          {isConfirmed && (
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5"
                              onClick={() => handleMarkCompleted(booking.id)}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsDetailsOpen(true);
                            }}
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ================= 6. STREAMLINED CEREMONY DETAILS MODAL ================= */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        {selectedBooking && (
          <DialogContent className="max-w-md">
            {(() => {
              const details = getBookingDetails(selectedBooking);
              const isPending = selectedBooking.status === 'PENDING';
              const isConfirmed = selectedBooking.status === 'CONFIRMED';
              const timer = isPending ? get5HourRemainingTime(selectedBooking.createdAt) : null;

              return (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {selectedBooking.bookingReference}
                      </Badge>
                      <Badge
                        className={`text-[10px] ${
                          isPending
                            ? 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                            : isConfirmed
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : selectedBooking.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {selectedBooking.status}
                      </Badge>
                    </div>
                    <DialogTitle className="text-xl font-bold font-serif text-foreground">
                      {details.ritualName}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      {details.ritualCategory} • {details.durationMinutes} Minutes Duration
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3.5 py-2 text-xs">
                    {/* 5-Hour Timer Alert (if pending) */}
                    {isPending && timer && (
                      <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-between">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          5-Hour Response Window:
                        </span>
                        <span className="font-mono font-bold text-xs">{timer.formattedText}</span>
                      </div>
                    )}

                    {/* Auspicious Muhurat Window */}
                    <div className="p-3 rounded-md bg-muted/40 border space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>Auspicious Muhurat Window</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                        <div>
                          <p className="text-[10px]">Date:</p>
                          <p className="font-semibold text-foreground">
                            {formatBookingDate(selectedBooking.bookingDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px]">Time Slot:</p>
                          <p className="font-semibold text-foreground">
                            {selectedBooking.startTime} - {selectedBooking.endTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Yajamana Devotee Details */}
                    <div className="p-3 rounded-md border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <User className="w-3.5 h-3.5 text-primary" />
                          <span>Yajamana (Devotee)</span>
                        </div>
                        <a
                          href={`tel:${details.devoteePhone}`}
                          className="text-primary hover:underline font-mono text-[11px] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          Call
                        </a>
                      </div>
                      <div className="text-muted-foreground">
                        <p className="font-medium text-foreground text-sm">{details.devoteeName}</p>
                        <p className="font-mono text-xs">{details.devoteePhone}</p>
                      </div>
                    </div>

                    {/* Venue Address */}
                    <div className="p-3 rounded-md border space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>Ceremony Venue</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed pt-0.5">
                        {details.fullAddress}
                      </p>
                    </div>

                    {/* Dakshina Amount */}
                    <div className="p-3 rounded-md bg-muted/20 border flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Dakshina (Offline Cash)
                        </p>
                        <p className="text-base font-bold font-serif text-foreground">
                          ₹{selectedBooking.dakshinaAmount}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          selectedBooking.paymentStatus === 'PAID_OFFLINE'
                            ? 'text-emerald-600 border-emerald-500/30'
                            : 'text-amber-600 border-amber-500/30'
                        }
                      >
                        {selectedBooking.paymentStatus === 'PAID_OFFLINE'
                          ? 'Paid Offline'
                          : 'Pending Collection'}
                      </Badge>
                    </div>

                    {/* Cancellation / Rejection details if applicable */}
                    {(selectedBooking.status === 'CANCELLED' || selectedBooking.status === 'REJECTED') &&
                      selectedBooking.cancellationReason && (
                        <div className="p-2.5 rounded-md bg-destructive/5 border border-destructive/20 text-[11px] text-destructive">
                          <span className="font-semibold">
                            {selectedBooking.status === 'REJECTED' ? 'Reason for Rejection: ' : 'Cancellation Reason: '}
                          </span>
                          {selectedBooking.cancellationReason}
                        </div>
                      )}
                  </div>

                  <DialogFooter className="flex flex-row justify-between gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setIsDetailsOpen(false)}
                    >
                      Close
                    </Button>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              handleDeclineRequest(selectedBooking.id);
                              setIsDetailsOpen(false);
                            }}
                          >
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs bg-primary text-primary-foreground font-medium"
                            onClick={() => {
                              handleAcceptRequest(selectedBooking.id);
                              setIsDetailsOpen(false);
                            }}
                          >
                            Accept Request
                          </Button>
                        </>
                      )}

                      {isConfirmed && (
                        <Button
                          size="sm"
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          onClick={() => {
                            handleMarkCompleted(selectedBooking.id);
                            setIsDetailsOpen(false);
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  </DialogFooter>
                </>
              );
            })()}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default PriestBookingsPage;
