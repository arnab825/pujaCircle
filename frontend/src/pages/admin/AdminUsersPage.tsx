import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
  Ban,
  ShieldCheck,
  Trash2,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { mockUsers } from '@/mocks/db';
import { AuthUser } from '@/types/auth.types';

// Devotee record shape with optional metadata
export type DevoteeRecord = AuthUser & {
  status?: 'ACTIVE' | 'BANNED' | 'SUSPENDED';
  accountStatus?: 'ACTIVE' | 'BANNED';
  banReason?: string;
  primaryCity?: string;
  bookingCount?: number;
  createdAt?: string;
  statusReason?: string;
};

/*
  PAGE: Registered Devotees Directory (/admin/users)
  
  ACCESS:
  - ADMIN role only
  
  PURPOSE:
  - Administrator directory of all customer/devotee accounts registered on PujaCircle.
  - Review devotee details, contact verification, booking history count, and suspend/reactivate accounts.
*/
const AdminUsersPage: React.FC = () => {
  // Source devotee users (role === 'USER')
  const initialDevotees: DevoteeRecord[] = mockUsers
    .filter((u) => u.role === 'USER')
    .map((u) => ({
      ...u,
      status: (u.accountStatus === 'BANNED' || u.status === 'BANNED') ? 'BANNED' : 'ACTIVE',
      primaryCity: u.primaryCity || 'Mumbai',
      bookingCount: u.bookingCount ?? 1,
      createdAt: u.createdAt || '2026-01-15T00:00:00.000Z',
    }));

  const [devoteesList, setDevoteesList] = useState<DevoteeRecord[]>(initialDevotees);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dialog state
  const [selectedDevotee, setSelectedDevotee] = useState<DevoteeRecord | null>(null);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  // Metric counts
  const totalDevotees = devoteesList.length;
  const activeDevotees = devoteesList.filter((d) => d.status === 'ACTIVE').length;
  const suspendedDevotees = devoteesList.filter((d) => d.status === 'SUSPENDED').length;

  // Filtered devotees list
  const filteredDevotees = devoteesList.filter((devotee) => {
    // Tab filter
    if (activeTab === 'ACTIVE' && devotee.status !== 'ACTIVE') return false;
    if (activeTab === 'SUSPENDED' && devotee.status !== 'SUSPENDED') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = devotee.name.toLowerCase().includes(q);
      const matchEmail = (devotee.email || '').toLowerCase().includes(q);
      const matchPhone = (devotee.phoneNumber || '').includes(q);
      const matchCity = (devotee.primaryCity || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchCity;
    }

    return true;
  });

  // Handle Suspend Dialog Open
  const openSuspendDialog = (devotee: DevoteeRecord) => {
    setSelectedDevotee(devotee);
    setSuspendReason('');
    setIsSuspendDialogOpen(true);
  };

  // Confirm Suspend Action
  const handleConfirmSuspend = () => {
    if (!selectedDevotee) return;
    if (!suspendReason.trim()) {
      toast.error('Please enter an administrative reason for suspending this account.');
      return;
    }

    setDevoteesList((prev) =>
      prev.map((d) =>
        d.id === selectedDevotee.id
          ? { ...d, status: 'SUSPENDED', statusReason: suspendReason.trim() }
          : d
      )
    );

    toast.error(`Account suspended for ${selectedDevotee.name}`);
    setIsSuspendDialogOpen(false);
    setSelectedDevotee(null);
  };

  // Handle Reactivate Action
  const handleReactivate = (id: string, name: string) => {
    setDevoteesList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'ACTIVE', statusReason: undefined } : d))
    );
    toast.success(`Account reactivated for ${name}`);
  };

  // Open Delete Dialog
  const openDeleteDialog = (devotee: DevoteeRecord) => {
    setSelectedDevotee(devotee);
    setIsDeleteDialogOpen(true);
  };

  // Confirm Delete Action
  const handleConfirmDelete = () => {
    if (!selectedDevotee) return;
    setDevoteesList((prev) => prev.filter((d) => d.id !== selectedDevotee.id));
    toast.success(`Devotee record (${selectedDevotee.name}) removed.`);
    setIsDeleteDialogOpen(false);
    setSelectedDevotee(null);
  };

  // Format Registration Date
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Joined 2026';
    const d = new Date(isoString);
    return `Joined ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
            Registered Devotees Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Platform roster of registered customer accounts, contact status, and account suspension controls.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Devotees */}
        <Card className="shadow-sm border">
          <CardHeader className="py-3.5 px-5 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Devotees
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold font-serif">{totalDevotees}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Registered customer accounts
            </p>
          </CardContent>
        </Card>

        {/* Active Accounts */}
        <Card className="shadow-sm border">
          <CardHeader className="py-3.5 px-5 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Accounts
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold font-serif text-emerald-600">
              {activeDevotees}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Fully operational devotee profiles
            </p>
          </CardContent>
        </Card>

        {/* Suspended Accounts */}
        <Card className="shadow-sm border">
          <CardHeader className="py-3.5 px-5 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Suspended Accounts
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
              <UserX className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold font-serif text-rose-600">
              {suspendedDevotees}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Temporarily suspended profiles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Roster Controls: Status Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-3 w-full md:w-auto text-xs bg-muted/60 p-1">
            <TabsTrigger value="ALL" className="gap-1.5 text-xs font-medium">
              <Users className="w-3.5 h-3.5" />
              All ({totalDevotees})
            </TabsTrigger>
            <TabsTrigger value="ACTIVE" className="gap-1.5 text-xs font-medium">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Active ({activeDevotees})
            </TabsTrigger>
            <TabsTrigger value="SUSPENDED" className="gap-1.5 text-xs font-medium">
              <UserX className="w-3.5 h-3.5 text-rose-600" />
              Suspended ({suspendedDevotees})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search name, email, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9 bg-card shadow-sm"
          />
        </div>
      </div>

      {/* Main Directory Table / Card */}
      <Card className="shadow-sm border border-border/60 overflow-hidden">
        <CardHeader className="py-3.5 px-6 border-b border-border/40 bg-muted/15">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Devotees Roster</CardTitle>
              <CardDescription className="text-xs">
                Showing {filteredDevotees.length} of {devoteesList.length} total registered customer accounts
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredDevotees.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
              <p className="font-medium text-foreground">No devotee records match filter criteria.</p>
              <p className="text-[11px] max-w-sm mx-auto">
                Try clearing your search query or switching status tabs.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('ALL');
                }}
                className="text-xs mt-2"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              {/* DESKTOP 5-column symmetrical table (hidden below md / 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="table-fixed w-full">
                  <TableHeader className="bg-muted/20">
                    <TableRow className="hover:bg-transparent border-b border-border/40">
                      <TableHead className="w-[28%] text-[11px] uppercase font-semibold tracking-wider text-muted-foreground px-6 py-3">Devotee</TableHead>
                      <TableHead className="w-[26%] text-[11px] uppercase font-semibold tracking-wider text-muted-foreground px-4 py-3">Contact Details</TableHead>
                      <TableHead className="w-[22%] text-[11px] uppercase font-semibold tracking-wider text-muted-foreground px-4 py-3">Location & Address</TableHead>
                      <TableHead className="w-[14%] text-[11px] uppercase font-semibold tracking-wider text-muted-foreground px-4 py-3">Status</TableHead>
                      <TableHead className="w-[10%] text-[11px] uppercase font-semibold tracking-wider text-muted-foreground px-6 py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDevotees.map((devotee) => (
                      <TableRow
                        key={devotee.id}
                        className="text-xs hover:bg-muted/25 transition-colors border-b border-border/40 h-16"
                      >
                        {/* 1. Devotee Cell */}
                        <TableCell className="w-[28%] px-6 py-3.5 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-border/60 shrink-0">
                              {devotee.name.charAt(0)}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-bold text-foreground text-xs truncate">
                                {devotee.name}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-normal truncate">
                                <Calendar className="w-3 h-3 shrink-0" />
                                <span className="truncate">{formatDate(devotee.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* 2. Contact Details */}
                        <TableCell className="w-[26%] px-4 py-3.5 align-middle">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 font-mono text-xs text-foreground truncate">
                              <Phone className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                              <span className="truncate">{devotee.phoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground text-[11px] truncate">
                              <Mail className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                              <span className="truncate">{devotee.email}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* 3. Location & Saved Address */}
                        <TableCell className="w-[22%] px-4 py-3.5 align-middle">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1 text-foreground font-semibold text-xs truncate">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">{devotee.primaryCity}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] min-w-0">
                              {devotee.hasAddress ? (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-300 font-medium shrink-0">
                                  Saved Address
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground border-border bg-muted/30 font-medium shrink-0">
                                  No Address
                                </Badge>
                              )}
                              <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                                <ShoppingBag className="w-3 h-3 text-muted-foreground shrink-0" />
                                {devotee.bookingCount} Bookings
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* 4. Status Cell */}
                        <TableCell className="w-[14%] px-4 py-3.5 align-middle">
                          <div className="flex items-center justify-start">
                            {devotee.status === 'ACTIVE' ? (
                              <Badge variant="outline" className="px-2.5 py-0.5 rounded-full inline-flex items-center justify-center bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium gap-1.5 shadow-none whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="px-2.5 py-0.5 rounded-full inline-flex items-center justify-center bg-rose-50 text-rose-700 border-rose-200 text-xs font-medium gap-1.5 shadow-none whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                                Suspended
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* 5. Actions Cell (Symmetric 3-dot dropdown menu) */}
                        <TableCell className="w-[10%] px-6 py-3.5 text-center align-middle">
                          <div className="flex items-center justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                                  title="Devotee Actions Menu"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52 text-xs">
                                <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                                  Devotee Actions
                                </DropdownMenuLabel>

                                {devotee.status === 'ACTIVE' ? (
                                  <DropdownMenuItem
                                    onClick={() => openSuspendDialog(devotee)}
                                    className="cursor-pointer text-destructive gap-2 font-medium"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                    Suspend Devotee Account...
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleReactivate(devotee.id, devotee.name)}
                                    className="cursor-pointer text-emerald-700 font-medium gap-2"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    Reactivate Account
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(devotee)}
                                  className="cursor-pointer text-destructive gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete Devotee Record
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* MOBILE Responsive Card View (visible on < md / 768px) */}
              <div className="block md:hidden divide-y divide-border/40">
                {filteredDevotees.map((devotee) => (
                  <div key={devotee.id} className="p-4 space-y-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border shrink-0">
                          {devotee.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-foreground text-sm truncate">
                            {devotee.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-normal truncate">
                            {formatDate(devotee.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {devotee.status === 'ACTIVE' ? (
                          <Badge variant="outline" className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border-rose-200 text-xs">
                            Suspended
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-muted-foreground border-t border-border/30">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-foreground font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{devotee.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] truncate">
                          <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{devotee.email}</span>
                        </div>
                      </div>

                      <div className="space-y-0.5 text-right">
                        <div className="font-medium text-foreground text-[11px] flex items-center justify-end gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>{devotee.primaryCity}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {devotee.bookingCount} Bookings Made
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      {devotee.status === 'ACTIVE' ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openSuspendDialog(devotee)}
                          className="text-xs h-7 px-3 gap-1"
                        >
                          <Ban className="w-3 h-3" />
                          Suspend Account
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleReactivate(devotee.id, devotee.name)}
                          className="text-xs h-7 px-3 bg-emerald-600 text-white gap-1"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          Reactivate Account
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDeleteDialog(devotee)}
                        className="text-xs h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        title="Delete Devotee Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account Suspension Reason Dialog Modal */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="w-5 h-5" />
              Suspend Devotee Account
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              You are about to suspend <strong>{selectedDevotee?.name}</strong> ({selectedDevotee?.email}). Suspended users will be blocked from logging in or booking new rituals.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="suspend-reason" className="text-xs font-semibold">
                Reason for Account Suspension *
              </Label>
              <Textarea
                id="suspend-reason"
                placeholder="E.g., Fraudulent payment activity, repeated policy violation..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="text-xs min-h-22.5"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSuspendDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmSuspend}
              className="text-xs"
            >
              Confirm Account Suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Deletion Confirmation Modal */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Devotee Record
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs pt-1">
              Are you sure you want to permanently delete <strong>{selectedDevotee?.name}</strong> from the database? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsersPage;
