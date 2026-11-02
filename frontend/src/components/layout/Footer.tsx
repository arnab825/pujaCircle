import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PujaCircleLogo } from '@/components/common/PujaCircleLogo';
import { useAuthStore } from '@/store/auth.store';
import { TermsModal } from '@/components/legal/TermsModal';
import { PrivacyModal } from '@/components/legal/PrivacyModal';
import { CookiesModal } from '@/components/legal/CookiesModal';

// Footer
// Renders strictly inside PublicLayout (never inside DashboardSidebarShell).
// Content:
// 1. Logo + one-line tagline
// 2. Quick links: About, Contact, Browse Priests
// 3. Short West Bengal service-area line
// 4. Legal row with three modal buttons (Terms, Privacy, Cookies) and copyright line
export const Footer: React.FC = () => {
  const { user } = useAuthStore();
  const [openModal, setOpenModal] = useState<'terms' | 'privacy' | 'cookies' | null>(null);

  const defaultTermsSection: 'devotee' | 'priest' | undefined =
    user?.role === 'PRIEST' ? 'priest' : user?.role === 'USER' ? 'devotee' : undefined;

  return (
    <footer className="relative z-20 border-t-2 border-amber-300/90 bg-[#FAF7F2] text-stone-900 mt-auto shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-amber-200/80 pb-8">
          {/* Brand Logo & One-line Tagline */}
          <div className="space-y-2 max-w-md">
            <Link to="/" className="flex items-center gap-2.5 select-none shrink-0 group">
              <PujaCircleLogo size={32} className="shadow-xs transition-transform group-hover:scale-105" />
              <span className="font-serif font-black text-xl text-stone-950 tracking-tight">
                Puja<span className="text-[#991B1B] font-sans font-bold">Circle</span>
              </span>
            </Link>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Connecting families with verified Gurukul-trained Vedic scholars across West Bengal with transparent dakshina.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-stone-700">
            <Link to="/about" className="hover:text-[#991B1B] transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-[#991B1B] transition-colors">
              Contact
            </Link>
            {user?.role === 'USER' && (
              <Link to="/priests" className="hover:text-[#991B1B] transition-colors">
                Browse Priests
              </Link>
            )}
          </div>
        </div>

        {/* Service Area Notice */}
        <div className="py-4 border-b border-amber-200/60 text-[11px] text-stone-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>
            📍 <strong>Service Area:</strong> Serving Kolkata, Howrah, North & South 24 Parganas, Hooghly, Nadia, and districts across West Bengal.
          </span>
          <span className="text-stone-500 font-medium">
            100% Direct Cash Dakshina after ritual completion
          </span>
        </div>

        {/* Legal Row & Copyright Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
          <div>
            © {new Date().getFullYear()} PujaCircle Technologies. All rights reserved.
          </div>

          <div className="flex items-center gap-5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setOpenModal('terms')}
              className="text-stone-700 hover:text-[#991B1B] transition-colors cursor-pointer underline-offset-4 hover:underline"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setOpenModal('privacy')}
              className="text-stone-700 hover:text-[#991B1B] transition-colors cursor-pointer underline-offset-4 hover:underline"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setOpenModal('cookies')}
              className="text-stone-700 hover:text-[#991B1B] transition-colors cursor-pointer underline-offset-4 hover:underline"
            >
              Cookie Policy
            </button>
          </div>
        </div>
      </div>

      {/* Legal Modals */}
      <TermsModal
        isOpen={openModal === 'terms'}
        onClose={() => setOpenModal(null)}
        defaultExpandedSection={defaultTermsSection}
      />
      <PrivacyModal
        isOpen={openModal === 'privacy'}
        onClose={() => setOpenModal(null)}
      />
      <CookiesModal
        isOpen={openModal === 'cookies'}
        onClose={() => setOpenModal(null)}
      />
    </footer>
  );
};

export default Footer;
