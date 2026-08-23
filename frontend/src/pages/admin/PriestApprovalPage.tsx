import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { priestApi } from '@/api/priest.api';
import { Priest } from '@/types/priest.types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';

const PriestApprovalPage: React.FC = () => {
  const [pendingPriests, setPendingPriests] = useState<Priest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPending = () => {
    setIsLoading(true);
    priestApi.getPendingPriests()
      .then(setPendingPriests)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await priestApi.approvePriest(id);
      toast.success('Priest approved! Account is now active.');
      loadPending();
    } catch {
      toast.error('Failed to approve priest');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await priestApi.rejectPriest(id);
      toast.info('Priest application rejected');
      loadPending();
    } catch {
      toast.error('Failed to reject priest');
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Priest Approval Queue</h1>
        <p className="text-muted-foreground mt-1">Review credentials and verify Vedic scholars before profile activation.</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner label="Loading pending applications..." />
        </div>
      ) : pendingPriests.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card p-6">
          <p className="font-semibold text-lg">No pending applications</p>
          <p className="text-sm text-muted-foreground mt-1">All registered priests have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPriests.map((priest) => (
            <Card key={priest.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{priest.fullName}</CardTitle>
                  <p className="text-xs text-muted-foreground">{priest.city}, {priest.state} • {priest.experienceYears} Years Experience</p>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                  PENDING REVIEW
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground text-xs leading-relaxed">{priest.bio}</p>
                <div className="flex gap-2">
                  <span className="text-xs font-semibold">Specializations:</span>
                  <span className="text-xs text-muted-foreground">{priest.specializations.join(', ')}</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-end gap-3 border-t pt-3">
                <Link to={`/admin/priest-approvals/${priest.id}`}>
                  <Button variant="outline" size="sm">Inspect Details</Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={() => handleReject(priest.id)}>Reject</Button>
                <Button size="sm" onClick={() => handleApprove(priest.id)}>Approve Priest</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriestApprovalPage;
