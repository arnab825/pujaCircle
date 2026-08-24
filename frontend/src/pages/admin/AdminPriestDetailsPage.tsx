import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Ban,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Award,
  BookOpen,
  Languages,
  Star,
  Trash2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

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
  PAGE: Priest Application & Profile Details (/admin/priests/:id)
  
  ACCESS:
  - ADMIN role only
  
  PURPOSE:
  - Complete administrative audit of a single Purohit's credentials, qualifications, and contact details.
  - Approve, Reject, Ban, Lift Ban, or Delete Priest profile.
*/
const AdminPriestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find initial priest record from centralized mock DB
  const initialPriest = mockPriests.find((p) => p.id === id);
  const [priest, setPriest] = useState<Priest | undefined>(initialPriest);

  // Modal dialog states
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reasonInput, setReasonInput] = useState('');

  if (!priest) {
    return (
      <div className="container max-w-3xl py-12 space-y-6">
        <Link
          to="/admin/priests"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Manage Priests
        </Link>
        <Card className="text-center p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg">Scholar Record Not Found</CardTitle>
            <CardDescription className="text-xs">
              No Vedic priest or applicant matches ID "{id}".
            </CardDescription>
          </div>
          <Link to="/admin/priests">
            <Button size="sm" className="text-xs mt-2">
              Return to Priests Roster
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Handle Approve Action
  const handleApprove = () => {
    setPriest((prev) =>
      prev
        ? {
            ...prev,
            approvalStatus: 'APPROVED',
            statusReason: undefined,
          }
        : undefined
    );
    toast.success(`Application approved for ${priest.fullName}`);
  };

  // Handle Reject Action
  const handleConfirmReject = () => {
    if (!reasonInput.trim()) {
      toast.error('Please enter a rejection reason for record keeping.');
      return;
    }
    setPriest((prev) =>
      prev
        ? {
            ...prev,
            approvalStatus: 'REJECTED',
            statusReason: reasonInput.trim(),
          }
        : undefined
    );
    setIsRejectDialogOpen(false);
    setReasonInput('');
    toast.error(`Application rejected for ${priest.fullName}`);
  };

  // Handle Ban Action
  const handleConfirmBan = () => {
    if (!reasonInput.trim()) {
      toast.error('Please enter an administrative reason for banning this account.');
      return;
    }
    setPriest((prev) =>
      prev
        ? {
            ...prev,
            approvalStatus: 'BANNED',
            statusReason: reasonInput.trim(),
          }
        : undefined
    );
    setIsBanDialogOpen(false);
    setReasonInput('');
    toast.error(`Account banned for ${priest.fullName}`);
  };

  // Handle Unban / Lift Ban Action
  const handleLiftBan = () => {
    setPriest((prev) =>
      prev
        ? {
            ...prev,
            approvalStatus: 'APPROVED',
            statusReason: undefined,
          }
        : undefined
    );
    toast.success(`Ban lifted. ${priest.fullName} reactivated as Approved Priest.`);
  };

  // Handle Re-open Application Action
  const handleReopen = () => {
    setPriest((prev) =>
      prev
        ? {
            ...prev,
            approvalStatus: 'PENDING',
            statusReason: undefined,
          }
        : undefined
    );
    toast.info(`Application for ${priest.fullName} re-opened to Pending Review.`);
  };

  // Handle Delete Action
  const handleConfirmDelete = () => {
    toast.success(`Priest record (${priest.fullName}) permanently deleted.`);
    setIsDeleteDialogOpen(false);
    navigate('/admin/priests');
  };

  const getStatusBadge = (status: PriestApprovalStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-2.5 py-0.5 gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Approved
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="outline" className="border-amber-400 text-amber-800 bg-amber-50 text-xs px-2.5 py-0.5 gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Pending Review
          </Badge>
        );
      case 'BANNED':
        return (
          <Badge variant="destructive" className="text-xs px-2.5 py-0.5 gap-1">
            <Ban className="w-3.5 h-3.5" />
            Banned
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="secondary" className="text-xs px-2.5 py-0.5 gap-1">
            <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6 pb-16">
      {/* Top Back Button */}
      <Link
        to="/admin/priests"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Manage Priests Directory
      </Link>

      {/* Main Scholar Header Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {priest.profileImageUrl ? (
                <img
                  src={priest.profileImageUrl}
                  alt={priest.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border">
                  {priest.fullName.charAt(0)}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold font-serif text-foreground">
                    {priest.fullName}
                  </h1>
                  {getStatusBadge(priest.approvalStatus)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Display Name: <span className="font-medium text-foreground">{priest.displayName}</span>
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Scholar ID: {priest.id} • Registered: {new Date(priest.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Quick Rating & Dakshina Summary */}
            <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end gap-1 text-xs">
              {priest.rating && (
                <div className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {priest.rating} ({priest.reviewCount || 0} reviews)
                </div>
              )}
              {priest.dakshinaSuggested && (
                <div className="text-muted-foreground text-[11px] mt-0.5">
                  Suggested Dakshina: <span className="font-bold text-foreground">₹{priest.dakshinaSuggested.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span className="font-mono">{priest.phoneNumber}</span>
              {priest.isPhoneVerified && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-300 text-emerald-700 bg-emerald-50">
                  Verified
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{priest.email || 'N/A'}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>{priest.city}, {priest.state}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning/Alert for Banned or Rejected Accounts */}
      {priest.statusReason && (
        <Card className={priest.approvalStatus === 'BANNED' ? 'border-destructive/50 bg-destructive/5' : 'border-amber-300 bg-amber-50/50'}>
          <CardHeader className="py-3">
            <CardTitle className="text-xs font-semibold flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Administrative Status Reason ({priest.approvalStatus})
            </CardTitle>
            <CardDescription className="text-xs text-foreground font-medium mt-1">
              "{priest.statusReason}"
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Qualifications & Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 columns: Bio, Languages, Specializations */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Vedic Scholar Lineage & Bio
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-muted-foreground">
              {priest.bio || 'No bio submitted.'}
            </CardContent>
          </Card>

          {/* Ritual Specializations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Ritual Specializations & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {priest.specializations.map((spec, i) => (
                  <Badge key={i} variant="secondary" className="text-xs py-1 px-2.5">
                    {spec}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Localities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Service Localities & Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {priest.serviceAreas.map((area, i) => (
                  <Badge key={i} variant="outline" className="text-xs py-1 px-2.5 bg-muted/40">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 column: Summary Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Languages className="w-4 h-4 text-primary" />
                Key Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Vedic Experience</span>
                <span className="font-semibold text-foreground text-sm">{priest.experienceYears} Years</span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] mb-1">Languages Spoken</span>
                <div className="flex flex-wrap gap-1.5">
                  {priest.languages.map((lang, i) => (
                    <Badge key={i} variant="outline" className="text-[11px]">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Base Location</span>
                <span className="font-medium text-foreground">{priest.city}, {priest.state}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Administrative Decision Action Bar */}
      <Card className="border-primary/20 bg-card shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Administrative Actions & Lifecycle Control</CardTitle>
          <CardDescription className="text-xs">
            Manage application verification state, handle disciplinary suspensions, or remove profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* If PENDING: Approve / Reject */}
            {priest.approvalStatus === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Application
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsRejectDialogOpen(true)}
                  className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Application
                </Button>
              </>
            )}

            {/* If APPROVED: Ban */}
            {priest.approvalStatus === 'APPROVED' && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setIsBanDialogOpen(true)}
                className="text-xs gap-1.5"
              >
                <Ban className="w-4 h-4" />
                Ban Scholar Account
              </Button>
            )}

            {/* If BANNED: Lift Ban */}
            {priest.approvalStatus === 'BANNED' && (
              <Button
                size="sm"
                onClick={handleLiftBan}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Lift Ban & Reactivate
              </Button>
            )}

            {/* If REJECTED: Re-open */}
            {priest.approvalStatus === 'REJECTED' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleReopen}
                className="text-xs gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Re-open Application
              </Button>
            )}
          </div>

          {/* Delete Record Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-xs text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Delete Scholar Profile
          </Button>
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
              Provide a clear administrative reason for rejecting {priest.fullName}'s application.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="reject-reason" className="text-xs">Rejection Reason</Label>
            <Textarea
              id="reject-reason"
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
              Revoke platform access for {priest.fullName}. Please state the infraction or reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="ban-reason" className="text-xs">Reason for Ban</Label>
            <Textarea
              id="ban-reason"
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
              Are you sure you want to permanently remove <span className="font-semibold text-foreground">{priest.fullName}</span> from the platform roster? This action cannot be undone.
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

export default AdminPriestDetailsPage;

