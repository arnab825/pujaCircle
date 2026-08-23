import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '@/api/booking.api';
import { Booking } from '@/types/booking.types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Clock, MapPin } from 'lucide-react';

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bookingApi.getBookings()
      .then(setBookings)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Puja Bookings</h1>
        <p className="text-muted-foreground mt-1">Track upcoming and past ritual ceremonies.</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner label="Loading bookings..." />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card p-6">
          <p className="font-semibold text-lg">No bookings found</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">You haven't scheduled any pujas yet.</p>
          <Link to="/priests">
            <Button>Discover Priests</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <span className="text-xs font-mono text-muted-foreground">Ref: {booking.bookingReference}</span>
                  <CardTitle className="text-lg mt-0.5">{booking.ritual?.name || 'Vedic Ritual'}</CardTitle>
                </div>
                <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                  {booking.status}
                </Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{booking.bookingDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{booking.startTime} - {booking.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{booking.address?.locality || 'Address provided'}</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-3">
                <div className="text-xs">
                  <span className="text-muted-foreground">Offline Dakshina: </span>
                  <span className="font-bold text-foreground">{formatCurrency(booking.dakshinaAmount)}</span>
                </div>
                <Link to={`/user/bookings/${booking.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
