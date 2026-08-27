import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PujaCircleLogo } from "@/components/common/PujaCircleLogo";
import { APP_CONFIG } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type PolicyType = "terms" | "privacy" | "cookies" | null;

const POLICY_CONTENT = {
  terms: {
    title: "Terms of Service",
    description: "Guidelines and principles for devotees and Vedic Purohits on PujaCircle.",
    content: (
      <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
        <p>
          <strong className="text-foreground">1. Platform Nature:</strong> PujaCircle is a technology platform connecting devotees with verified, knowledgeable Vedic Purohits for spiritual ceremonies and pujas across Indian cities.
        </p>
        <p>
          <strong className="text-foreground">2. Sacred Dakshina:</strong> Dakshina amounts listed are transparent suggestions. Full dakshina is offered directly in cash to Pandit Ji upon ceremony completion with zero commission deductions.
        </p>
        <p>
          <strong className="text-foreground">3. Respectful Conduct:</strong> All parties agree to maintain mutual respect, honor traditional Vedic Vidhi, and notify in advance for any unavoidable ceremony reschedules.
        </p>
      </div>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    description: "How your personal information and ceremony addresses are protected.",
    content: (
      <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
        <p>
          <strong className="text-foreground">1. Data Collected:</strong> We collect your mobile number, optional email, and ceremony address solely for ritual coordination and Purohit travel dispatch.
        </p>
        <p>
          <strong className="text-foreground">2. Security:</strong> All communications and personal details are encrypted. We never sell, rent, or trade your personal information to third-party marketing services.
        </p>
        <p>
          <strong className="text-foreground">3. Address Privacy:</strong> Your detailed residential address is only shared with the assigned Purohit once a ceremony booking request is confirmed.
        </p>
      </div>
    ),
  },
  cookies: {
    title: "Cookie Policy",
    description: "Information regarding essential cookies used on PujaCircle.",
    content: (
      <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
        <p>
          <strong className="text-foreground">1. Essential Cookies:</strong> We only use secure, HTTP-only session cookies necessary for maintaining authenticated login state, security tokens, and user preferences.
        </p>
        <p>
          <strong className="text-foreground">2. No Ad Trackers:</strong> PujaCircle does not employ intrusive third-party cross-site advertising or behavioral tracking cookies.
        </p>
      </div>
    ),
  },
};

/**
 * Minimalist Website Footer
 * Features:
 * - Brand Logo & Title (Left)
 * - Centered Copyright Notice (Center)
 * - Basic Modal Dialogs for Terms, Privacy, and Cookies (Right)
 */
export const Footer: React.FC = () => {
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  const currentPolicy = activePolicy ? POLICY_CONTENT[activePolicy] : null;

  return (
    <footer className="border-t border-border/80 bg-background text-muted-foreground mt-auto py-5 sm:py-6">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* 1. Left: Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group select-none shrink-0"
        >
          <PujaCircleLogo size={26} className="shadow-xs transition-transform group-hover:scale-105" />
          <span className="font-serif font-bold text-sm text-foreground tracking-tight">
            Puja<span className="text-primary font-sans">Circle</span>
          </span>
        </Link>

        {/* 2. Center: Copyright */}
        <div className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} {APP_CONFIG.APP_NAME}. All rights reserved.
        </div>

        {/* 3. Right: Legal / Policy Dialog Triggers */}
        <div className="flex items-center gap-5 sm:gap-6 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActivePolicy("terms")}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Terms
          </button>
          <button
            type="button"
            onClick={() => setActivePolicy("privacy")}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Privacy
          </button>
          <button
            type="button"
            onClick={() => setActivePolicy("cookies")}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Cookies
          </button>
        </div>
      </div>

      {/* Basic Policy Dialog */}
      <Dialog open={activePolicy !== null} onOpenChange={(open) => !open && setActivePolicy(null)}>
        <DialogContent className="max-w-md p-6 bg-card border-border/90 shadow-lg sm:rounded-lg">
          <DialogHeader className="space-y-1 text-left pb-2">
            <DialogTitle className="text-lg font-bold font-serif text-foreground">
              {currentPolicy?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {currentPolicy?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 border-t border-border/60">
            {currentPolicy?.content}
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default Footer;
