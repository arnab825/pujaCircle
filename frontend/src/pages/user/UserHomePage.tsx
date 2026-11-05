import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { bookingApi } from '@/api/booking.api';
import { catalogApi } from '@/api/catalog.api';
import { Booking } from '@/types/booking.types';
import { PujaCatalogEntry } from '@/types/catalog.types';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { formatINR, formatDate, getInitials } from '@/lib/utils';
import { logAppError } from '@/lib/errorHandler';
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  Users,
  MapPin,
  ShieldCheck,
  FileText,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const UserHomePage: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableCeremonies, setAvailableCeremonies] = useState<PujaCatalogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        setIsLoading(true);
        const [bookList, catList] = await Promise.all([
          bookingApi.getBookings(user.id),
          catalogApi.getCatalog({ withPriestsOnly: true }),
        ]);
        setBookings(bookList || []);
        // Strictly only show ceremonies that actually have verified priests available
        setAvailableCeremonies(
          (catList || []).filter(
            (c) => Boolean(c.name) && (c.priestCount === undefined || c.priestCount > 0)
          )
        );
      } catch (err) {
        logAppError('UserHomePage.loadData', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Find most relevant upcoming booking (PENDING or CONFIRMED)
  const upcomingBooking = bookings.find((b) => b.status === 'CONFIRMED' || b.status === 'PENDING');

  const devoteeGreeting = user?.name ? user.name.split(' ')[0] : 'Devotee';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* 1. Unified Sacred Welcome Hero */}
      <div className="rounded-2xl bg-linear-to-r from-[#780016] via-[#630012] to-[#4A000D] text-white p-6 sm:p-8 border-2 border-amber-400/60 shadow-lg relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 text-xs font-bold backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>॥ शुभं करोति कल्याणम् ॥ • Devotee Sanctuary</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-serif text-white tracking-tight leading-tight">
              Namaste, {devoteeGreeting} 🙏
            </h1>

            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-medium">
              Schedule authentic home ceremonies with verified Gurukul-trained Purohits across West Bengal. Transparent cash dakshina after puja completion.
            </p>

            {/* Platform Guarantees Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-amber-200/90 font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Gurukul Lineage Verified
              </span>
              <span className="text-amber-400/40">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Direct Cash on Completion
              </span>
              <span className="text-amber-400/40">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Complete Samagri Guidance
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full sm:w-auto z-10">
            <Link to="/priests" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs sm:text-sm h-11 px-6 rounded-md shadow-md gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Users className="h-4 w-4 text-stone-950" />
                <span>Browse All Priests</span>
                <ArrowRight className="h-4 w-4 text-stone-950" />
              </Button>
            </Link>

            <Link to="/user/bookings" className="w-full sm:w-auto text-center">
              <span className="text-xs font-bold text-amber-200 hover:text-white underline underline-offset-4 cursor-pointer inline-flex items-center gap-1">
                <span>View Booking History ({bookings.length})</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Upcoming Ceremony Appointment Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-700" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
              Upcoming Ceremony Appointment
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full bg-white border-2 border-amber-200 rounded-xl p-8 text-center text-xs text-stone-500 font-medium">
            Loading your ceremony schedule...
          </div>
        ) : upcomingBooking ? (
          /* Rich Sacred Appointment Card */
          <div className="w-full bg-white border-2 border-amber-300 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            {/* Header: Maroon Accent Bar */}
            <div className="bg-[#780016] text-white px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center font-serif font-black text-lg shrink-0 shadow-xs">
                  ॐ
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
                    {upcomingBooking.serviceName || 'Sacred Puja Ceremony'}
                  </h3>
                  <span className="text-[11px] font-mono text-amber-200/90 font-medium">
                    Booking Reference: {upcomingBooking.bookingReference || upcomingBooking.id.slice(0, 8)}
                  </span>
                </div>
              </div>
              <div className="shrink-0">
                <BookingStatusBadge status={upcomingBooking.status} cancelledBy={upcomingBooking.cancelledBy} />
              </div>
            </div>

            {/* Card Body: 3 Structured Columns */}
            <div className="p-5 sm:p-6 space-y-5 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Date & Time */}
                <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-stone-700 font-bold text-xs uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-red-700" />
                    <span>Auspicious Muhurat</span>
                  </div>
                  <p className="font-serif font-bold text-stone-950 text-base">
                    {formatDate(upcomingBooking.bookingDate)}
                  </p>
                  <p className="text-xs text-stone-700 font-semibold">
                    {upcomingBooking.startTime} – {upcomingBooking.endTime}
                  </p>
                </div>

                {/* 2. Appointed Purohit */}
                <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-stone-700 font-bold text-xs uppercase tracking-wider">
                    <Users className="w-4 h-4 text-amber-700" />
                    <span>Appointed Purohit</span>
                  </div>
                  <div className="flex items-center gap-2.5 pt-0.5">
                    {(() => {
                      const priestImg =
                        upcomingBooking.priest?.profileImageUrl ||
                        (upcomingBooking.priest as any)?.avatarUrl ||
                        (upcomingBooking as any).priestAvatar ||
                        (upcomingBooking as any).priestProfile?.profileImageUrl;
                      const priestName =
                        upcomingBooking.priest?.displayName ||
                        upcomingBooking.priest?.fullName ||
                        'Assigned Gurukul Acharya';
                      return (
                        <div className="relative h-8 w-8 rounded-full bg-[#780016] text-amber-200 flex items-center justify-center font-serif font-bold text-xs ring-2 ring-amber-400 shrink-0 overflow-hidden">
                          {priestImg ? (
                            <img
                              src={priestImg}
                              alt={priestName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`h-full w-full items-center justify-center ${
                              priestImg ? 'hidden' : 'flex'
                            }`}
                          >
                            {getInitials(priestName || 'P')}
                          </div>
                        </div>
                      );
                    })()}
                    <div>
                      <p className="font-serif font-bold text-stone-950 text-sm">
                        {upcomingBooking.priest?.displayName || upcomingBooking.priest?.fullName || 'Assigned Gurukul Acharya'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-800 font-semibold">
                        <ShieldCheck className="w-3 h-3 text-red-700" /> Lineage Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Dakshina Summary */}
                <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-stone-700 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Dakshina (Cash on Completion)</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-serif text-red-800">
                      {formatINR(upcomingBooking.servicePrice || upcomingBooking.dakshinaAmount || 2500)}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-medium">
                    100% direct cash. No advance online payment.
                  </p>
                </div>
              </div>

              {/* Devotee Special Instructions & Gotra if provided */}
              {(upcomingBooking.specialInstructions || upcomingBooking.notes || upcomingBooking.userNotes) && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-xs flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-950">Your Special Instructions / Gotra:</span>
                    <p className="text-stone-800 font-medium leading-relaxed">
                      "{upcomingBooking.specialInstructions || upcomingBooking.notes || upcomingBooking.userNotes}"
                    </p>
                  </div>
                </div>
              )}

              {/* Venue Address & Action Button Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-amber-200">
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <MapPin className="w-4 h-4 text-red-700 shrink-0" />
                  <span className="font-medium">
                    Venue:{' '}
                    {upcomingBooking.address
                      ? `${upcomingBooking.address.houseNo ? `${upcomingBooking.address.houseNo}, ` : ''}${upcomingBooking.address.villageTown ? `${upcomingBooking.address.villageTown}, ` : ''}${upcomingBooking.address.city}, ${upcomingBooking.address.state} - ${upcomingBooking.address.pincode}`
                      : 'Devotee Registered Residence'}
                  </span>
                </div>

                <Link to={`/user/bookings/${upcomingBooking.id}`} className="w-full sm:w-auto shrink-0">
                  <Button className="bg-[#780016] hover:bg-[#5C0011] text-white font-bold text-xs h-10 px-6 rounded-md shadow-xs gap-2 w-full sm:w-auto cursor-pointer transition-transform active:scale-95">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Sacred Details & Samagri</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Spiritual Empty State */
          <div className="w-full bg-white border-2 border-amber-200 rounded-xl p-8 sm:p-10 text-center space-y-4 shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-red-700 border-2 border-amber-300">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                No Active Ceremony Appointments
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                You do not have any upcoming pujas scheduled. Book an accredited Gurukul Acharya for your next auspicious home ceremony.
              </p>
            </div>
            <Link to="/priests" className="inline-block pt-1">
              <Button className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs h-10 px-6 rounded-md shadow-xs gap-2 cursor-pointer">
                <Users className="w-4 h-4" />
                <span>Explore Verified Priests</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 3. Genuine Available Ceremonies from Database (Zero ceremonies with 0 priests) */}
      {availableCeremonies.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                Available Ceremonies with Verified Purohits ({availableCeremonies.length})
              </h2>
            </div>
            <Link
              to="/priests"
              className="text-xs font-bold text-red-700 hover:text-red-900 hover:underline inline-flex items-center gap-1"
            >
              <span>Browse All Priests</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCeremonies.map((ceremony) => (
              <div
                key={ceremony.id}
                className="p-5 rounded-xl border-2 border-amber-200 hover:border-amber-400 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-sm border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span className="capitalize">{ceremony.category ? ceremony.category.replace('-', ' ') : 'Vedic Vidhi'}</span>
                    </div>
                    {ceremony.priestCount !== undefined && ceremony.priestCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-300">
                        <Users className="w-3 h-3 text-emerald-600" />
                        <span>{ceremony.priestCount} {ceremony.priestCount === 1 ? 'Purohit' : 'Purohits'} Available</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-stone-900 text-sm group-hover:text-red-700 transition-colors">
                    {ceremony.name}
                  </h3>
                  {ceremony.description && (
                    <p className="text-[11px] text-stone-600 leading-relaxed line-clamp-2">
                      {ceremony.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    {ceremony.startingPrice ? (
                      <>
                        <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Starting Dakshina</span>
                        <span className="text-sm font-bold font-serif text-red-800">{formatINR(ceremony.startingPrice)}</span>
                      </>
                    ) : (
                      <span className="text-[11px] text-stone-500 font-medium">
                        Gurukul Vidhi & Samagri
                      </span>
                    )}
                  </div>
                  <Link to={`/priests?searchQuery=${encodeURIComponent(ceremony.name)}&catalogId=${ceremony.id}`}>
                    <Button size="sm" variant="outline" className="text-xs h-8 px-3 border-amber-300 font-bold hover:bg-amber-50 cursor-pointer text-stone-900">
                      Find Priests
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHomePage;
