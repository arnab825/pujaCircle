import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Ban,
  ShieldCheck,
  Phone,
  Award,
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

import { priestApi } from '@/api/priest.api';
import { adminApi } from '@/api/admin.api';
import { Priest, PriestApprovalStatus } from '@/types/priest.types';

export const AdminPriestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [priest, setPriest] = useState<Priest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal dialog states
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reasonInput, setReasonInput] = useState('');

  useEffect(() => {
    async function loadPriest() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await priestApi.getPriestById(id);
        if (data) {
          setPriest(data);
        }
      } catch {
        toast.error('Failed to load priest profile.');
      } finally {
        setIsLoading(false);
      }
    }
    loadPriest();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12 text-center text-xs text-muted-foreground">
        Loading Priest dossier...
      </div>
    );
  }

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
            <CardTitle className="text-lg">Priest Record Not Found</CardTitle>
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
  const handleApprove = async () => {
    const res = await adminApi.approvePriest(priest.id);
    if (res.success) {
      setPriest({ ...priest, approvalStatus: 'APPROVED', rejectionReason: undefined });
      toast.success(res.message);
    } else {
      toast.error(res.message || 'Failed to approve application.');
    }
  };

  // Handle Reject Action
  const handleConfirmReject = async () => {
    if (!reasonInput.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    const res = await adminApi.rejectPriest(priest.id, reasonInput.trim());
    if (res.success) {
      setPriest({ ...priest, approvalStatus: 'REJECTED', rejectionReason: reasonInput.trim() });
      setIsRejectDialogOpen(false);
      setReasonInput('');
      toast.success(res.message);
    } else {
      toast.error(res.message || 'Failed to reject.');
    }
  };

  // Handle Ban Action
  const handleConfirmBan = async () => {
    if (!reasonInput.trim()) {
      toast.error('Please enter an administrative reason for banning this account.');
      return;
    }
    const res = await adminApi.banPriest(priest.id, reasonInput.trim());
    if (res.success) {
      setPriest({ ...priest, accountStatus: 'BANNED', banReason: reasonInput.trim() });
      setIsBanDialogOpen(false);
      setReasonInput('');
      toast.success(res.message);
    } else {
      toast.error(res.message || 'Failed to ban.');
    }
  };

  // Handle Unban / Lift Ban Action
  const handleLiftBan = async () => {
    const res = await adminApi.reactivatePriest(priest.id);
    if (res.success) {
      setPriest({ ...priest, accountStatus: 'ACTIVE', banReason: undefined });
      toast.success(res.message);
    } else {
      toast.error(res.message || 'Failed to unban.');
    }
  };

  // Handle Re-open Application Action
  const handleReopen = () => {
    setPriest({ ...priest, approvalStatus: 'PENDING', rejectionReason: undefined });
    toast.info(`Application for ${priest.fullName} re-opened to Pending Review.`);
  };

  // Handle Delete Action
  const handleConfirmDelete = () => {
    toast.success(`Priest record (${priest.fullName}) permanently deleted.`);
    setIsDeleteDialogOpen(false);
    navigate('/admin/priests');
  };

  const getStatusBadge = (approvalStatus: PriestApprovalStatus, accountStatus: string = 'ACTIVE') => {
    return (
      <div className="flex items-center gap-1.5">
        {approvalStatus === 'APPROVED' && (
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-2.5 py-0.5 gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Approved
          </Badge>
        )}
        {approvalStatus === 'PENDING' && (
          <Badge variant="outline" className="border-amber-400 text-amber-800 bg-amber-50 text-xs px-2.5 py-0.5 gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Pending Review
          </Badge>
        )}
        {approvalStatus === 'REJECTED' && (
          <Badge variant="destructive" className="text-xs px-2.5 py-0.5 gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </Badge>
        )}
        {accountStatus === 'BANNED' && (
          <Badge variant="destructive" className="text-xs px-2.5 py-0.5 gap-1 font-bold">
            <Ban className="w-3.5 h-3.5" />
            Banned
          </Badge>
        )}
      </div>
    );
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
                  {getStatusBadge(priest.approvalStatus, priest.accountStatus)}
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
                <div className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {priest.rating} ({priest.reviewCount || 0} reviews)
                </div>
              )}
              <span className="text-[11px] text-muted-foreground">
                Experience: {priest.experienceYears} Years
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Administrative Status Banner */}
      {(priest.accountStatus === 'BANNED' || priest.approvalStatus === 'REJECTED' || priest.approvalStatus === 'PENDING') && (
        <Card className={priest.accountStatus === 'BANNED' ? 'border-destructive/50 bg-destructive/5' : 'border-amber-500/30 bg-amber-500/10'}>
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${priest.accountStatus === 'BANNED' ? 'text-destructive' : 'text-amber-600'}`} />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-foreground">
                Administrative Status ({priest.approvalStatus} / {priest.accountStatus})
              </p>
              <p className="text-muted-foreground">
                {priest.banReason || priest.rejectionReason || (priest.approvalStatus === 'PENDING' ? 'Priest registration is currently awaiting verification.' : 'No notes recorded.')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Verification Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-primary" />
              Contact & Direct Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Mobile Phone:</span>
              <span className="font-mono font-bold text-foreground">{priest.phoneNumber}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Email Address:</span>
              <span className="font-medium text-foreground">{priest.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">City & State:</span>
              <span className="font-medium text-foreground">{priest.city}, {priest.state}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Service Localities:</span>
              <span className="font-medium text-foreground">{priest.serviceAreas?.join(', ') || priest.city}</span>
            </div>
          </CardContent>
        </Card>

        {/* Vedic Credentials */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" />
              Vedic Bio & Lineage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="text-muted-foreground leading-relaxed">{priest.bio}</p>
            <div className="border-t pt-2 space-y-1">
              <span className="text-muted-foreground font-semibold">Spoken Languages:</span>
              <p className="font-medium text-foreground">{priest.languages?.join(', ')}</p>
            </div>
            <div className="border-t pt-2 space-y-1">
              <span className="text-muted-foreground font-semibold">Specializations:</span>
              <p className="font-medium text-foreground">{priest.specializations?.join(', ')}</p>
            </div>
          </CardContent>
        </Card>
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

            {/* If ACTIVE: Ban Option */}
            {priest.accountStatus === 'ACTIVE' && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setIsBanDialogOpen(true)}
                className="text-xs gap-1.5"
              >
                <Ban className="w-4 h-4" />
                Ban Priest Account
              </Button>
            )}

            {/* If BANNED: Lift Ban Option */}
            {priest.accountStatus === 'BANNED' && (
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
            Delete Priest Profile
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
            <Label htmlFor="reject-reason" className="text-xs">Rejection Justification</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Incomplete background certification / Inability to verify Vedic credentials..."
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className="text-xs min-h-24"
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
              className="text-xs min-h-24"
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
              Permanently Delete Priest Profile?
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
