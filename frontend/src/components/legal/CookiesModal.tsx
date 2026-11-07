import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Cookie, Settings, CheckCircle2 } from 'lucide-react';

export interface CookiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Cookie Policy Modal
// Describes local storage, session cookies, and user control over storage tokens.
export const CookiesModal: React.FC<CookiesModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto p-4 sm:p-6 bg-white text-stone-900 border-2 border-amber-300 shadow-2xl rounded-xl space-y-4">
        <DialogHeader className="pr-8 sm:pr-10 space-y-1 text-left pb-2 border-b border-stone-200">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-amber-100 text-[#780016] text-[11px] font-bold w-fit">
            <Cookie className="w-3.5 h-3.5" />
            <span>Browser Preferences</span>
          </div>
          <DialogTitle className="text-xl font-serif font-bold text-stone-900">
            Cookie & Storage Policy
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-600">
            Learn how PujaCircle utilizes cookies and local browser storage to provide a seamless ritual experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1 text-xs text-stone-700 leading-relaxed">
          <section className="space-y-1">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <Cookie className="w-3.5 h-3.5 text-amber-700" />
              <span>1. What Are Cookies and Local Storage?</span>
            </h4>
            <p className="text-stone-600 pl-5">
              Cookies and local browser storage are small text tokens retained securely in your web browser. They preserve your login session, prevent repeated credential entry, and store offline preparation checklists for rituals.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
              <span>2. Essential Functional Storage We Use</span>
            </h4>
            <div className="text-stone-600 pl-5 space-y-1.5">
              <p>
                • <strong>Authentication Tokens:</strong> Retains active login state across page refreshes for devotees and priests.
              </p>
              <p>
                • <strong>Search & Location Filters:</strong> Caches West Bengal district filters to streamline finding nearby Purohits.
              </p>
            </div>
          </section>

          <section className="space-y-1">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <Settings className="w-3.5 h-3.5 text-amber-700" />
              <span>3. Managing Your Preferences</span>
            </h4>
            <p className="text-stone-600 pl-5">
              You may clear your browser cookies and local storage tokens at any time via your browser settings. Please note that clearing essential storage will require you to re-enter your login credentials upon your next visit.
            </p>
          </section>
        </div>

        <div className="pt-2 flex justify-end border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-[#991B1B] hover:bg-[#780016] rounded-md transition-colors cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookiesModal;
