import React from 'react';
import { Link } from 'react-router-dom';
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
import { Ban, Trash2, MoreVertical, ShieldCheck, Mail, Phone, Calendar, Eye } from 'lucide-react';

export interface DevoteeRecord {
  id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED';
  bookingCount?: number;
  createdAt?: string;
  banReason?: string;
  avatarUrl?: string;
}

interface UserManagementTableProps {
  users: DevoteeRecord[];
  onViewDetails?: (user: DevoteeRecord) => void;
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
    <div className="rounded-xl border-2 border-amber-300/80 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-amber-50/60 border-b border-amber-200">
            <TableHead className="text-xs font-bold text-stone-800">Devotee</TableHead>
            <TableHead className="text-xs font-bold text-stone-800">Contact</TableHead>
            <TableHead className="text-xs font-bold text-stone-800">Ceremonies</TableHead>
            <TableHead className="text-xs font-bold text-stone-800">Joined</TableHead>
            <TableHead className="text-xs font-bold text-stone-800">Status</TableHead>
            <TableHead className="text-xs font-bold text-stone-800 text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => {
            const initials = u.name
              ? u.name
                  .split(' ')
                  .filter(Boolean)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'DV';

            const effectiveAvatar =
              u.avatarUrl ||
              (typeof window !== 'undefined'
                ? localStorage.getItem(`devotee_avatar_${u.id}`)
                : null);

            return (
              <TableRow
                key={u.id}
                className="text-xs hover:bg-amber-50/40 transition-colors border-b border-stone-100 last:border-b-0"
              >
                <TableCell className="font-medium py-3.5">
                  <div className="flex items-center gap-3">
                    {effectiveAvatar ? (
                      <img
                        src={effectiveAvatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-amber-400 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#780016] text-amber-300 border-2 border-amber-400 flex items-center justify-center font-bold text-xs shrink-0 font-serif shadow-xs">
                        {initials}
                      </div>
                    )}
                    <div>
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="font-bold text-stone-900 hover:text-[#780016] text-left transition-colors cursor-pointer block font-serif"
                      >
                        {u.name}
                      </Link>
                      <p className="text-[10px] text-stone-500 font-mono">ID: {u.id.slice(0, 8)}...{u.id.slice(-4)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="space-y-1 text-stone-600">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-amber-700 shrink-0" />
                      <span>{u.phoneNumber}</span>
                    </div>
                    {u.email && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Mail className="w-3 h-3 text-amber-700 shrink-0" />
                        <span className="truncate max-w-44">{u.email}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-1.5 font-medium text-stone-700">
                    <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{u.bookingCount || 0} booked</span>
                  </div>
                </TableCell>
                <TableCell className="text-stone-600 py-3.5">
                  {u.createdAt ? formatDate(u.createdAt) : 'Recent'}
                </TableCell>
                <TableCell className="py-3.5">
                  {u.status === 'ACTIVE' ? (
                    <Badge variant="outline" className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-300">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] font-bold bg-rose-50 text-rose-700 border-rose-300">
                      Suspended
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right py-3.5 pr-4">
                  <div className="inline-flex items-center gap-1">
                    <Link to={`/admin/users/${u.id}`} className="shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View Devotee Dossier"
                        className="h-8 w-8 p-0 text-stone-600 hover:text-[#780016] hover:bg-amber-100 rounded-md cursor-pointer transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 text-xs border-amber-200 shadow-md">
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/users/${u.id}`} className="gap-2 cursor-pointer font-medium flex items-center">
                            <Eye className="w-3.5 h-3.5 text-amber-700" />
                            View Full Dossier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {u.status === 'ACTIVE' ? (
                          <DropdownMenuItem onClick={() => onOpenSuspend(u)} className="gap-2 text-rose-700 cursor-pointer font-medium">
                            <Ban className="w-3.5 h-3.5" />
                            Suspend Account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onReactivate(u.id, u.name)} className="gap-2 text-emerald-700 cursor-pointer font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Reactivate Account
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onOpenDelete(u)} className="gap-2 text-rose-700 cursor-pointer font-medium">
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
  );
};
