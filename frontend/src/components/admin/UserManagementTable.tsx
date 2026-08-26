import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import { Ban, Trash2, MoreVertical, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';

export interface DevoteeRecord {
  id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED';
  bookingCount?: number;
  createdAt?: string;
  banReason?: string;
}

interface UserManagementTableProps {
  users: DevoteeRecord[];
  onOpenSuspend: (user: DevoteeRecord) => void;
  onReactivate: (userId: string, name: string) => void;
  onOpenDelete: (user: DevoteeRecord) => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onOpenSuspend,
  onReactivate,
  onOpenDelete,
}) => {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs">Devotee</TableHead>
            <TableHead className="text-xs">Contact</TableHead>
            <TableHead className="text-xs">Ceremonies</TableHead>
            <TableHead className="text-xs">Joined</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id} className="text-xs">
              <TableCell className="font-medium">
                <p className="font-bold text-foreground">{u.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{u.id}</p>
              </TableCell>
              <TableCell>
                <div className="space-y-0.5 text-muted-foreground">
                  <div className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-primary shrink-0" />
                    <span>{u.phoneNumber}</span>
                  </div>
                  {u.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate max-w-36">{u.email}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{u.bookingCount || 0} booked</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {u.createdAt ? formatDate(u.createdAt) : 'Recent'}
              </TableCell>
              <TableCell>
                {u.status === 'ACTIVE' ? (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-300">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-700 border-rose-300">
                    Suspended
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 text-xs">
                    {u.status === 'ACTIVE' ? (
                      <DropdownMenuItem onClick={() => onOpenSuspend(u)} className="gap-2 text-destructive">
                        <Ban className="w-3.5 h-3.5" />
                        Suspend Account
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onReactivate(u.id, u.name)} className="gap-2 text-emerald-700">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Reactivate Account
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onOpenDelete(u)} className="gap-2 text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Devotee
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
