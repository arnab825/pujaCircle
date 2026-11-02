import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, LogOut, CheckCircle2, Sparkles, XCircle, ArrowRight } from 'lucide-react';

/**
 * PriestPendingApprovalPage
 * Auspicious verification status console for newly onboarded Purohits.
 * 100% Flexbox, pure solid white canvas, Haldi gold trims, zero CSS grids, zero gradients.
 */
export const PriestPendingApprovalPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/priest/login');
  };

  const status = user?.approvalStatus || 'PENDING';

  const verificationSteps = [
    { title: 'Onboarding Application Submitted', status: 'COMPLETED', desc: 'Personal details and credentials received' },
    {
      title: 'Gurukul Lineage & Council Verification',
      status: status === 'APPROVED' ? 'COMPLETED' : status === 'REJECTED' ? 'REJECTED' : 'IN_PROGRESS',
      desc: status === 'REJECTED' ? 'Application rejected by council' : 'Administrative review of Vedic certifications',
    },
    {
      title: 'Direct Telephonic Coordination',
      status: status === 'APPROVED' ? 'COMPLETED' : 'PENDING',
      desc: 'Verification call by senior Acharya coordinator',
    },
    {
      title: 'Devotee Roster Activation',
      status: status === 'APPROVED' ? 'COMPLETED' : 'PENDING',
      desc: 'Live booking availability in your city',
    },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center container max-w-xl px-4 py-10 sm:py-16 text-stone-900">
      <div className="w-full rounded-xl border-2 border-amber-300 bg-white shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className={`p-7 text-center text-white border-b-2 border-amber-400 space-y-3 ${
          status === 'REJECTED' ? 'bg-red-900' : status === 'APPROVED' ? 'bg-emerald-800' : 'bg-[#780016]'
        }`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-amber-400 text-stone-950 shadow-md font-serif font-black text-2xl select-none">
            {status === 'APPROVED' ? '✓' : status === 'REJECTED' ? '✕' : 'ॐ'}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
              {status === 'APPROVED'
                ? 'Your account has been approved.'
                : status === 'REJECTED'
                ? 'Application Rejected'
                : 'Vedic Verification in Progress'}
            </h1>
            <p className="text-xs text-amber-100/90 max-w-sm mx-auto leading-relaxed">
              {status === 'APPROVED'
                ? 'Congratulations, Pandit Ji. Your Vedic qualifications have been verified.'
                : status === 'REJECTED'
                ? 'Your application has been rejected. Please contact the administrator for further information.'
                : 'Your account is waiting for admin approval.'}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 bg-white">
          {/* Registered Scholar Credentials Pill */}
          <div className="p-4 rounded-lg bg-amber-50/70 border-2 border-amber-300 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-600 font-medium">Registered Scholar:</span>
              <strong className="text-stone-950 text-sm font-serif">{user?.name || 'Acharya Pt. Ramesh Sharma'}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600 font-medium">Mobile Contact:</span>
              <span className="font-mono font-bold text-stone-900">{user?.phoneNumber || '+919876543211'}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-amber-200">
              <span className="text-stone-600 font-medium">Current Status:</span>
              {status === 'APPROVED' ? (
                <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-400 font-bold text-[11px] gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-700" /> APPROVED
                </Badge>
              ) : status === 'REJECTED' ? (
                <Badge variant="outline" className="bg-red-100 text-red-900 border-red-400 font-bold text-[11px] gap-1">
                  <XCircle className="h-3 w-3 text-red-700" /> REJECTED
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-400 font-bold text-[11px] gap-1">
                  <Clock className="h-3 w-3 text-amber-700 animate-pulse" /> PENDING REVIEW
                </Badge>
              )}
            </div>
          </div>

          {/* Prominent Status Alert Box */}
          <div className={`p-4 rounded-md border-2 text-xs leading-relaxed ${
            status === 'APPROVED'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : status === 'REJECTED'
              ? 'border-red-300 bg-red-50 text-red-900'
              : 'border-amber-300 bg-amber-50 text-amber-900'
          }`}>
            <p className="font-bold">
              {status === 'APPROVED'
                ? 'Your account has been approved.'
                : status === 'REJECTED'
                ? 'Your application has been rejected. Please contact the administrator for further information.'
                : 'Your account is waiting for admin approval.'}
            </p>
            {user?.banReason && (
              <p className="mt-1 text-[11px] text-red-800">
                <strong>Feedback from Sanctum Council:</strong> {user.banReason}
              </p>
            )}
          </div>

          {/* Verification Roadmap (100% Flexbox) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Verification Roadmap</span>
            </h3>

            <div className="space-y-2.5">
              {verificationSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-md border-2 flex items-start gap-3 transition-all ${
                    step.status === 'COMPLETED'
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : step.status === 'IN_PROGRESS'
                      ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-400/30'
                      : step.status === 'REJECTED'
                      ? 'border-red-300 bg-red-50/50'
                      : 'border-stone-200 bg-white opacity-70'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {step.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : step.status === 'IN_PROGRESS' ? (
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    ) : step.status === 'REJECTED' ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-stone-300" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-stone-900">{step.title}</p>
                    <p className="text-[11px] text-stone-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {status === 'APPROVED' ? (
              <Button
                onClick={() => navigate('/priest/dashboard')}
                className="w-full gap-2 text-xs h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-md shadow-md cursor-pointer"
              >
                <span>Enter Priest Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : null}

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full gap-2 text-xs h-11 rounded-md border-stone-300 hover:border-red-300 hover:text-red-700 font-bold cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Sign Out & Return Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriestPendingApprovalPage;
