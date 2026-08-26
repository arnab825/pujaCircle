import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  mockGetBookings,
  mockAcceptBooking,
  mockRejectBooking,
  mockCompleteBooking,
} from '@/mocks/mock-api';
import { Booking } from '@/types/booking.types';
import { PriestBookingRow } from '@/components/priest/PriestBookingRow';
import { PriestBookingDetailsDialog } from '@/components/priest/PriestBookingDetailsDialog';
import { CancelBookingDialog } from '@/components/booking/CancelBookingDialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type TabFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'HISTORY';

export const PriestBookingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const priestId = user?.id === 'user-priest-1' ? 'priest-1' : user?.id || 'priest-1';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Dialog states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rejectBookingTarget, setRejectBookingTarget] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await mockGetBookings(undefined, priestId);
      if (res.success) {
        setBookings(res.data);
      }
    } catch {
      toast.error('Failed to load appointments.');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [priestId]);

  // Handlers
  const handleAccept = async (bookingId: string) => {
    setIsProcessing(true);
    try {
      const res = await mockAcceptBooking(bookingId, priestId);
      if (res.success) {
        toast.success('Puja request accepted and confirmed!');
        fetchBookings();
      } else {
        toast.error(res.message || 'Failed to accept booking.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineConfirm = async (reason: string) => {
    if (!rejectBookingTarget) return;
    const res = await mockRejectBooking(rejectBookingTarget.id, priestId, reason);
    if (res.success) {
      toast.success('Request declined.');
      fetchBookings();
    } else {
      toast.error(res.message || 'Failed to decline booking.');
    }
  };

  const handleComplete = async (bookingId: string) => {
    setIsProcessing(true);
    try {
      const res = await mockCompleteBooking(bookingId, priestId);
      if (res.success) {
        toast.success('Ceremony marked as COMPLETED! Offline Dakshina recorded.');
        fetchBookings();
      } else {
        toast.error(res.message || 'Failed to mark completion.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered List
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Tab filter
      if (activeTab === 'PENDING' && b.status !== 'PENDING') return false;
      if (activeTab === 'CONFIRMED' && b.status !== 'CONFIRMED') return false;
      if (activeTab === 'COMPLETED' && b.status !== 'COMPLETED') return false;
      if (activeTab === 'HISTORY' && !['CANCELLED', 'REJECTED', 'EXPIRED'].includes(b.status)) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const refMatch = (b.bookingReference || b.id).toLowerCase().includes(query);
        const nameMatch = (b.serviceName || '').toLowerCase().includes(query);
        const devoteeMatch = (b.user?.name || '').toLowerCase().includes(query);
        return refMatch || nameMatch || devoteeMatch;
      }
      return true;
    });
  }, [bookings, activeTab, searchQuery]);

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">Puja Appointments</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage incoming requests, schedules, and ritual completions.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBookings} className="gap-1.5 text-xs w-fit">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabFilter)}>
          <TabsList className="grid grid-cols-5 w-full max-w-lg h-9">
            <TabsTrigger value="ALL" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="PENDING" className="text-xs">Pending</TabsTrigger>
            <TabsTrigger value="CONFIRMED" className="text-xs">Confirmed</TabsTrigger>
            <TabsTrigger value="COMPLETED" className="text-xs">Done</TabsTrigger>
            <TabsTrigger value="HISTORY" className="text-xs">History</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ceremony name, devotee name, or reference ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Appointment List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-3">
          {filteredBookings.map((b) => (
            <PriestBookingRow
              key={b.id}
              booking={b}
              onViewDetails={(booking) => {
                setSelectedBooking(booking);
                setIsDetailsOpen(true);
              }}
              onAccept={handleAccept}
              onOpenReject={(booking) => setRejectBookingTarget(booking)}
              onComplete={handleComplete}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description={
            searchQuery ? 'No appointments match your search criteria.' : 'No appointments in this category.'
          }
        />
      )}

      {/* Modals */}
      <PriestBookingDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        booking={selectedBooking}
      />

      <CancelBookingDialog
        isOpen={!!rejectBookingTarget}
        onClose={() => setRejectBookingTarget(null)}
        onConfirm={handleDeclineConfirm}
        bookingReference={rejectBookingTarget?.bookingReference || rejectBookingTarget?.id}
        isPriest={true}
      />
    </div>
  );
};

export default PriestBookingsPage;
