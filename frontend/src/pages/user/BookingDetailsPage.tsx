import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingApi } from '@/api/booking.api';
import { Booking } from '@/types/booking.types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, Phone, User, AlertCircle } from 'lucide-react';

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      bookingApi.getBookingById(id)
        .then(setBooking)
        .catch(() => toast.error('Booking not found'))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleCancel = async () => {
    if (!booking) return;
    try {
      const updated = await bookingApi.cancelBooking({
        bookingId: booking.id,
        reason: 'Cancelled by devotee from dashboard',
      });
      setBooking(updated);
      toast.success('Booking cancelled successfully.');
    } catch {
      toast.error('Failed to cancel booking');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <LoadingSpinner label="Loading booking details..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-16 text-center">
        <p className="text-lg">Booking details not found.</p>
        <Link to="/user/bookings"><Button className="mt-4">Back to Bookings</Button></Link>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-muted-foreground">Booking Ref: {booking.bookingReference}</span>
          <h1 className="text-2xl font-bold mt-1">{booking.ritual?.name || 'Vedic Ritual'}</h1>
        </div>
        <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
          {booking.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Priest & Contact</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-semibold">{booking.priest?.fullName || 'Assigned Priest'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 text-primary" />
              <span>+91 {booking.priest?.phoneNumber || 'Contact available after confirmation'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Muhurat & Timing</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{booking.bookingDate}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>{booking.startTime} - {booking.endTime}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Ritual Location</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">{booking.address?.recipientName}</p>
              <p>{booking.address?.houseBuilding}, {booking.address?.street}</p>
              <p>{booking.address?.locality}, {booking.address?.city} - {booking.address?.pincode}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Dakshina & Payment Details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between font-semibold">
            <span>Suggested Dakshina Amount</span>
            <span>{formatCurrency(booking.dakshinaAmount)}</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-primary" />
            <span>Dakshina is offered offline directly to the purohit upon ritual completion. No online gateway is required.</span>
          </div>
        </CardContent>
        {booking.status !== 'CANCELLED' && (
          <CardFooter className="border-t pt-3 flex justify-end">
            <Button variant="destructive" size="sm" onClick={handleCancel}>
              Cancel Booking
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default BookingDetailsPage;
