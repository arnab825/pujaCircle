import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockAdminGetDashboardStats, mockAdminGetPriests } from '@/mocks/mock-api';
import { Priest } from '@/types/priest.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Users,
  UserCheck,
  Clock,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [pendingPriests, setPendingPriests] = useState<Priest[]>([]);

  useEffect(() => {
    async function loadData() {
      const [statsData, priestsRes] = await Promise.all([
        mockAdminGetDashboardStats(),
        mockAdminGetPriests(),
      ]);
      setStats(statsData);
      if (priestsRes.success) {
        setPendingPriests(priestsRes.data.filter((p) => p.approvalStatus === 'PENDING'));
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-10 max-w-5xl">
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

        <Link to="/admin/priests" className="w-full sm:w-auto">
          <Button size="sm" className="text-xs gap-1.5 shadow-sm w-full sm:w-auto h-9 font-medium justify-center">
            <Clock className="w-3.5 h-3.5" />
            Manage Priests ({stats?.pendingPriests ?? 0} Pending)
          </Button>
        </Link>
      </div>

      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Devotees
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.totalUsers ?? 0}</div>
            <p className="text-[11px] text-emerald-600 mt-0.5">{stats?.activeUsers ?? 0} Active Devotees</p>
          </CardContent>
        </Card>

        {/* Total Priests */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Purohits
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UserCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.totalPriests ?? 0}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats?.approvedPriests ?? 0} Approved / {stats?.pendingPriests ?? 0} Pending
            </p>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Bookings
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.totalBookings ?? 0}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats?.confirmedBookings ?? 0} Confirmed • {stats?.completedBookings ?? 0} Completed
            </p>
          </CardContent>
        </Card>

        {/* Recorded Cash Dakshina */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cash Dakshina Recorded
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              ₹{(stats?.completedDakshinaAmountRecorded ?? 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Completed direct offline cash</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Pending Priest Approval Queue (Most Important Admin Action) */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-1">
            <CardTitle className="text-base font-serif">Purohit Verification Queue</CardTitle>
            <CardDescription className="text-xs">
              Review and approve newly registered Vedic priests before they appear in public search.
            </CardDescription>
          </div>
          <Link to="/admin/priests" className="text-xs text-primary hover:underline font-medium shrink-0">
            View All Purohits →
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {pendingPriests.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
              <ShieldCheck className="h-8 w-8 mx-auto text-emerald-600/60 mb-2" />
              <p className="font-semibold text-foreground">All Priest Applications Reviewed</p>
              <p className="text-[11px]">No pending Purohit onboarding applications at this time.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {pendingPriests.map((p) => (
                <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30">
                  <div className="flex items-start gap-3">
                    <img
                      src={p.profileImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
                      alt={p.fullName}
                      className="h-12 w-12 rounded-xl object-cover border shrink-0 bg-muted"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-bold text-sm text-foreground">{p.fullName}</h2>
                        <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-500/10 border-amber-500/30">
                          PENDING
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.experienceYears} Yrs Exp • {p.city}, {p.state} • {p.languages?.join(', ')}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{p.bio}</p>
                    </div>
                  </div>

                  <Link to={`/admin/priests/${p.id}`} className="w-full sm:w-auto">
                    <Button size="sm" className="text-xs gap-1.5 h-9 w-full sm:w-auto justify-center font-medium">
                      <span>Review Credentials</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
