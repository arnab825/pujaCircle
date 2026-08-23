import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { priestApi } from '@/api/priest.api';
import { Ritual } from '@/types/priest.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { Clock, Flame } from 'lucide-react';

const RitualsPage: React.FC = () => {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    priestApi.getRituals()
      .then(setRituals)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vedic Rituals & Ceremonies</h1>
        <p className="text-muted-foreground mt-1">
          Explore authentic Vedic pujas, havans, and lifecycle sanskars performed by verified purohits.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner label="Loading rituals..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rituals.map((ritual) => (
            <Card key={ritual.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px]">{ritual.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {ritual.approximateDurationMinutes} mins
                  </span>
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  {ritual.name}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed line-clamp-3">
                  {ritual.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="text-xs font-semibold text-foreground mb-1.5">Essential Requirements</h4>
                <div className="flex flex-wrap gap-1">
                  {ritual.requirements.slice(0, 3).map((req) => (
                    <span key={req} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {req}
                    </span>
                  ))}
                  {ritual.requirements.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{ritual.requirements.length - 3} more</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Suggested Dakshina</p>
                  <p className="text-sm font-bold text-foreground">
                    {formatCurrency(ritual.suggestedDakshina || 2100)}
                  </p>
                </div>
                <Link to="/priests">
                  <Button size="sm">Find Priests</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RitualsPage;
