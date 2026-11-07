import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Privacy Policy Modal
// Outlines data collection, use, protection, and devotee/priest privacy rights.
export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto p-4 sm:p-6 bg-white text-stone-900 border-2 border-amber-300 shadow-2xl rounded-xl space-y-4">
        <DialogHeader className="pr-8 sm:pr-10 space-y-1 text-left pb-2 border-b border-stone-200">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-amber-100 text-[#780016] text-[11px] font-bold w-fit">
            <Lock className="w-3.5 h-3.5" />
            <span>Data Protection & Trust</span>
          </div>
          <DialogTitle className="text-xl font-serif font-bold text-stone-900">
            Privacy Policy
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-600">
            How PujaCircle collects, utilizes, and safeguards devotee and Purohit personal information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1 text-xs text-stone-700 leading-relaxed">
          <section className="space-y-1">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>1. Information We Collect</span>
            </h4>
            <p className="text-stone-600 pl-5">
              We collect contact details (full name, phone number, email address), physical ceremony venue addresses, and ritual preferences for ceremonies. For Purohits, we record Gurukul training qualifications, years of experience, and service pricing.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              <span>2. How We Use Your Data</span>
            </h4>
            <p className="text-stone-600 pl-5">
              Collected information is exclusively utilized to connect devotees with nearby verified Purohits, coordinate punctual ceremony arrivals, generate personalized ritual preparation kits, and maintain appointment records. We do not sell or monetize personal data to commercial advertisers.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>3. Data Retention & Safeguards</span>
            </h4>
            <p className="text-stone-600 pl-5">
              All credentials, session tokens, and communication logs are retained with industry-standard encryption protocols. Venue addresses are only accessible to the assigned Gurukul Purohit during active booking windows.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>4. Your Rights & Account Controls</span>
            </h4>
            <p className="text-stone-600 pl-5">
              Devotees and priests may inspect, update, or remove their saved addresses and profile information at any time via their account settings. You can also request complete account deletion by reaching out through our Contact Help desk.
            </p>
          </section>
        </div>

        <div className="pt-2 flex justify-end border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-[#991B1B] hover:bg-[#780016] rounded-md transition-colors cursor-pointer"
          >
            Close Policy
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyModal;
