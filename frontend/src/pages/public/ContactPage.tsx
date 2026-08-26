import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Phone, Mail, Clock, MessageSquare } from 'lucide-react';

/**
 * Marketing Contact Us Page (Unauthenticated Guests Only)
 * Purely informational contact directory - direct and simple.
 */
export const ContactPage: React.FC = () => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background bg-grid py-8 sm:py-12 md:py-16 px-4">
      <div className="container max-w-3xl space-y-8 sm:space-y-10">
        {/* 1. Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] sm:text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>Devotee Support & Inquiries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-foreground">
            Contact PujaCircle
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed px-2">
            Need help scheduling a Vedic ritual or applying as a Purohit? Reach our support team directly.
          </p>
        </div>

        {/* 2. Direct Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {/* Helpline */}
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground">Phone Helpline</h3>
                <p className="text-xs text-primary font-mono font-medium">+91 98765 43210</p>
                <p className="text-[11px] text-muted-foreground leading-snug">Direct assistance for muhurats and bookings</p>
              </div>
            </CardContent>
          </Card>

          {/* Email */}
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground">Email Support</h3>
                <p className="text-xs text-secondary font-medium">support@pujacircle.demo</p>
                <p className="text-[11px] text-muted-foreground leading-snug">General inquiries and Purohit verifications</p>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground">Operating Hours</h3>
                <p className="text-xs text-foreground font-medium">Mon – Sun: 6:00 AM – 9:00 PM IST</p>
                <p className="text-[11px] text-muted-foreground leading-snug">Available during sacred morning & evening muhurats</p>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Support */}
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground">WhatsApp Chat</h3>
                <p className="text-xs text-emerald-600 font-mono font-medium">+91 98765 43211</p>
                <p className="text-[11px] text-muted-foreground leading-snug">Quick text support for ritual samagri lists</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
