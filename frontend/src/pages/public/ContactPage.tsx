import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mail, Phone, MapPin } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thank you for contacting PujaCircle! Our team will respond shortly.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="container py-12 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Contact Support</h1>
        <p className="text-muted-foreground mt-1">
          Have queries about ritual requirements or need priest assistance? Reach out to us.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Email Support</p>
                  <p className="text-muted-foreground text-xs">{APP_CONFIG.SUPPORT_EMAIL}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Phone Helpline</p>
                  <p className="text-muted-foreground text-xs">{APP_CONFIG.SUPPORT_PHONE}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Location</p>
                  <p className="text-muted-foreground text-xs">Bengaluru, Mumbai, Kolkata, Delhi NCR</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Send Us a Message</CardTitle>
              <CardDescription>We typically respond within a few hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="contact-name">Your Name</Label>
                  <Input
                    id="contact-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact-email">Email or Phone</Label>
                  <Input
                    id="contact-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com or 10-digit mobile"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact-message">Message / Ritual Query</Label>
                  <Textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your ritual requirements or questions..."
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Submit Query</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
