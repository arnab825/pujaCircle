import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Flame,
  ShieldCheck,
  Calendar,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react';

/**
 * Marketing Landing Page (Unauthenticated Guests)
 * Clean, respectful, and focused on Vedic traditions and home ceremonies.
 */
export const HomePage: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-20 py-10 md:py-16 px-4">
      {/* 1. Hero Section */}
      <section className="container max-w-4xl text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Vetted Vedic Scholars for Home Ceremonies</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground font-serif leading-tight">
          Authentic Vedic Pujas, <br className="hidden sm:inline" />
          Conducted at Your Home
        </h1>

        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          PujaCircle matches your family with verified, knowledgeable Vedic Purohits across Indian cities. Experience sacred rituals with complete transparency and traditional customs.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
          <Link to="/auth/user/register">
            <Button size="lg" className="text-xs sm:text-sm font-medium gap-2 shadow-xs">
              Create Devotee Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth/user/login">
            <Button size="lg" variant="outline" className="text-xs sm:text-sm font-medium">
              Sign In
            </Button>
          </Link>
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

      {/* 3. Popular Vedic Ceremonies */}
      <section className="container max-w-5xl space-y-8">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
            Popular Vedic Ceremonies
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Conducted by vetted Purohits with authentic mantras and samagri lists.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Griha Pravesh Puja',
              duration: '3 - 4 Hours',
              tag: 'New Home Blessing',
              icon: Flame,
            },
            {
              title: 'Satyanarayan Katha',
              duration: '2 - 3 Hours',
              tag: 'Prosperity & Peace',
              icon: Sparkles,
            },
            {
              title: 'Maha Rudrabhishek',
              duration: '2.5 Hours',
              tag: 'Shiva Aradhana',
              icon: ShieldCheck,
            },
            {
              title: 'Ganapati Havan',
              duration: '2 Hours',
              tag: 'Auspicious Start',
              icon: HeartHandshake,
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Card key={i} className="border-border bg-card shadow-xs">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] font-medium bg-primary/10 text-primary border-primary/20">
                      {item.tag}
                    </Badge>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{item.duration}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
