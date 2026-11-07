import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ChevronDown, ChevronUp, ShieldCheck, UserCheck, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultExpandedSection?: 'devotee' | 'priest';
}

// Terms of Service Modal
// Contains distinct terms for Devotees and Priests.
// Auto-expands the active viewer's role section if authenticated, or starts collapsed for guests.
export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  defaultExpandedSection,
}) => {
  const [devoteeOpen, setDevoteeOpen] = useState(false);
  const [priestOpen, setPriestOpen] = useState(false);

  // Sync expanded section with user role when modal opens
  useEffect(() => {
    if (isOpen) {
      if (defaultExpandedSection === 'devotee') {
        setDevoteeOpen(true);
        setPriestOpen(false);
      } else if (defaultExpandedSection === 'priest') {
        setPriestOpen(true);
        setDevoteeOpen(false);
      } else {
        setDevoteeOpen(false);
        setPriestOpen(false);
      }
    }
  }, [isOpen, defaultExpandedSection]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto p-4 sm:p-6 bg-white text-stone-900 border-2 border-amber-300 shadow-2xl rounded-xl space-y-4">
        <DialogHeader className="pr-8 sm:pr-10 space-y-1 text-left pb-2 border-b border-stone-200">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-amber-100 text-[#780016] text-[11px] font-bold w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Guidelines</span>
          </div>
          <DialogTitle className="text-xl font-serif font-bold text-stone-900">
            Terms of Service
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-600">
            Please review the mutual standards and sacred commitments governing PujaCircle ceremonies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* Section 1: For Devotees */}
          <div className="border border-amber-200 rounded-md overflow-hidden bg-[#FAF7F2]">
            <button
              type="button"
              onClick={() => setDevoteeOpen(!devoteeOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-serif font-bold text-sm text-[#780016] hover:bg-amber-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-700" />
                <span>For Devotees</span>
              </div>
              {devoteeOpen ? (
                <ChevronUp className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              )}
            </button>

            {devoteeOpen && (
              <div className="px-4 pb-4 pt-1 text-xs text-stone-700 space-y-2.5 border-t border-amber-200/60 bg-white">
                <div>
                  <h5 className="font-bold text-stone-900 mb-0.5">1. Booking Conduct & Punctuality</h5>
                  <p className="leading-relaxed text-stone-600">
                    Devotees must provide accurate residence addresses and contact details. Please prepare the puja premises and recommended samagri in advance so the ceremony commences at the agreed auspicious time.
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 mb-0.5">2. Fair Cancellation Policy</h5>
                  <p className="leading-relaxed text-stone-600">
                    Ceremonies can be rescheduled or cancelled with reasonable advance notice. Cancellations made within short notice without emergency justification disrupt scheduled Purohits and may limit future bookings.
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 mb-0.5">3. Honest Ratings & Reviews</h5>
                  <p className="leading-relaxed text-stone-600">
                    Feedback and ratings must reflect genuine ritual experiences. Abusive language, unverified claims, or retaliatory ratings violate community trust and will be moderated.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: For Priests */}
          <div className="border border-amber-200 rounded-md overflow-hidden bg-[#FAF7F2]">
            <button
              type="button"
              onClick={() => setPriestOpen(!priestOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-serif font-bold text-sm text-[#780016] hover:bg-amber-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-700" />
                <span>For Priests (Vedic Purohits)</span>
              </div>
              {priestOpen ? (
                <ChevronUp className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              )}
            </button>

            {priestOpen && (
              <div className="px-4 pb-4 pt-1 text-xs text-stone-700 space-y-2.5 border-t border-amber-200/60 bg-white">
                <div>
                  <h5 className="font-bold text-stone-900 mb-0.5">1. Service Listing & Pricing Accuracy</h5>
                  <p className="leading-relaxed text-stone-600">
                    Purohits must truthfully list their Vedic qualifications, Gurukul background, and transparent dakshina amounts. Demanding unexpected extra payments at the devotee’s residence is strictly prohibited.
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 mb-0.5">2. 100% Cash-Dakshina Conduct</h5>
                  <p className="leading-relaxed text-stone-600">
                    Devotees hand sacred dakshina directly in cash after ritual completion. Priests must uphold ceremonial decorum, perform all stated vidhi steps sincerely, and never solicit digital commission payments.
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 mb-0.5">3. Response-Window Obligations</h5>
                  <p className="leading-relaxed text-stone-600">
                    Priests must review and accept or decline incoming booking requests within the mandatory 5-hour SLA window to ensure devotee certainty. Repeated expirations affect availability rank.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end border-t border-stone-200">
          <Button
            type="button"
            onClick={onClose}
            className="bg-[#780016] hover:bg-[#600012] text-white text-xs font-bold px-5 h-9 rounded-md shadow-xs cursor-pointer"
          >
            Acknowledge & Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
