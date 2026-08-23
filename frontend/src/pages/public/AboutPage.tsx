import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { APP_CONFIG } from '@/lib/constants';
import { Sparkles, Shield, Heart } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="container py-12 max-w-4xl space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-foreground">About {APP_CONFIG.APP_NAME}</h1>
        <p className="text-lg text-muted-foreground">{APP_CONFIG.TAGLINE}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            In today's fast-moving urban life, arranging traditional religious rituals according to Vedic protocols can be stressful and uncertain. Finding genuine, verified purohits who understand your family's regional traditions, languages, and timings is challenging.
          </p>
          <p>
            PujaCircle bridges this gap by providing an authentic, transparent platform where urban devotees can easily connect with verified Vedic scholars for pujas, ceremonies, and house warmings.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Authenticity & Trust
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            All priests registered on PujaCircle undergo rigorous profile review and background verification by our admin team before being approved.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" /> Respect for Tradition
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            We preserve traditional sanctity. Devotees offer dakshina directly in offline cash to the priest following ancient customary practices.
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
