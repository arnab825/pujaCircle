import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  User,
  ArrowRight,
  SlidersHorizontal,
  CalendarDays,
  IndianRupee,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  mockDashboardStats,
  mockBookings,
  mockRituals,
  mockUsers,
  mockAddresses,
  mockPriests,
} from '@/mocks/db';
import { useAuthStore } from '@/store/auth.store';

/**
 * PAGE: Priest Dashboard (/priest/dashboard)
 * 
 * ACCESS:
 * - PRIEST role only (Inside PriestLayout with Purohit sidebar)
 * 
 * PURPOSE:
 * - Vedic Purohit operational overview: daily schedule, upcoming ceremonies,
 *   weekly ritual distribution chart, and quick workspace shortcuts.
 * 
 * DATA SOURCE:
 * - Centralized mock data from @/mocks/db (mockDashboardStats, mockBookings, mockRituals, mockUsers)
 */
const PriestDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const priestStats = mockDashboardStats.priest;

  // Resolve current priest or default to primary demo priest
  const currentPriest =
    mockPriests.find((p) => p.email === user?.email || p.id === 'priest-1') ||
    mockPriests[0];

  // Resolve upcoming bookings with devotee, ritual, and address details
  const upcomingCeremonies = mockBookings
    .slice(0, 3)
    .map((booking) => {
      const devotee = mockUsers.find((u) => u.id === booking.userId);
      const ritual = mockRituals.find((r) => r.id === booking.ritualId);
      const address = mockAddresses.find((a) => a.id === booking.addressId);

      return {
        ...booking,
        devoteeName: devotee?.name || 'Devotee Family',
        devoteePhone: devotee?.phoneNumber || '+91 98765 43210',
        ritualName: ritual?.name || 'Vedic Ceremony',
        duration: ritual?.approximateDurationMinutes || 120,
        locality: address ? `${address.locality}, ${address.city}` : 'Mumbai',
      };
    });

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header & Welcome Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-primary border-primary/30 text-[11px] font-medium">
              <Sparkles className="w-3 h-3 mr-1 text-primary" />
              Purohit Operational Console
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
            {currentPriest.displayName || currentPriest.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Namaste Pandit Ji. Here is your daily schedule and upcoming ritual appointments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/priest/availability">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 border-primary/30 hover:bg-primary/5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              Manage Slots
            </Button>
          </Link>
          <Link to="/priest/bookings">
            <Button size="sm" className="text-xs gap-1.5 bg-primary hover:bg-brand-saffron-dark text-primary-foreground shadow-sm">
              <CalendarDays className="w-3.5 h-3.5" />
              View All Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Bookings */}
        <Card className="hover:shadow-md transition-shadow border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today's Bookings
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {priestStats.todayBookings}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="font-medium text-primary">Muhurats</span> scheduled for today
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card className="hover:shadow-md transition-shadow border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming Bookings
            </CardTitle>
            <div className="p-2 rounded-lg bg-brand-maroon/10 text-brand-maroon dark:text-brand-maroon-light">
              <CalendarDays className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {priestStats.upcomingBookings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Confirmed upcoming ceremonies
            </p>
          </CardContent>
        </Card>

        {/* Completed Pujas */}
        <Card className="hover:shadow-md transition-shadow border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Completed Pujas
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {priestStats.completedPujas}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium font-sans">100%</span> Vedic completion rate
            </p>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card className="hover:shadow-md transition-shadow border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Requests
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {priestStats.pendingRequests}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Devotee inquiries requiring review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Middle Section: Weekly Schedule Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Ritual Schedule Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-serif">
                  Weekly Ritual Schedule
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Distribution of booked pujas across Monday – Sunday
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                This Week
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priestStats.weeklyChart}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'hsl(var(--foreground))',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    formatter={(val: number | string | readonly (number | string)[] | undefined) => [`${val ?? 0} Ceremonies`, 'Bookings']}
                  />
                  <Bar
                    dataKey="count"
                    fill="#F45E16"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scholar Quick Status & Navigation */}
        <div className="space-y-4">
          {/* Purohit Verified Profile Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-serif flex items-center justify-between">
                <span>Purohit Status</span>
                <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[11px] gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Your public profile details seen by devotees.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-semibold text-foreground">{currentPriest.experienceYears} Years</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Rating</span>
                <span className="font-semibold text-foreground">⭐ {currentPriest.rating} ({currentPriest.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Base City</span>
                <span className="font-semibold text-foreground">{currentPriest.city}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-muted-foreground">Suggested Dakshina</span>
                <span className="font-semibold text-primary">₹{(currentPriest.dakshinaSuggested || 3100).toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2">
                <Link to="/priest/profile">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Edit Purohit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Upcoming Ceremonies Agenda List */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg font-serif">
              Upcoming Ceremonies
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Next scheduled rituals requiring your presence and Vedic samagri preparation
            </CardDescription>
          </div>
          <Link to="/priest/bookings">
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary hover:text-primary">
              View All <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingCeremonies.map((ceremony) => (
              <div
                key={ceremony.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-card hover:border-primary/40 transition-colors gap-4"
              >
                {/* Left: Ceremony & Devotee Info */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary mt-0.5 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-foreground">
                        {ceremony.ritualName}
                      </h4>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {ceremony.bookingReference}
                      </Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[10px] border-emerald-500/20">
                        {ceremony.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        {ceremony.devoteeName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        {ceremony.devoteePhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        {ceremony.locality}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Muhurat Timing & Dakshina */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                  <div className="text-left md:text-right">
                    <div className="flex items-center md:justify-end gap-1 text-xs font-semibold text-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {ceremony.bookingDate} ({ceremony.startTime} - {ceremony.endTime})
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Approx. {ceremony.duration} mins duration
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end text-sm font-bold text-foreground">
                      <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-primary" />
                      {ceremony.dakshinaAmount.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">
                      Offline Cash
                    </p>
                  </div>

                  <Link to="/priest/bookings">
                    <Button size="sm" variant="outline" className="text-xs shrink-0">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriestDashboardPage;
