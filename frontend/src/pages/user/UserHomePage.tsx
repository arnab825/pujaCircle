import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { mockGetAddresses, mockGetBookings } from '@/mocks/mock-api';
import { Address } from '@/types/address.types';
import { Booking } from '@/types/booking.types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import {
  Sparkles,
  Search,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export const UserHomePage: React.FC = () => {
  const { user } = useAuthStore();
  const [primaryAddress, setPrimaryAddress] = useState<Address | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [addrRes, bookRes] = await Promise.all([
          mockGetAddresses(user.id),
          mockGetBookings(user.id),
        ]);
        if (addrRes.success && addrRes.data.length > 0) {
          const defaultAddr = addrRes.data.find((a) => a.isDefault) || addrRes.data[0];
          setPrimaryAddress(defaultAddr);
        }
        if (bookRes.success) {
          setBookings(bookRes.data);
        }
      } catch (err) {
        console.error('Failed to load user home data', err);
      }
    }
    loadData();
  }, [user]);

  const upcomingBooking = bookings.find((b) => b.status === 'CONFIRMED' || b.status === 'PENDING');

  return (
    <div className="container py-8 space-y-8 max-w-5xl">
      {/* 1. Welcome Header Banner */}
      <div className="rounded-lg bg-card p-6 sm:p-8 border border-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>PujaCircle Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
            Namaste, {user?.name || 'User'} 🙏
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Browse verified priests, schedule home pujas, and pay easily in cash after completion.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Link to="/user/priests">
            <Button className="gap-2 text-sm shadow-xs h-11 px-5">
              <Search className="h-4 w-4" />
              <span>Find Priests</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Quick Status & Address Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Address Status Card */}
        <Card className="border-border/80 md:col-span-2 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Primary Puja Location</span>
              </div>
              <Link to="/user/addresses" className="text-xs text-primary hover:underline font-medium">
                {primaryAddress ? 'Change Address' : 'Add Address'}
              </Link>
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            {primaryAddress ? (
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  {primaryAddress.houseNo || primaryAddress.houseBuilding}, {primaryAddress.villageTown || primaryAddress.locality}
                </p>
                <p className="text-xs text-muted-foreground">
                  {primaryAddress.city}, {primaryAddress.district}, {primaryAddress.state} -{' '}
                  <strong className="font-mono text-foreground">{primaryAddress.pincode}</strong>
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs">
                <span>Please save your home PIN code & address to enable location-based priest discovery.</span>
                <Link to="/user/addresses">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-amber-500/30">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Guarantee */}
        <Card className="border-border/80 shadow-xs flex flex-col justify-center p-5 bg-card">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                100% Verified Priests
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                All listed priests undergo background and qualification verification by our administration.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Upcoming Booking or Quick Action */}
      {upcomingBooking ? (
        <Card className="border-primary/30 shadow-sm bg-card">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-serif font-bold">
                  Upcoming Ceremony Appointment
                </CardTitle>
              </div>
              <BookingStatusBadge status={upcomingBooking.status} />
            </div>
            <CardDescription className="text-xs">
              Booking Ref: <span className="font-mono font-semibold text-foreground">{upcomingBooking.bookingReference}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <p className="font-bold text-base text-foreground font-serif">
                {upcomingBooking.serviceName}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {upcomingBooking.bookingDate} ({upcomingBooking.startTime} - {upcomingBooking.endTime})
                </span>
                <span>
                  Priest: <strong>{upcomingBooking.priest?.displayName || 'Priest'}</strong>
                </span>
                <span>
                  Price: <strong>₹{upcomingBooking.servicePrice || upcomingBooking.dakshinaAmount}</strong> (Pay after puja)
                </span>
              </div>
            </div>

            <Link to={`/user/bookings/${upcomingBooking.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <span>View Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/80 shadow-xs text-center py-10 px-4">
          <div className="max-w-md mx-auto space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold font-serif text-foreground">No Upcoming Appointments</h2>
              <p className="text-xs text-muted-foreground">
                Ready to organize a ritual for your family? Browse certified Purohits in your city.
              </p>
            </div>
            <Link to="/user/priests">
              <Button size="sm" className="gap-2 text-xs">
                <Search className="h-3.5 w-3.5" /> Find Available Purohits
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 4. Popular Ceremony Quick Links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-serif text-foreground">Popular Vedic Ceremonies</h2>
          <Link to="/user/priests" className="text-xs text-primary hover:underline font-medium">
            View all Purohits →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              name: 'Griha Pravesh & Vastu',
              desc: 'Auspicious house-warming ritual for positive energy and family harmony.',
              search: 'Griha Pravesh',
            },
            {
              name: 'Satyanarayan Katha',
              desc: 'Traditional thanksgiving puja performed on Purnima or family milestones.',
              search: 'Satyanarayan',
            },
            {
              name: 'Maha Rudrabhishek',
              desc: 'Sacred chanting and holy offering to Lord Shiva for health and prosperity.',
              search: 'Rudrabhishek',
            },
          ].map((item) => (
            <Card key={item.name} className="border-border/80 hover:border-primary/40 transition-colors shadow-xs">
              <CardContent className="p-5 space-y-2">
                <h3 className="font-bold text-sm font-serif text-foreground">{item.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.desc}</p>
                <Link to={`/user/priests?searchQuery=${encodeURIComponent(item.search)}`} className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline pt-1">
                  <span>Find Priests</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserHomePage;
