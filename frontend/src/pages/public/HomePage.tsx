import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  ScrollText,
  Flame,
} from 'lucide-react';

/**
 * Marketing Landing Page (Unauthenticated Guests)
 * Clean, respectful, and focused on Vedic traditions and home ceremonies.
 */
export const HomePage: React.FC = () => {
  return (
    <div className="space-y-12 sm:space-y-16 md:space-y-20 py-8 sm:py-12 md:py-16 px-4">
      {/* 1. Hero Section */}
      <section className="container max-w-4xl text-center space-y-5 sm:space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] sm:text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>Vetted Vedic Scholars for Home Ceremonies</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground font-serif leading-tight">
          Authentic Vedic Pujas, <br className="hidden sm:inline" />
          Conducted at Your Home
        </h1>

        <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2">
          PujaCircle matches your family with verified, knowledgeable Vedic Purohits across Indian cities. Experience sacred rituals with complete transparency and traditional customs.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2 w-full max-w-xs sm:max-w-none mx-auto">
          <Link to="/auth/user/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-xs sm:text-sm font-medium gap-2 shadow-xs">
              Create Devotee Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth/user/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm font-medium">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust & Proof Badges Strip */}
      <section className="container max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground leading-snug">100% Direct Cash Dakshina</p>
              <p className="text-[11px] text-muted-foreground leading-tight">No Middleman Fee</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
              <Award className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground leading-snug">Gurukul-Certified</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Vetted Purohits</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary shrink-0">
              <ScrollText className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground leading-snug">Samagri Checklist</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Provided for Rituals</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Flame className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground leading-snug">Authentic Mantras</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Vedic Ritual Vidhi</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How PujaCircle Works (3-Step Simplicity) */}
      <section className="container max-w-5xl space-y-8">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
            How PujaCircle Works
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Simple, sacred, and transparent from muhurat to dakshina.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-6 space-y-3.5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                1
              </div>
              <h3 className="font-semibold text-base text-foreground">Select Sacred Ritual</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose from traditional Vedic rituals including Griha Pravesh, Satyanarayan Katha, Rudrabhishek, and Havans.
              </p>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-6 space-y-3.5">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-base">
                2
              </div>
              <h3 className="font-semibold text-base text-foreground">Local Vedic Match</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your location to match with verified Purohits trained in authentic Gurukul traditions in your city.
              </p>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-6 space-y-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-base">
                3
              </div>
              <h3 className="font-semibold text-base text-foreground">Ceremony & Direct Dakshina</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pandit Ji arrives at your home with complete samagri guidance. Direct cash dakshina is offered upon completion.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Frequently Asked Questions (FAQ) */}
      <section className="container max-w-3xl space-y-6">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Find answers to common questions about booking, Purohit verification, and rituals.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          <AccordionItem value="item-1" className="border border-border rounded-xl px-5 bg-card shadow-xs">
            <AccordionTrigger className="text-sm sm:text-base font-semibold hover:no-underline text-foreground">
              How are Purohits verified on PujaCircle?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every Purohit undergoes thorough background verification, including validation of Gurukul education, Vedic lineage, identity documents, and practical mantra recitation proficiency.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border border-border rounded-xl px-5 bg-card shadow-xs">
            <AccordionTrigger className="text-sm sm:text-base font-semibold hover:no-underline text-foreground">
              How does the Dakshina (payment) process work?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              PujaCircle believes in transparent, sacred dakshina. Dakshina is settled directly with the Purohit at your home upon completion of the ceremony, with no hidden platform markups.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border border-border rounded-xl px-5 bg-card shadow-xs">
            <AccordionTrigger className="text-sm sm:text-base font-semibold hover:no-underline text-foreground">
              Will the Purohit provide the Samagri list?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Yes! Once your booking is confirmed, you receive an itemized, authentic samagri checklist tailored to your ceremony and regional customs, along with guidance on preparations.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border border-border rounded-xl px-5 bg-card shadow-xs">
            <AccordionTrigger className="text-sm sm:text-base font-semibold hover:no-underline text-foreground">
              How early should I book a Purohit for auspicious dates/muhurats?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              For major occasions like Griha Pravesh or Vivah rituals, we recommend booking 3 to 7 days in advance to ensure the availability of verified Purohits during auspicious muhurat windows.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border border-border rounded-xl px-5 bg-card shadow-xs">
            <AccordionTrigger className="text-sm sm:text-base font-semibold hover:no-underline text-foreground">
              Can I choose an auspicious Muhurat with the Purohit?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Absolutely. During the booking request, you can specify your preferred date and time or request Muhurat consultation based on your family's Janma Rashi and Panchang.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border border-border rounded-xl px-5 bg-card shadow-xs">
            <AccordionTrigger className="text-sm sm:text-base font-semibold hover:no-underline text-foreground">
              What if I need to reschedule or cancel a booking?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              You can easily manage, reschedule, or cancel your booking directly from your devotee dashboard prior to the ceremony date.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* 4. Ready to Schedule Banner */}
      <section className="container max-w-4xl">
        <div className="rounded-2xl bg-card border border-border p-8 sm:p-10 text-center space-y-4 shadow-xs">
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-foreground">
            Ready to Schedule Your Puja?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Create a devotee account in under 2 minutes to select ritual dates, discover Purohits near you, and manage sacred appointments.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
            <Link to="/auth/user/register">
              <Button size="sm" className="text-xs gap-1.5">
                Register as Devotee <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link to="/auth/priest/register">
              <Button size="sm" variant="outline" className="text-xs">
                Apply as a Purohit
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
