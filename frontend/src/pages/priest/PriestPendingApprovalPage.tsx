import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Clock, ShieldCheck, Phone, LogOut } from 'lucide-react';

export const PriestPendingApprovalPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/priest/login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center container max-w-lg px-4 py-12">
      <Card className="border-border/80 shadow-md text-center">
        <CardHeader className="space-y-3 pb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
            <Clock className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold font-serif text-foreground">
            Verification in Progress
          </CardTitle>
          <CardDescription className="text-xs max-w-sm mx-auto leading-relaxed">
            Namaste, Pandit Ji. Your Purohit onboarding application has been submitted and is currently under review by our administrative verification council.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-xs text-left pt-2">
          <div className="p-4 rounded-md bg-muted/40 border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Registered Name:</span>
              <strong className="text-foreground">{user?.name || 'Purohit'}</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Mobile Contact:</span>
              <span className="font-mono text-foreground">{user?.phoneNumber || '+919876543211'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Verification Status:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                <Clock className="h-3 w-3" /> PENDING REVIEW
              </span>
            </div>
          </div>

          <div className="space-y-2 text-muted-foreground leading-relaxed">
            <p className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>We verify Vedic credentials and lineage background to ensure quality standards for all devotees.</span>
            </p>
            <p className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>You will receive an SMS confirmation once your profile is activated.</span>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full gap-2 text-xs">
            <LogOut className="h-3.5 w-3.5" /> Sign Out & Return Later
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PriestPendingApprovalPage;
