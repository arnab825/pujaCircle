import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ShieldCheck, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';

/**
 * Marketing About Us Page (Unauthenticated Guests Only)
 * Short, sweet, and focused on trust and platform mission.
 */
export const AboutPage: React.FC = () => {
  return (
    <div className="container max-w-4xl py-10 md:py-16 space-y-12 px-4">
      {/* 1. Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Our Sacred Mission</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
          About PujaCircle
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          PujaCircle was founded to preserve authentic Vedic traditions and connect devotees with verified, knowledgeable Purohits across Indian cities.
        </p>
      </div>

      {/* 2. Three Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Vetted Vedic Scholars</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every Purohit is verified for Gurukul lineage, ritual knowledge, and community reputation before onboarding.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Direct Cash Dakshina</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Full sacred dakshina is offered directly in cash to Pandit Ji upon ceremony completion with zero commission deductions.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Complete Samagri Guidance</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Detailed ritual checklists and preparations provided in advance so families can celebrate peacefully.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. CTA Box */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 text-center space-y-3.5 shadow-xs">
        <h3 className="text-base sm:text-lg font-bold text-foreground font-serif">Begin Your Spiritual Journey</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Create an account to browse available ceremonies and match with Purohits in your locality.
        </p>
        <div className="flex justify-center gap-3 pt-1">
          <Link to="/auth/user/register">
            <Button size="sm" className="text-xs gap-1.5">
              Create Devotee Account <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link to="/auth/user/login">
            <Button size="sm" variant="outline" className="text-xs">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
