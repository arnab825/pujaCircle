import React, { useState, useEffect, useMemo } from 'react';
import {
  mockGetPriests,
  mockAdminApprovePriest,
  mockAdminRejectPriest,
  mockAdminBanPriest,
  mockAdminUnbanPriest,
} from '@/mocks/mock-api';
import { Priest, PriestApprovalStatus } from '@/types/priest.types';
import { PriestApprovalTable } from '@/components/admin/PriestApprovalTable';
import {
  RejectPriestDialog,
  BanPriestDialog,
  DeleteConfirmDialog,
} from '@/components/admin/PriestActionDialogs';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Search, UserCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type StatusFilter = 'ALL' | PriestApprovalStatus;

export const AdminPriestsPage: React.FC = () => {
  const [priests, setPriests] = useState<Priest[]>([]);
  const [activeTab, setActiveTab] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Dialog targets
  const [rejectTarget, setRejectTarget] = useState<Priest | null>(null);
  const [banTarget, setBanTarget] = useState<Priest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Priest | null>(null);

  const fetchPriests = async () => {
    try {
      const res = await mockGetPriests({ status: 'ALL' });
      if (res.success) {
        setPriests(res.data);
      }
    } catch {
      toast.error('Failed to load priest roster.');
    }
  };

  useEffect(() => {
    fetchPriests();
  }, []);

  // Handlers
  const handleApprove = async (priestId: string) => {
    setIsProcessing(true);
    try {
      const res = await mockAdminApprovePriest(priestId);
      if (res.success) {
        toast.success('Purohit application approved!');
        fetchPriests();
      } else {
        toast.error(res.message || 'Failed to approve purohit.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    const res = await mockAdminRejectPriest(rejectTarget.id, reason);
    if (res.success) {
      toast.success('Purohit application rejected.');
      fetchPriests();
    } else {
      toast.error(res.message || 'Failed to reject.');
    }
  };

  const handleBanConfirm = async (reason: string) => {
    if (!banTarget) return;
    const res = await mockAdminBanPriest(banTarget.id, reason);
    if (res.success) {
      toast.success('Purohit banned from platform.');
      fetchPriests();
    } else {
      toast.error(res.message || 'Failed to ban.');
    }
  };

  const handleUnban = async (priestId: string) => {
    const res = await mockAdminUnbanPriest(priestId);
    if (res.success) {
      toast.success('Purohit unbanned successfully.');
      fetchPriests();
    } else {
      toast.error(res.message || 'Failed to unban.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setPriests((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast.success('Purohit record deleted permanently.');
    setDeleteTarget(null);
  };

  // Filtered List
  const filteredPriests = useMemo(() => {
    return priests.filter((p) => {
      if (activeTab !== 'ALL' && p.approvalStatus !== activeTab) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = p.fullName.toLowerCase().includes(query);
        const cityMatch = p.city.toLowerCase().includes(query);
        const phoneMatch = p.phoneNumber.includes(query);
        return nameMatch || cityMatch || phoneMatch;
      }
      return true;
    });
  }, [priests, activeTab, searchQuery]);

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">Purohit Directory & Verification</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review qualifications, approve pending purohits, and manage platform bans.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPriests} className="gap-1.5 text-xs w-fit">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as StatusFilter)}>
          <TabsList className="grid grid-cols-5 w-full max-w-lg h-9">
            <TabsTrigger value="ALL" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="PENDING" className="text-xs">Pending</TabsTrigger>
            <TabsTrigger value="APPROVED" className="text-xs">Approved</TabsTrigger>
            <TabsTrigger value="REJECTED" className="text-xs">Rejected</TabsTrigger>
            <TabsTrigger value="BANNED" className="text-xs">Banned</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Purohit name, city, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Table */}
      {filteredPriests.length > 0 ? (
        <PriestApprovalTable
          priests={filteredPriests}
          onApprove={handleApprove}
          onOpenReject={(p) => setRejectTarget(p)}
          onOpenBan={(p) => setBanTarget(p)}
          onUnban={handleUnban}
          onOpenDelete={(p) => setDeleteTarget(p)}
          isProcessing={isProcessing}
        />
      ) : (
        <EmptyState
          icon={UserCheck}
          title="No Purohits found"
          description={
            searchQuery ? 'No purohits match your search criteria.' : 'No purohits in this category.'
          }
        />
      )}

      {/* Dialogs */}
      <RejectPriestDialog
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        priest={rejectTarget}
      />

      <BanPriestDialog
        isOpen={!!banTarget}
        onClose={() => setBanTarget(null)}
        onConfirm={handleBanConfirm}
        priest={banTarget}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Purohit Record"
        description={`Are you sure you want to permanently delete ${deleteTarget?.fullName}? This action cannot be undone.`}
      />
    </div>
  );
};

export default AdminPriestsPage;
