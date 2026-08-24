import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  ShieldCheck,
  MapPin,
  Phone,
  Eye,
  Trash2,
  RotateCcw,
  UserCheck,
  Clock,
  UserX,
  Users,
  MoreVertical,
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

import { mockPriests } from '@/mocks/db';
import { Priest, PriestApprovalStatus } from '@/types/priest.types';

/*
  PAGE: Manage Vedic Priests (/admin/priests)
  
  ACCESS:
  - ADMIN role only
  
  PURPOSE:
  - Centralized platform roster of all Vedic scholars across all lifecycle states.
  - Review applications, approve, reject, ban bad actors, unban, or delete priest profiles.
*/
const AdminPriestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [priestsList, setPriestsList] = useState<Priest[]>(mockPriests);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal dialog states
  const [selectedPriest, setSelectedPriest] = useState<Priest | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reasonInput, setReasonInput] = useState('');

  // Expandable specializations state (Read More / Read Less toggle per priest)
  const [expandedSpecs, setExpandedSpecs] = useState<Record<string, boolean>>({});

  const toggleExpandSpecs = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSpecs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Tab counts
  const totalCount = priestsList.length;
  const approvedCount = priestsList.filter((p) => p.approvalStatus === 'APPROVED').length;
  const pendingCount = priestsList.filter((p) => p.approvalStatus === 'PENDING').length;
  const bannedCount = priestsList.filter((p) => p.approvalStatus === 'BANNED').length;

  // Filtering logic
  const filteredPriests = priestsList.filter((priest) => {
    // Tab filter
    if (activeTab === 'APPROVED' && priest.approvalStatus !== 'APPROVED') return false;
    if (activeTab === 'PENDING' && priest.approvalStatus !== 'PENDING') return false;
    if (activeTab === 'BANNED' && priest.approvalStatus !== 'BANNED') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = priest.fullName.toLowerCase().includes(q) || priest.displayName.toLowerCase().includes(q);
      const matchPhone = priest.phoneNumber.includes(q);
      const matchCity = priest.city.toLowerCase().includes(q) || priest.state.toLowerCase().includes(q);
      const matchSpec = priest.specializations.some((s) => s.toLowerCase().includes(q));
      return matchName || matchPhone || matchCity || matchSpec;
    }

    return true;
  });

  // Handle Approve Action
  const handleApprove = (id: string, name: string) => {
    setPriestsList((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, approvalStatus: 'APPROVED' as PriestApprovalStatus, statusReason: undefined }
          : p
      )
    );
    toast.success(`Application approved for ${name}`);
  };

  // Open Reject Dialog
  const openRejectDialog = (priest: Priest) => {
    setSelectedPriest(priest);
    setReasonInput('');
    setIsRejectDialogOpen(true);
  };

  // Confirm Reject Action
  const handleConfirmReject = () => {
    if (!selectedPriest) return;
    if (!reasonInput.trim()) {
      toast.error('Please enter a rejection reason for record keeping.');
      return;
    }
    setPriestsList((prev) =>
      prev.map((p) =>
        p.id === selectedPriest.id
          ? { ...p, approvalStatus: 'REJECTED' as PriestApprovalStatus, statusReason: reasonInput.trim() }
          : p
      )
    );
    toast.error(`Application rejected for ${selectedPriest.fullName}`);
    setIsRejectDialogOpen(false);
    setSelectedPriest(null);
  };

  // Open Ban Dialog
  const openBanDialog = (priest: Priest) => {
    setSelectedPriest(priest);
    setReasonInput('');
    setIsBanDialogOpen(true);
  };

  // Confirm Ban Action
  const handleConfirmBan = () => {
    if (!selectedPriest) return;
    if (!reasonInput.trim()) {
      toast.error('Please enter an administrative reason for banning this account.');
      return;
    }
    setPriestsList((prev) =>
      prev.map((p) =>
        p.id === selectedPriest.id
          ? { ...p, approvalStatus: 'BANNED' as PriestApprovalStatus, statusReason: reasonInput.trim() }
          : p
      )
    );
    toast.error(`Account banned for ${selectedPriest.fullName}`);
    setIsBanDialogOpen(false);
    setSelectedPriest(null);
  };

  // Lift Ban Action
  const handleLiftBan = (id: string, name: string) => {
    setPriestsList((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, approvalStatus: 'APPROVED' as PriestApprovalStatus, statusReason: undefined }
          : p
      )
    );
    toast.success(`Ban lifted. ${name} reactivated as Approved Priest.`);
  };

  // Re-open Application Action
  const handleReopen = (id: string, name: string) => {
    setPriestsList((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, approvalStatus: 'PENDING' as PriestApprovalStatus, statusReason: undefined }
          : p
      )
    );
    toast.info(`Application for ${name} re-opened to Pending Review.`);
  };

  // Open Delete Alert Dialog
  const openDeleteDialog = (priest: Priest) => {
    setSelectedPriest(priest);
    setIsDeleteDialogOpen(true);
  };

  // Confirm Delete Action
  const handleConfirmDelete = () => {
    if (!selectedPriest) return;
    setPriestsList((prev) => prev.filter((p) => p.id !== selectedPriest.id));
    toast.success(`Priest record (${selectedPriest.fullName}) permanently deleted.`);
    setIsDeleteDialogOpen(false);
    setSelectedPriest(null);
  };

  const getStatusBadge = (status: PriestApprovalStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge variant="outline" className="px-2.5 py-0.5 rounded-full inline-flex items-center justify-center bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs font-medium gap-1.5 shadow-none whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            Approved
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="outline" className="px-2.5 py-0.5 rounded-full inline-flex items-center justify-center bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 text-xs font-medium gap-1.5 shadow-none whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Pending Review
          </Badge>
        );
      case 'BANNED':
        return (
          <Badge variant="outline" className="px-2.5 py-0.5 rounded-full inline-flex items-center justify-center bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 text-xs font-medium gap-1.5 shadow-none whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
            Banned
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="px-2.5 py-0.5 rounded-full inline-flex items-center justify-center bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 text-xs font-medium gap-1.5 shadow-none whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline" className="px-2.5 py-0.5 rounded-full inline-flex items-center justify-center whitespace-nowrap">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
            Manage Vedic Priests
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Full platform roster of Vedic scholars: review applications, approve, reject, ban, or remove profiles.
          </p>
        </div>
      </div>

      {/* Roster Overview Metrics & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-4 w-full md:w-auto text-xs bg-muted/60 p-1">
            <TabsTrigger value="ALL" className="gap-1.5 text-xs font-medium">
              <Users className="w-3.5 h-3.5" />
              All ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="APPROVED" className="gap-1.5 text-xs font-medium">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Approved ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="PENDING" className="gap-1.5 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="BANNED" className="gap-1.5 text-xs font-medium">
              <UserX className="w-3.5 h-3.5 text-rose-600" />
              Banned ({bannedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search scholar name, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9 bg-card shadow-sm"
          />
        </div>
      </div>

      {/* Main Directory Card */}
      <Card className="shadow-sm border border-border/60 overflow-hidden">
        <CardHeader className="py-3.5 px-6 border-b border-border/40 bg-muted/15">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Vedic Scholars Directory</CardTitle>
              <CardDescription className="text-xs">
                Showing {filteredPriests.length} of {priestsList.length} total registered purohit records
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPriests.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
              <p className="font-medium text-foreground">No priests found matching filter criteria.</p>
              <p className="text-[11px] max-w-sm mx-auto">
                Try clearing your search query or switching tabs to view other scholar profiles.
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
              {/* DESKTOP symmetric 5-column table (hidden below md / 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="table-fixed w-full">
                  <TableHeader className="bg-muted/20">
                    <TableRow className="hover:bg-transparent border-b border-border/40">
                      <TableHead className="w-[28%] text-[11px] uppercase font-semibold tracking-wider text-muted-foreground px-6 py-3">Scholar</TableHead>
                      <TableHead className="w-[24%] text-[11px] uppercase font-semibold tracking-wider text-muted-foreground px-4 py-3">Contact & Location</TableHead>
                      <TableHead className="w-[24%] text-[11px] uppercase font-semibold tracking-wider text-muted-foreground px-4 py-3">Experience & Expertise</TableHead>
                      <TableHead className="w-[14%] text-[11px] uppercase font-semibold tracking-wider text-muted-foreground px-4 py-3">Status</TableHead>
                      <TableHead className="w-[10%] text-[11px] uppercase font-semibold tracking-wider text-muted-foreground px-6 py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPriests.map((priest) => {
                      const firstSpec = priest.specializations[0];
                      const extraSpecs = priest.specializations.slice(1);
                      return (
                        <TableRow
                          key={priest.id}
                          className="text-xs hover:bg-muted/25 transition-colors border-b border-border/40 h-16"
                        >
                          {/* 1. Scholar Cell (Merged Avatar + Name + Subtitle) */}
                          <TableCell
                            className="w-[28%] px-6 py-3.5 align-middle cursor-pointer hover:bg-muted/30 transition-colors group"
                            onClick={() => navigate(`/admin/priests/${priest.id}`)}
                            title="Click to view scholar profile details"
                          >
                            <div className="flex items-center gap-3">
                              {priest.profileImageUrl ? (
                                <img
                                  src={priest.profileImageUrl}
                                  alt={priest.fullName}
                                  className="w-9 h-9 rounded-full object-cover border border-border/60 shadow-sm shrink-0 group-hover:border-primary/50 transition-colors"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-border/60 shrink-0">
                                  {priest.fullName.charAt(0)}
                                </div>
                              )}
                              <div className="space-y-0.5 min-w-0">
                                <div className="font-bold text-foreground group-hover:text-primary transition-colors text-xs truncate">
                                  {priest.fullName}
                                </div>
                                <div className="text-[11px] text-muted-foreground font-normal truncate">
                                  {priest.displayName}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* 2. Contact & Location Cell */}
                          <TableCell className="w-[24%] px-4 py-3.5 align-middle">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5 font-mono text-xs text-foreground truncate">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                                <span className="truncate">{priest.phoneNumber}</span>
                                {priest.isPhoneVerified && (
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-300 text-emerald-700 bg-emerald-50/80 font-medium shrink-0">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground text-[11px] truncate">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                                <span className="truncate">{priest.city}, {priest.state}</span>
                              </div>
                            </div>
                          </TableCell>

                          {/* 3. Experience & Expertise Cell (Interactive Read More / Read Less toggle) */}
                          <TableCell className="w-[24%] px-4 py-3.5 align-middle">
                            <div className="space-y-1 min-w-0">
                              <div className="text-foreground font-semibold text-xs truncate">
                                {priest.experienceYears} Yrs Experience
                              </div>
                              <div className="flex flex-wrap items-center gap-1 min-w-0">
                                {expandedSpecs[priest.id] ? (
                                  <>
                                    {priest.specializations.map((spec, i) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="text-[10px] px-2 py-0.5 bg-muted/50 text-muted-foreground border-border/80 font-medium rounded-md truncate max-w-[140px]"
                                      >
                                        {spec}
                                      </Badge>
                                    ))}
                                    <Badge
                                      variant="outline"
                                      onClick={(e) => toggleExpandSpecs(priest.id, e)}
                                      className="text-[10px] px-1.5 py-0.5 text-muted-foreground border-border/80 bg-muted/30 hover:bg-muted font-semibold rounded-md cursor-pointer transition-colors shrink-0"
                                      title="Click to collapse specializations"
                                    >
                                      ...
                                    </Badge>
                                  </>
                                ) : (
                                  <>
                                    {firstSpec && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] px-2 py-0.5 bg-muted/50 text-muted-foreground border-border/80 font-medium rounded-md truncate max-w-[130px]"
                                      >
                                        {firstSpec}
                                      </Badge>
                                    )}
                                    {extraSpecs.length > 0 && (
                                      <Badge
                                        variant="outline"
                                        onClick={(e) => toggleExpandSpecs(priest.id, e)}
                                        className="text-[10px] px-1.5 py-0.5 text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 font-semibold rounded-md cursor-pointer transition-colors shrink-0"
                                        title={`Click to view ${extraSpecs.length} more specializations`}
                                      >
                                        +{extraSpecs.length}
                                      </Badge>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* 4. Status Cell */}
                          <TableCell className="w-[14%] px-4 py-3.5 align-middle">
                            <div className="flex items-center justify-start">
                              {getStatusBadge(priest.approvalStatus)}
                            </div>
                          </TableCell>

                          {/* 5. Actions Cell (Symmetric 3-dot dropdown menu for ALL rows) */}
                          <TableCell className="w-[10%] px-6 py-3.5 text-center align-middle">
                            <div className="flex items-center justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                                    title="Scholar Actions Menu"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                    <span className="sr-only">Open actions menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 text-xs">
                                  <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                                    Scholar Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/admin/priests/${priest.id}`} className="cursor-pointer gap-2 font-medium">
                                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                      View Profile Details
                                    </Link>
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  {priest.approvalStatus === 'PENDING' && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleApprove(priest.id, priest.fullName)}
                                        className="cursor-pointer text-emerald-700 dark:text-emerald-400 font-medium gap-2"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        Approve Application
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => openRejectDialog(priest)}
                                        className="cursor-pointer text-destructive focus:text-destructive gap-2"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                        Reject Application...
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {priest.approvalStatus === 'APPROVED' && (
                                    <DropdownMenuItem
                                      onClick={() => openBanDialog(priest)}
                                      className="cursor-pointer text-destructive focus:text-destructive gap-2"
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                      Ban Scholar Account...
                                    </DropdownMenuItem>
                                  )}

                                  {priest.approvalStatus === 'BANNED' && (
                                    <DropdownMenuItem
                                      onClick={() => handleLiftBan(priest.id, priest.fullName)}
                                      className="cursor-pointer text-emerald-700 dark:text-emerald-400 font-medium gap-2"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      Lift Ban & Reactivate
                                    </DropdownMenuItem>
                                  )}

                                  {priest.approvalStatus === 'REJECTED' && (
                                    <DropdownMenuItem
                                      onClick={() => handleReopen(priest.id, priest.fullName)}
                                      className="cursor-pointer font-medium gap-2"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      Re-open Application
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => openDeleteDialog(priest)}
                                    className="cursor-pointer text-destructive focus:text-destructive gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Record
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* MOBILE Responsive Card View (visible on < md / 768px) */}
              <div className="block md:hidden divide-y divide-border/40">
                {filteredPriests.map((priest) => {
                  const firstSpec = priest.specializations[0];
                  const extraSpecs = priest.specializations.slice(1);
                  const isExpanded = !!expandedSpecs[priest.id];
                  return (
                    <div key={priest.id} className="p-4 space-y-3 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        {/* Avatar & Name */}
                        <div
                          className="flex items-center gap-3 cursor-pointer min-w-0"
                          onClick={() => navigate(`/admin/priests/${priest.id}`)}
                        >
                          {priest.profileImageUrl ? (
                            <img
                              src={priest.profileImageUrl}
                              alt={priest.fullName}
                              className="w-10 h-10 rounded-full object-cover border shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border shrink-0">
                              {priest.fullName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-foreground text-sm truncate hover:text-primary">
                              {priest.fullName}
                            </div>
                            <div className="text-xs text-muted-foreground font-normal truncate">
                              {priest.displayName}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {getStatusBadge(priest.approvalStatus)}
                        </div>
                      </div>

                      {/* Contact & Expertise Info Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-muted-foreground border-t border-border/30">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-foreground font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span>{priest.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span>{priest.city}, {priest.state}</span>
                          </div>
                        </div>

                        <div className="space-y-0.5 text-right">
                          <div className="font-medium text-foreground text-[11px]">
                            {priest.experienceYears} Yrs Exp
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            {isExpanded ? (
                              <>
                                {priest.specializations.map((s, idx) => (
                                  <Badge key={idx} variant="outline" className="text-[9px] px-1.5 py-0 bg-muted/60">
                                    {s}
                                  </Badge>
                                ))}
                                <Badge
                                  variant="outline"
                                  onClick={(e) => toggleExpandSpecs(priest.id, e)}
                                  className="text-[9px] px-1 py-0 text-muted-foreground bg-muted/30 cursor-pointer"
                                >
                                  Less
                                </Badge>
                              </>
                            ) : (
                              <>
                                {firstSpec && (
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-muted/60">
                                    {firstSpec}
                                  </Badge>
                                )}
                                {extraSpecs.length > 0 && (
                                  <Badge
                                    variant="outline"
                                    onClick={(e) => toggleExpandSpecs(priest.id, e)}
                                    className="text-[9px] px-1 py-0 text-primary bg-primary/5 cursor-pointer"
                                  >
                                    +{extraSpecs.length}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/30">
                        <Link to={`/admin/priests/${priest.id}`}>
                          <Button size="sm" variant="outline" className="text-xs h-7 px-3 gap-1">
                            <Eye className="w-3 h-3" />
                            View Profile
                          </Button>
                        </Link>

                        <div className="flex items-center gap-1">
                          {priest.approvalStatus === 'PENDING' && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(priest.id, priest.fullName)}
                              className="text-xs h-7 px-3 bg-emerald-600 text-white gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Approve
                            </Button>
                          )}
                          {priest.approvalStatus === 'BANNED' && (
                            <Button
                              size="sm"
                              onClick={() => handleLiftBan(priest.id, priest.fullName)}
                              className="text-xs h-7 px-3 bg-emerald-600 text-white gap-1"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              Unban
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDeleteDialog(priest)}
                            className="text-xs h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reject Application Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Reject Priest Application
            </DialogTitle>
            <DialogDescription className="text-xs">
              Provide a clear administrative reason for rejecting {selectedPriest?.fullName}'s application.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="reject-reason-list" className="text-xs">Rejection Reason</Label>
            <Textarea
              id="reject-reason-list"
              placeholder="e.g. Insufficient credential documentation / Unverifiable Gurukul training..."
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className="text-xs min-h-[90px]"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRejectDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmReject}
              className="text-xs"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Account Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Ban Priest Account
            </DialogTitle>
            <DialogDescription className="text-xs">
              Revoke platform access for {selectedPriest?.fullName}. Please state the infraction or reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="ban-reason-list" className="text-xs">Reason for Ban</Label>
            <Textarea
              id="ban-reason-list"
              placeholder="e.g. Multiple unannounced ritual cancellations / Infraction of platform conduct..."
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className="text-xs min-h-[90px]"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBanDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmBan}
              className="text-xs"
            >
              Confirm Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Record Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Permanently Delete Scholar Profile?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently remove <span className="font-semibold text-foreground">{selectedPriest?.fullName}</span> from the platform roster? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
            >
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPriestsPage;


