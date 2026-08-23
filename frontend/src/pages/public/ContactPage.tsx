import React from 'react';

/*
  PAGE: Contact Us
  
  ACCESS:
  - Public / Visitor / USER
  
  PURPOSE:
  - Provide support channels for devotees and purohits (support email, helpline, FAQs).
  
  FUTURE CONTENT:
  - Support contact form (Name, Email, Message).
  - Help desk email: support@pujacircle.demo
  - FAQ list for common ritual inquiries.
  
  DATA SOURCE:
  - Static support details.
  - Future: POST /api/v1/support/inquiry
*/
const ContactPage: React.FC = () => {
  return (
    <div className="container max-w-xl py-12 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">Contact & Support 🕉️</h1>
      <p className="text-sm text-muted-foreground">
        Need assistance with a ceremony booking or purohit inquiry? Get in touch with our Vedic seva team.
      </p>

      {/* TODO: Add contact inquiry form with Name, Email, and Message fields */}
      <div className="p-6 border rounded-lg bg-card text-xs text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground">Support Seva Desk</p>
        <p>Email: support@pujacircle.demo</p>
        <p>Helpline: +91 1800-PUJA-VIRA</p>
      </div>
    </div>
  );
};

export default ContactPage;
