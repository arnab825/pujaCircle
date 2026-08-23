import React from 'react';

/*
  PAGE: About PujaCircle
  
  ACCESS:
  - Public / Visitor / USER
  
  PURPOSE:
  - Explains the mission of PujaCircle to preserve traditional Vedic samskaras and connect devotees with verified Gurukul-trained Purohits.
  
  FUTURE CONTENT:
  - Mission statement & Vedic philosophy.
  - Vetting criteria for Purohits (Vedic samhita qualifications, identity verification).
  - Traditional dakshina transparency policy.
  
  DATA SOURCE:
  - Static marketing content.
*/
const AboutPage: React.FC = () => {
  return (
    <div className="container max-w-3xl py-12 space-y-6">
      <h1 className="text-3xl font-bold font-serif text-foreground">About PujaCircle 🕉️</h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        PujaCircle is dedicated to bringing authentic Vedic rituals, ceremonies, and experienced Purohits to households across India.
      </p>
      
      {/* TODO: Add team vision, Vedic tradition standards, and purity assurance sections */}
    </div>
  );
};

export default AboutPage;
