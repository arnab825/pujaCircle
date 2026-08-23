import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '@/lib/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-muted/40 text-muted-foreground mt-auto">
      <div className="container py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-foreground">{APP_CONFIG.APP_NAME}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {APP_CONFIG.TAGLINE}. Connecting devotees with verified Vedic scholars across Indian cities.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Popular Rituals</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/rituals" className="hover:text-primary">Griha Pravesh</Link></li>
              <li><Link to="/rituals" className="hover:text-primary">Satyanarayan Katha</Link></li>
              <li><Link to="/rituals" className="hover:text-primary">Maha Rudrabhishek</Link></li>
              <li><Link to="/rituals" className="hover:text-primary">Ganapati Havan</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">For Priests</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/priest/register" className="hover:text-primary">Join as a Purohit</Link></li>
              <li><Link to="/priest/dashboard" className="hover:text-primary">Priest Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
              <li><Link to="/about" className="hover:text-primary">About Platform</Link></li>
              <li className="text-xs text-muted-foreground pt-2">Offline Cash payment to Purohit directly.</li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_CONFIG.APP_NAME}. All rights reserved. Made for India.
        </div>
      </div>
    </footer>
  );
};
