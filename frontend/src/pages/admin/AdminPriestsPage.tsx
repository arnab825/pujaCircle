import React, { useState, useEffect } from "react";
import {
  mockGetPriests,
  mockAdminApprovePriest,
  mockAdminRejectPriest,
  mockAdminBanPriest,
  mockAdminUnbanPriest,
} from "@/mocks/mock-api";
import { Priest, PriestApprovalStatus } from "@/types/priest.types";
import { PriestApprovalTable } from "@/components/admin/PriestApprovalTable";
import {
  RejectPriestDialog,
  BanPriestDialog,
  DeleteConfirmDialog,
} from "@/components/admin/PriestActionDialogs";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type StatusFilter = "ALL" | PriestApprovalStatus | "BANNED";

export const AdminPriestsPage: React.FC = () => {
  const [priests, setPriests] = useState<Priest[]>([]);
  const [activeTab, setActiveTab] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Dialog targets
  const [rejectTarget, setRejectTarget] = useState<Priest | null>(null);
  const [banTarget, setBanTarget] = useState<Priest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Priest | null>(null);

  const fetchPriests = async () => {
    try {
      const res = await mockGetPriests({ status: "ALL" });
      if (res.success) {
        setPriests(res.data);
      }
    } catch {
      toast.error("Failed to load priest roster.");
    }
  };

  useEffect(() => {
    fetchPriests();
  }, []);

  const handleApprove = async (priestId: string) => {
    setIsProcessing(true);
    try {
      const res = await mockAdminApprovePriest(priestId);
      if (res.success) {
        toast.success(res.message);
        fetchPriests();
      } else {
        toast.error(res.message || "Failed to approve priest.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    const res = await mockAdminRejectPriest(rejectTarget.id, reason);
    if (res.success) {
      toast.success(res.message);
      fetchPriests();
    } else {
      toast.error(res.message || "Failed to reject application.");
    }
  };

  const handleBanConfirm = async (reason: string) => {
    if (!banTarget) return;
    const res = await mockAdminBanPriest(banTarget.id, reason);
    if (res.success) {
      toast.success(res.message);
      fetchPriests();
    } else {
      toast.error(res.message || "Failed to ban priest.");
    }
  };

  const handleUnban = async (priestId: string) => {
    const res = await mockAdminUnbanPriest(priestId);
    if (res.success) {
      toast.success(res.message);
      fetchPriests();
    } else {
      toast.error(res.message || "Failed to reactivate priest.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    toast.success(`Priest ${deleteTarget.fullName} record removed.`);
    setPriests((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // Filter priests by tab status and search text
  const filteredPriests = priests.filter((p) => {
    if (activeTab === "BANNED") {
      if (p.accountStatus !== "BANNED") return false;
    } else if (activeTab !== "ALL") {
      if (p.approvalStatus !== activeTab) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = (p.fullName || "").toLowerCase().includes(q);
      const matchesPhone = (p.phoneNumber || "").includes(q);
      const matchesCity = (p.city || "").toLowerCase().includes(q);
      return matchesName || matchesPhone || matchesCity;
    }
    return true;
  });

  // Calculate status counts for tab badges
  const pendingCount = priests.filter(
    (p) => p.approvalStatus === "PENDING",
  ).length;
  const approvedCount = priests.filter(
    (p) => p.approvalStatus === "APPROVED",
  ).length;
  const rejectedCount = priests.filter(
    (p) => p.approvalStatus === "REJECTED",
  ).length;
  const bannedCount = priests.filter(
    (p) => p.accountStatus === "BANNED",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">
            Priest Applications & Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review onboarding requests, verify Gurukul credentials, and moderate
            priest accounts.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPriests}
          className="h-9 gap-1.5 text-xs w-full sm:w-auto font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh List
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="overflow-x-auto pb-1 max-w-full">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as StatusFilter)}
            className="w-full sm:w-auto min-w-max"
          >
            <TabsList className="flex w-full sm:w-auto text-xs h-9">
              <TabsTrigger value="ALL" className="text-xs px-3">
                All ({priests.length})
              </TabsTrigger>
              <TabsTrigger
                value="PENDING"
                className="text-xs px-3 text-amber-600 font-semibold"
              >
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger
                value="APPROVED"
                className="text-xs px-3 text-emerald-600"
              >
                Approved ({approvedCount})
              </TabsTrigger>
              <TabsTrigger
                value="REJECTED"
                className="text-xs px-3 text-destructive"
              >
                Rejected ({rejectedCount})
              </TabsTrigger>
              <TabsTrigger
                value="BANNED"
                className="text-xs px-3 text-muted-foreground"
              >
                Banned ({bannedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, city, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Main Table or Empty State */}
      {filteredPriests.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title={
            activeTab === "PENDING"
              ? "No pending applications"
              : "No priests match the selected filter"
          }
          description="Try adjusting your search criteria or switching status tabs."
        />
      ) : (
        <PriestApprovalTable
          priests={filteredPriests}
          onApprove={handleApprove}
          onOpenReject={(p) => setRejectTarget(p)}
          onOpenBan={(p) => setBanTarget(p)}
          onUnban={handleUnban}
          onOpenDelete={(p) => setDeleteTarget(p)}
          isProcessing={isProcessing}
        />
      )}

      {/* Action Dialogs */}
      <RejectPriestDialog
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        priest={rejectTarget}
        onConfirm={handleRejectConfirm}
      />

      <BanPriestDialog
        isOpen={!!banTarget}
        onClose={() => setBanTarget(null)}
        priest={banTarget}
        onConfirm={handleBanConfirm}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete Record for ${deleteTarget?.fullName}?`}
        description="This will permanently delete the priest application from the directory. This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AdminPriestsPage;
