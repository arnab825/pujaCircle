import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, CalendarCheck, ShieldCheck, HeartHandshake } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 md:py-24 border-b">
        <div className="container flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>PujaCircle Platform Scaffolding Active</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            Traditional Vedic Rituals, <br />
            <span className="text-primary">Made Easier for Modern India</span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground">
            Connect with verified, knowledgeable Vedic purohits and pandits for auspicious ceremonies, Griha Pravesh, and home pujas across Indian cities.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/priests">
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-all">
                Find Verified Priests
              </Button>
            </Link>
            <Link to="/rituals">
              <Button variant="outline" size="lg">
                Explore Rituals & Pujas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle>Verified Purohits</CardTitle>
              <CardDescription>
                Every priest undergoes credential review and Vedic lineage verification.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <CardTitle>Auspicious Muhurat Booking</CardTitle>
              <CardDescription>
                Select convenient morning or evening slots tailored to your family's astrological timing.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <CardTitle>Direct Offline Dakshina</CardTitle>
              <CardDescription>
                No online payment processing hassle. Offer dakshina directly to the priest after the ceremony.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
