import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Phone, Mail, Clock, MessageSquare } from 'lucide-react';

/**
 * Marketing Contact Us Page (Unauthenticated Guests Only)
 * Purely informational contact directory - direct and simple.
 */
export const ContactPage: React.FC = () => {
  return (
    <div className="container max-w-3xl py-10 md:py-16 space-y-10 px-4">
      {/* 1. Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Devotee Support & Inquiries</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
          Contact PujaCircle
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Need help scheduling a Vedic ritual or applying as a Purohit? Reach our support team directly.
        </p>
      </div>

      {/* 2. Direct Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Helpline */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-foreground">Phone Helpline</h3>
              <p className="text-xs text-primary font-mono font-medium">+91 98765 43210</p>
              <p className="text-[11px] text-muted-foreground">Direct assistance for muhurats and bookings</p>
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-foreground">Email Support</h3>
              <p className="text-xs text-secondary font-medium">support@pujacircle.demo</p>
              <p className="text-[11px] text-muted-foreground">General inquiries and Purohit verifications</p>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-foreground">Operating Hours</h3>
              <p className="text-xs text-foreground font-medium">Mon – Sun: 6:00 AM – 9:00 PM IST</p>
              <p className="text-[11px] text-muted-foreground">Available during sacred morning & evening muhurats</p>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Support */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-foreground">WhatsApp Chat</h3>
              <p className="text-xs text-emerald-600 font-mono font-medium">+91 98765 43211</p>
              <p className="text-[11px] text-muted-foreground">Quick text support for ritual samagri lists</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
