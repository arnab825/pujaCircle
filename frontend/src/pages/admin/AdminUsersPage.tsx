import React, { useState, useEffect, useMemo } from 'react';
import {
  mockAdminGetUsers,
  mockAdminBanUser,
  mockAdminUnbanUser,
} from '@/mocks/mock-api';
import { UserManagementTable, DevoteeRecord } from '@/components/admin/UserManagementTable';
import { SuspendUserDialog } from '@/components/admin/UserActionDialogs';
import { DeleteConfirmDialog } from '@/components/admin/PriestActionDialogs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Search, Users, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type DevoteeFilter = 'ALL' | 'ACTIVE' | 'SUSPENDED';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<DevoteeRecord[]>([]);
  const [activeTab, setActiveTab] = useState<DevoteeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog targets
  const [suspendTarget, setSuspendTarget] = useState<DevoteeRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DevoteeRecord | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await mockAdminGetUsers();
      if (res.success) {
        setUsers(
          res.data.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phoneNumber: u.phoneNumber,
            status: u.accountStatus === 'BANNED' || u.status === 'BANNED' ? 'SUSPENDED' : 'ACTIVE',
            bookingCount: u.bookingCount || 0,
            createdAt: u.createdAt || '2026-01-15',
            banReason: u.banReason,
          }))
        );
      }
    } catch {
      toast.error('Failed to load devotee directory.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handlers
  const handleSuspendConfirm = async (reason: string) => {
    if (!suspendTarget) return;
    const res = await mockAdminBanUser(suspendTarget.id, reason);
    if (res.success) {
      toast.success(`Account for ${suspendTarget.name} suspended.`);
      fetchUsers();
    } else {
      toast.error(res.message || 'Failed to suspend account.');
    }
  };

  const handleReactivate = async (userId: string, name: string) => {
    const res = await mockAdminUnbanUser(userId);
    if (res.success) {
      toast.success(`Account for ${name} reactivated.`);
      fetchUsers();
    } else {
      toast.error(res.message || 'Failed to reactivate.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    toast.success('Devotee profile deleted permanently.');
    setDeleteTarget(null);
  };

  // Metrics
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const suspendedCount = users.filter((u) => u.status === 'SUSPENDED').length;

  // Filtered List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (activeTab === 'ACTIVE' && u.status !== 'ACTIVE') return false;
      if (activeTab === 'SUSPENDED' && u.status !== 'SUSPENDED') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = u.name.toLowerCase().includes(query);
        const emailMatch = (u.email || '').toLowerCase().includes(query);
        const phoneMatch = u.phoneNumber.includes(query);
        return nameMatch || emailMatch || phoneMatch;
      }
      return true;
    });
  }, [users, activeTab, searchQuery]);

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">Devotee Directory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor registered devotees, bookings history, and manage account statuses.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-1.5 text-xs w-full sm:w-auto h-9 font-medium">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Devotees
            </CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold font-serif text-foreground">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Profiles
            </CardTitle>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold font-serif text-emerald-600">{activeCount}</div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Suspended
            </CardTitle>
            <UserX className="w-4 h-4 text-rose-600" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold font-serif text-rose-600">{suspendedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as DevoteeFilter)}>
          <TabsList className="grid grid-cols-3 w-full max-w-sm h-9">
            <TabsTrigger value="ALL" className="text-xs">All ({users.length})</TabsTrigger>
            <TabsTrigger value="ACTIVE" className="text-xs">Active ({activeCount})</TabsTrigger>
            <TabsTrigger value="SUSPENDED" className="text-xs">Suspended ({suspendedCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by devotee name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Table */}
      {filteredUsers.length > 0 ? (
        <UserManagementTable
          users={filteredUsers}
          onOpenSuspend={(u) => setSuspendTarget(u)}
          onReactivate={handleReactivate}
          onOpenDelete={(u) => setDeleteTarget(u)}
        />
      ) : (
        <EmptyState
          icon={Users}
          title="No Devotees found"
          description={
            searchQuery ? 'No profiles match your search criteria.' : 'No profiles in this category.'
          }
        />
      )}

      {/* Dialogs */}
      <SuspendUserDialog
        isOpen={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspendConfirm}
        user={suspendTarget}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Devotee Account"
        description={`Are you sure you want to permanently delete the profile of ${deleteTarget?.name}? All booking history will be disassociated.`}
      />
    </div>
  );
};

export default AdminUsersPage;
