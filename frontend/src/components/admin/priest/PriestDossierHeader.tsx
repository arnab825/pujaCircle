import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Ban,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Priest, PriestApprovalStatus } from '@/types/priest.types';

interface PriestDossierHeaderProps {
  priest: Priest;
  onApprove: () => void;
  onOpenReject: () => void;
  onOpenBan: () => void;
  onLiftBan: () => void;
  onReopen: () => void;
  onOpenDelete: () => void;
}

/**
 * ============================================================================
 * [COMPONENT: PRIEST DOSSIER HEADER]
 * Administrative dossier overview with scholar avatar, credentials, status badges,
 * and lifecycle control buttons (Approve, Reject, Ban, Reactivate, Delete).
 * ============================================================================
 */
export const PriestDossierHeader: React.FC<PriestDossierHeaderProps> = ({
  priest,
  onApprove,
  onOpenReject,
  onOpenBan,
  onLiftBan,
  onReopen,
  onOpenDelete,
}) => {
  const getStatusBadge = (approvalStatus: PriestApprovalStatus, accountStatus: string) => {
    return (
      <div className="flex items-center gap-1.5">
        {approvalStatus === 'APPROVED' && accountStatus === 'ACTIVE' && (
          <Badge className="bg-emerald-600 text-white text-xs px-3 py-1 gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved & Active
          </Badge>
        )}
        {approvalStatus === 'PENDING' && (
          <Badge
            variant="outline"
            className="border-amber-400 text-amber-900 bg-amber-100 text-xs px-3 py-1 gap-1 font-bold"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            Pending Review
          </Badge>
        )}
        {approvalStatus === 'REJECTED' && (
          <Badge variant="destructive" className="text-xs px-3 py-1 gap-1 font-bold bg-rose-600">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </Badge>
        )}
        {accountStatus === 'BANNED' && (
          <Badge
            variant="destructive"
            className="text-xs px-3 py-1 gap-1 font-bold bg-stone-800 text-white"
          >
            <Ban className="w-3.5 h-3.5" />
            Suspended / Banned
          </Badge>
        )}
      </div>
    );
  };

  const avatarSrc = priest.profileImageUrl || priest.avatarUrl;
  const ratingValue = Number(priest.rating || 0);

  return (
    <div className="space-y-4">
      {/* 1. Scholar Identity & Status Header */}
      <div className="border-2 border-amber-400 bg-white shadow-md rounded-xl sm:rounded-2xl overflow-hidden p-4 sm:p-7 relative">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 min-w-0 w-full sm:w-auto">
            <div className="relative shrink-0">
              <div className="relative block p-1 rounded-full ring-4 ring-amber-400 bg-amber-100 shadow-sm">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={priest.fullName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-xs shrink-0 bg-amber-50"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#780016] text-amber-300 border-2 border-white flex items-center justify-center font-bold text-xl sm:text-2xl font-serif shrink-0 shadow-xs">
                    {priest.fullName
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              {priest.approvalStatus === 'APPROVED' && (
                <div
                  className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-1 border-2 border-white shadow-xs pointer-events-none"
                  title="Approved Vedic Scholar"
                >
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              )}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-3xl font-extrabold font-serif text-stone-950 wrap-break-word">
                  {priest.fullName}
                </h1>
                {getStatusBadge(priest.approvalStatus, priest.accountStatus)}
              </div>
              <p className="text-xs text-stone-600 font-medium">
                Title / Honorific:{' '}
                <span className="font-bold text-stone-900">
                  {priest.displayName || priest.fullName}
                </span>
              </p>
              <p className="text-[11px] text-stone-500 font-mono break-all">
                Scholar ID: {priest.id} • Registered:{' '}
                {new Date(priest.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-amber-200 text-xs">
          <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200">
            <span className="text-stone-500 font-bold block mb-0.5">Vedic Experience</span>
            <span className="font-extrabold text-stone-900 text-sm">
              {priest.experienceYears} Years
            </span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200">
            <span className="text-stone-500 font-bold block mb-0.5">Devotee Rating</span>
            <span className="font-extrabold text-stone-900 text-sm flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {ratingValue > 0 ? ratingValue.toFixed(1) : 'Unrated'}
            </span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200">
            <span className="text-stone-500 font-bold block mb-0.5">Primary Location</span>
            <span className="font-extrabold text-stone-900 text-xs truncate block">
              {priest.city || 'Not specified'}
            </span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200">
            <span className="text-stone-500 font-bold block mb-0.5">Vedic Languages</span>
            <span className="font-extrabold text-stone-900 text-xs truncate block">
              {priest.languages?.length || 0} Registered
            </span>
          </div>
        </div>
      </div>

      {/* 2. Administrative Action Bar */}
      <div className="border-2 border-amber-400 bg-white shadow-sm rounded-xl p-4 sm:p-7 space-y-3">
        <div>
          <h3 className="text-base font-serif font-bold text-stone-950">
            Administrative Actions & Lifecycle Control
          </h3>
          <p className="text-xs text-stone-600">
            Manage application verification state, handle disciplinary suspensions, or permanently remove profile.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-amber-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {/* If PENDING: Approve / Reject */}
            {priest.approvalStatus === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  onClick={onApprove}
                  className="w-full sm:w-auto text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-5 rounded-md gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Application
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenReject}
                  className="w-full sm:w-auto text-xs text-red-700 hover:bg-red-50 border-red-200 font-bold h-10 px-4 rounded-md gap-1.5 cursor-pointer"
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
                onClick={onOpenBan}
                className="w-full sm:w-auto text-xs h-10 px-4 rounded-md font-bold gap-1.5 cursor-pointer bg-rose-600 hover:bg-rose-700"
              >
                <Ban className="w-4 h-4" />
                Ban Priest Account
              </Button>
            )}

            {/* If BANNED: Lift Ban Option */}
            {priest.accountStatus === 'BANNED' && (
              <Button
                size="sm"
                onClick={onLiftBan}
                className="w-full sm:w-auto text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-5 rounded-md gap-1.5 cursor-pointer"
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
                onClick={onReopen}
                className="w-full sm:w-auto text-xs gap-1.5 h-10 px-4 rounded-md font-bold border-stone-300"
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
            onClick={onOpenDelete}
            className="w-full sm:w-auto text-xs text-red-700 hover:bg-red-50 gap-1.5 h-10 px-3 rounded-md font-bold cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Priest Profile
          </Button>
        </div>
      </div>
    </div>
  );
};
