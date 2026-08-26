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
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs">Purohit / Identity</TableHead>
            <TableHead className="text-xs">Location</TableHead>
            <TableHead className="text-xs">Experience</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {priests.map((p) => (
            <TableRow key={p.id} className="text-xs">
              <TableCell className="font-medium">
                <div>
                  <p className="font-bold text-foreground">{p.fullName}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{p.phoneNumber}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{p.city}, {p.state}</span>
                </div>
              </TableCell>
              <TableCell>
                <span>{p.experienceYears || 5}+ yrs</span>
              </TableCell>
              <TableCell>
                {p.approvalStatus === 'APPROVED' && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-300">
                    Approved
                  </Badge>
                )}
                {p.approvalStatus === 'PENDING' && (
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-300">
                    Pending
                  </Badge>
                )}
                {p.approvalStatus === 'REJECTED' && (
                  <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                    Rejected
                  </Badge>
                )}
                {p.approvalStatus === 'BANNED' && (
                  <Badge variant="outline" className="text-[10px] bg-zinc-500/10 text-zinc-700 border-zinc-300">
                    Banned
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Link to={`/admin/priests/${p.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </Link>

                  {p.approvalStatus === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onApprove(p.id)}
                        disabled={isProcessing}
                        className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenReject(p)}
                        disabled={isProcessing}
                        className="h-7 text-xs px-2.5 text-destructive hover:text-destructive border-destructive/30 gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                    </>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 text-xs">
                      {p.approvalStatus === 'BANNED' ? (
                        <DropdownMenuItem onClick={() => onUnban(p.id)} className="gap-2 text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Unban Purohit
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onOpenBan(p)} className="gap-2 text-destructive">
                          <Ban className="w-3.5 h-3.5" />
                          Ban Purohit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onOpenDelete(p)} className="gap-2 text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Record
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
  );
};
