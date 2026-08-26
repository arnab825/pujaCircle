import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import {
  mockGetBookings,
  mockGetPriestServices,
  mockGetPriestSlots,
  mockAcceptBooking,
  mockRejectBooking,
  mockCompleteBooking,
} from '@/mocks/mock-api';
import { Booking } from '@/types/booking.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Check,
  XCircle,
  IndianRupee,
} from 'lucide-react';
import { toast } from 'sonner';

export const PriestDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const priestId = user?.id === 'user-priest-1' ? 'priest-1' : user?.id || 'priest-1';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeServicesCount, setActiveServicesCount] = useState(0);
  const [availableSlotsCount, setAvailableSlotsCount] = useState(0);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [bookingToReject, setBookingToReject] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDashboardData = async () => {
    const [bookRes, srvRes, slotRes] = await Promise.all([
      mockGetBookings(undefined, priestId),
      mockGetPriestServices(priestId),
      mockGetPriestSlots(priestId),
    ]);

    if (bookRes.success) setBookings(bookRes.data);
    if (srvRes.success) setActiveServicesCount(srvRes.data.filter((s) => s.isActive).length);
    if (slotRes.success) setAvailableSlotsCount(slotRes.data.filter((s) => s.status === 'AVAILABLE').length);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [priestId]);

  const handleAccept = async (bookingId: string) => {
    setIsProcessing(true);
    try {
      const res = await mockAcceptBooking(bookingId, priestId);
      if (res.success) {
        toast.success(res.message);
        fetchDashboardData();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenReject = (booking: Booking) => {
    setBookingToReject(booking);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!bookingToReject) return;
    if (!rejectionReason.trim()) {
      toast.error('Please specify a reason for declining.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await mockRejectBooking(bookingToReject.id, priestId, rejectionReason.trim());
      if (res.success) {
        toast.success(res.message);
        setRejectModalOpen(false);
        fetchDashboardData();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async (bookingId: string) => {
    setIsProcessing(true);
    try {
      const res = await mockCompleteBooking(bookingId, priestId);
      if (res.success) {
        toast.success(res.message);
        fetchDashboardData();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Operational metrics
  const pendingRequests = bookings.filter((b) => b.status === 'PENDING');
  const upcomingConfirmed = bookings.filter((b) => b.status === 'CONFIRMED');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const totalDakshinaRecorded = completedBookings.reduce(
    (acc, b) => acc + (b.servicePrice || b.dakshinaAmount || 0),
    0
  );

  return (
    <div className="space-y-8 max-w-5xl">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary/30 text-[11px]">
              <Sparkles className="h-3 w-3 mr-1 text-primary" /> Purohit Operational Console
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
            {user?.name || 'Pandit Ji'}
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your daily appointment queue, confirm incoming booking requests, and log completed rituals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/priest/availability">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-9">
              <Clock className="h-3.5 w-3.5" /> Manage Slots ({availableSlotsCount})
            </Button>
          </Link>
          <Link to="/priest/services">
            <Button size="sm" className="text-xs gap-1.5 h-9">
              <IndianRupee className="h-3.5 w-3.5" /> Services ({activeServicesCount})
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Operational Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Pending Requests</span>
            <div className="text-2xl font-bold text-amber-600">{pendingRequests.length}</div>
            <p className="text-[10px] text-muted-foreground">Awaiting your response</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Upcoming Confirmed</span>
            <div className="text-2xl font-bold text-primary">{upcomingConfirmed.length}</div>
            <p className="text-[10px] text-muted-foreground">Scheduled in-home pujas</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Completed Ceremonies</span>
            <div className="text-2xl font-bold text-emerald-600">{completedBookings.length}</div>
            <p className="text-[10px] text-muted-foreground">Successfully concluded</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Recorded Cash Dakshina</span>
            <div className="text-2xl font-bold font-mono text-foreground">
              ₹{totalDakshinaRecorded.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-muted-foreground">Completed cash amount recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Pending Requests Queue (High Priority) */}
      {pendingRequests.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5 shadow-xs">
          <CardHeader className="pb-3 border-b border-amber-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-base font-serif font-bold text-amber-800">
                  Action Required: Pending Requests ({pendingRequests.length})
                </CardTitle>
              </div>
              <span className="text-xs text-amber-700 font-medium">5-Hour Response Window</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-amber-500/10">
            {pendingRequests.map((req) => (
              <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{req.serviceName}</span>
                    <Badge variant="outline" className="font-mono text-[10px] bg-background">
                      {req.bookingReference}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" /> {req.bookingDate} ({req.startTime} - {req.endTime})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {req.address?.city || 'City Location'}
                    </span>
                    <span>•</span>
                    <span>Dakshina: <strong className="font-mono text-foreground">₹{req.servicePrice}</strong> (Direct Cash)</span>
                  </div>
                  {req.userNotes && (
                    <p className="text-[11px] text-muted-foreground italic bg-background/60 p-1.5 rounded border">
                      Devotee Note: "{req.userNotes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isProcessing}
                    onClick={() => handleOpenReject(req)}
                    className="text-xs h-8 text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
                  </Button>
                  <Button
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleAccept(req.id)}
                    className="text-xs h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Check className="h-3.5 w-3.5" /> Accept Appointment
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 4. Upcoming Confirmed Appointments */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-serif">Upcoming Confirmed Ceremonies</CardTitle>
            <CardDescription className="text-xs">Appointments accepted and scheduled on your calendar.</CardDescription>
          </div>
          <Link to="/priest/bookings" className="text-xs text-primary hover:underline font-medium">
            View All →
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {upcomingConfirmed.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p>No upcoming confirmed ceremonies right now.</p>
              <p className="text-[11px]">Make sure your availability slots are open for devotees to book.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {upcomingConfirmed.map((b) => (
                <div key={b.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground">{b.serviceName}</h3>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {b.bookingDate} ({b.startTime} - {b.endTime})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {b.address?.houseNo || b.address?.houseBuilding}, {b.address?.villageTown || b.address?.locality}, {b.address?.city}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Locked Dakshina: <strong className="font-mono text-foreground">₹{b.servicePrice}</strong> (Offline Cash)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <Button
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleComplete(b.id)}
                      className="text-xs h-8 gap-1.5 bg-primary"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decline Booking Dialog */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-destructive">Decline Booking Request</DialogTitle>
            <DialogDescription className="text-xs">
              Decline booking ref <strong>{bookingToReject?.bookingReference}</strong>. The devotee will be notified and your slot will be freed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 pt-2 text-xs">
            <label className="text-xs font-semibold">Reason for Declining (Required)</label>
            <Textarea
              placeholder="e.g. Prior travel commitment or temple schedule conflict."
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isProcessing || !rejectionReason.trim()}
              onClick={handleConfirmReject}
              className="text-xs"
            >
              {isProcessing ? 'Declining...' : 'Confirm Decline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriestDashboardPage;
