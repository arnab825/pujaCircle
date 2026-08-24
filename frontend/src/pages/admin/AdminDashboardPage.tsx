import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  Calendar,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Phone,
  UserPlus,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockDashboardStats, mockPriests } from '@/mocks/db';

/*
  PAGE: Platform Admin Dashboard (/admin/dashboard)
  
  ACCESS:
  - ADMIN role only (Private operations console)
  
  PURPOSE:
  - High-level platform health metrics, monthly bookings trend, quick priest review queue, and platform activity feed.
*/
const AdminDashboardPage: React.FC = () => {
  const adminStats = mockDashboardStats.admin;
  const pendingPriests = mockPriests.filter(
    (priest) => priest.approvalStatus === 'PENDING'
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
            Administration Console
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            System-wide overview, verification queue, and platform health metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/priests">
            <Button size="sm" variant="destructive" className="text-xs gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              Manage Priests ({adminStats.pendingPriestApprovals} Pending)
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. 4 Platform Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Devotees */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Devotees
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {adminStats.totalDevotees.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline" />
              <span className="text-emerald-600 font-medium">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        {/* Verified Vedic Priests */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Verified Priests
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {adminStats.verifiedPriests}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active scholars on roster
            </p>
          </CardContent>
        </Card>

        {/* Pending Priest Approvals */}
        <Card className="hover:shadow-md transition-shadow border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Pending Approvals
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-bold text-amber-900 dark:text-amber-200">
                {adminStats.pendingPriestApprovals}
              </div>
              <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-100/50 text-[10px]">
                Requires Action
              </Badge>
            </div>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
              Awaiting credential review
            </p>
          </CardContent>
        </Card>

        {/* Total Ritual Bookings */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Bookings
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {adminStats.totalBookings.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline" />
              <span className="text-emerald-600 font-medium">+18.5%</span> growth YTD
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Monthly Bookings Analytics Chart */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Monthly Ritual Bookings Trend
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Completed and confirmed ritual bookings count per month (Jan - Jun)
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs font-normal">
            2026 Analytics
          </Badge>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={adminStats.monthlyTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--accent) / 0.3)' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    color: 'hsl(var(--card-foreground))',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value ?? 0} Bookings`, 'Total']}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3. Pending Priest Applications Review Queue */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Pending Priest Applications Queue
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Review scholar credentials, background, and specializations for onboarding approval.
            </CardDescription>
          </div>

          <Link to="/admin/priests">
            <Button size="sm" variant="outline" className="text-xs gap-1">
              View All Priests
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {pendingPriests.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs">
              No pending priest applications awaiting review.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Scholar Name</TableHead>
                  <TableHead className="text-xs">City / State</TableHead>
                  <TableHead className="text-xs">Contact Phone</TableHead>
                  <TableHead className="text-xs">Specializations</TableHead>
                  <TableHead className="text-xs">Experience</TableHead>
                  <TableHead className="text-xs text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPriests.map((priest) => (
                  <TableRow key={priest.id} className="text-xs">
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-2.5">
                        {priest.profileImageUrl ? (
                          <img
                            src={priest.profileImageUrl}
                            alt={priest.fullName}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                            {priest.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div>{priest.fullName}</div>
                          <div className="text-[11px] font-normal text-muted-foreground">
                            {priest.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
                        {priest.city}, {priest.state}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 font-mono text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground/70" />
                        {priest.phoneNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {priest.specializations.slice(0, 2).map((spec, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {spec}
                          </Badge>
                        ))}
                        {priest.specializations.length > 2 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{priest.specializations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {priest.experienceYears} Years
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/admin/priests/${priest.id}`}>
                        <Button size="sm" variant="default" className="text-xs h-7 px-3 gap-1">
                          Review
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 4. Quick Management Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Manage Priests Roster</span>
              <UserCheck className="w-5 h-5 text-primary" />
            </CardTitle>
            <CardDescription className="text-xs">
              Approve pending purohits, audit active accounts, handle suspensions, and view details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/priests">
              <Button size="sm" className="w-full text-xs gap-1.5">
                Go to Priests Directory
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Registered Devotees Directory</span>
              <UserPlus className="w-5 h-5 text-primary" />
            </CardTitle>
            <CardDescription className="text-xs">
              View registered devotee accounts, contact details, booking history, and manage access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/users">
              <Button size="sm" variant="outline" className="w-full text-xs gap-1.5">
                Go to Devotees Directory
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

