import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { priestApi } from '@/api/priest.api';
import { Priest } from '@/types/priest.types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';

const PriestApprovalDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [priest, setPriest] = useState<Priest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      priestApi.getPriestById(id)
        .then(setPriest)
        .catch(() => toast.error('Priest not found'))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleApprove = async () => {
    if (!priest) return;
    await priestApi.approvePriest(priest.id);
    toast.success('Priest approved successfully!');
    navigate('/admin/priest-approvals');
  };

  const handleReject = async () => {
    if (!priest) return;
    await priestApi.rejectPriest(priest.id);
    toast.info('Priest application rejected.');
    navigate('/admin/priest-approvals');
  };

  if (isLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <LoadingSpinner label="Loading application..." />
      </div>
    );
  }

  if (!priest) {
    return <div className="container py-16 text-center">Priest application not found.</div>;
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{priest.fullName}</h1>
          <p className="text-muted-foreground text-sm">Application Review ID: {priest.id}</p>
        </div>
        <Badge variant="outline" className="text-amber-600 border-amber-300">
          {priest.approvalStatus}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Vedic Background & Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Mobile Contact</p>
            <p className="font-medium">+91 {priest.phoneNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="font-medium">{priest.city}, {priest.state}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Languages</p>
            <p className="font-medium">{priest.languages.join(', ')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Specializations</p>
            <p className="font-medium">{priest.specializations.join(', ')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Bio & Lineage</p>
            <p className="leading-relaxed text-muted-foreground">{priest.bio}</p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-3 flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/priest-approvals')}>Back</Button>
          <Button variant="destructive" onClick={handleReject}>Reject Application</Button>
          <Button onClick={handleApprove}>Approve Scholar</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PriestApprovalDetailsPage;
