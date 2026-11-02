import React from 'react';
import { Priest } from '@/types/priest.types';
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
import { Link } from 'react-router-dom';
import { Check, XCircle, Ban, Trash2, MoreVertical, Eye, ShieldCheck, MapPin } from 'lucide-react';

interface PriestApprovalTableProps {
  priests: Priest[];
  onApprove: (priestId: string) => void;
  onOpenReject: (priest: Priest) => void;
  onOpenBan: (priest: Priest) => void;
  onUnban: (priestId: string) => void;
  onOpenDelete: (priest: Priest) => void;
  isProcessing?: boolean;
}

export const PriestApprovalTable: React.FC<PriestApprovalTableProps> = ({
  priests,
  onApprove,
  onOpenReject,
  onOpenBan,
  onUnban,
  onOpenDelete,
  isProcessing = false,
}) => {
  return (
    <div className="rounded-lg border border-amber-300/80 bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-amber-50/70 border-b border-amber-200/80 hover:bg-amber-50/70">
            <TableHead className="text-xs font-bold text-stone-900 py-3.5 pl-5">Purohit / Identity</TableHead>
            <TableHead className="text-xs font-bold text-stone-900 py-3.5">Location</TableHead>
            <TableHead className="text-xs font-bold text-stone-900 py-3.5">Experience</TableHead>
            <TableHead className="text-xs font-bold text-stone-900 py-3.5">Verification & Status</TableHead>
            <TableHead className="text-xs font-bold text-stone-900 py-3.5 pr-4 text-right w-60">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {priests.map((p) => {
            const isBanned = p.accountStatus === 'BANNED';
            const priestAvatar =
              p.profileImageUrl ||
              (p as any).avatarUrl ||
              (typeof window !== 'undefined'
                ? localStorage.getItem(`priest_avatar_${p.id}`) ||
                  localStorage.getItem(`priest_avatar_${(p as any).userId}`)
                : null);
            const pInitials = p.fullName
              ? p.fullName
                  .split(' ')
                  .filter(Boolean)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'PR';

            return (
              <TableRow key={p.id} className="text-xs border-b border-stone-100 hover:bg-amber-50/30 transition-colors">
                <TableCell className="font-medium py-3.5 pl-5">
                  <div className="flex items-center gap-3">
                    {priestAvatar ? (
                      <img
                        src={priestAvatar}
                        alt={p.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-xs shrink-0 bg-amber-50"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#780016] text-amber-300 border-2 border-amber-400 flex items-center justify-center font-bold text-xs shrink-0 font-serif shadow-xs">
                        {pInitials}
                      </div>
                    )}
                    <div>
                      <Link
                        to={`/admin/priests/${p.id}`}
                        className="font-bold text-stone-950 font-serif text-sm hover:text-[#780016] transition-colors block"
                      >
                        {p.fullName}
                      </Link>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">{p.phoneNumber}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      {p.city}, {p.state}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <span className="font-semibold text-stone-800">{p.experienceYears || 5}+ yrs</span>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {p.approvalStatus === 'APPROVED' && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border-emerald-300"
                      >
                        Approved
                      </Badge>
                    )}
                    {p.approvalStatus === 'PENDING' && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold bg-amber-50 text-amber-800 border-amber-300"
                      >
                        Pending Review
                      </Badge>
                    )}
                    {p.approvalStatus === 'REJECTED' && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold bg-red-50 text-red-800 border-red-300"
                      >
                        Rejected
                      </Badge>
                    )}
                    {isBanned && (
                      <Badge
                        className="text-[10px] uppercase font-bold bg-red-800 text-white hover:bg-red-800"
                      >
                        Banned
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right py-3.5 pr-4 w-60">
                  <div className="flex items-center justify-end gap-2 min-h-8">
                    {/* Quick Actions Slot — fixed width so Eye & Dots always align */}
                    <div className="min-w-38 flex items-center justify-end">
                      {p.approvalStatus === 'PENDING' && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => onApprove(p.id)}
                            disabled={isProcessing}
                            className="h-8 text-xs px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-1 rounded-md shadow-xs cursor-pointer puja-btn-tap"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenReject(p)}
                            disabled={isProcessing}
                            className="h-8 text-xs px-2.5 text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 font-bold gap-1 rounded-md cursor-pointer puja-btn-tap"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* View Dossier (Eye) - Stays in the exact same vertical line for every row */}
                    <Link to={`/admin/priests/${p.id}`} className="shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-md hover:bg-amber-100/70 hover:text-stone-900 cursor-pointer"
                        title="View Dossier"
                      >
                        <Eye className="w-4 h-4 text-stone-500 hover:text-stone-800" />
                      </Button>
                    </Link>

                    {/* More Actions (Vertical Dots) - Stays in the exact same vertical line for every row */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-md hover:bg-amber-100/70 text-stone-500 hover:text-stone-800 cursor-pointer shrink-0"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs rounded-lg border-amber-200 shadow-md">
                        {isBanned ? (
                          <DropdownMenuItem onClick={() => onUnban(p.id)} className="gap-2 text-emerald-700 font-medium cursor-pointer">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Unban Priest
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onOpenBan(p)} className="gap-2 text-red-700 font-medium cursor-pointer">
                            <Ban className="w-3.5 h-3.5" />
                            Ban Priest
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-stone-100" />
                        <DropdownMenuItem onClick={() => onOpenDelete(p)} className="gap-2 text-red-700 font-medium cursor-pointer">
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
