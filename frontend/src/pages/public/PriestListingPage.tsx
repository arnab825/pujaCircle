import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { priestApi } from '@/api/priest.api';
import { Priest } from '@/types/priest.types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { Star, MapPin, Languages } from 'lucide-react';

const PriestListingPage: React.FC = () => {
  const [priests, setPriests] = useState<Priest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    priestApi.getPriests()
      .then(setPriests)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discover Verified Priests</h1>
        <p className="text-muted-foreground mt-1">Browse trusted Vedic purohits available in your city.</p>
      </div>

      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner label="Loading verified priests..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {priests.map((priest) => (
            <Card key={priest.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Avatar className="h-14 w-14 border">
                  <AvatarImage src={priest.profileImageUrl} alt={priest.fullName} />
                  <AvatarFallback>{priest.fullName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{priest.displayName}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {priest.rating} ({priest.reviewCount})
                    </span>
                    <span>•</span>
                    <span>{priest.experienceYears} yrs exp</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{priest.city}, {priest.state}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2">{priest.bio}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {priest.specializations.slice(0, 2).map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Languages className="h-3.5 w-3.5" />
                  <span>{priest.languages.join(', ')}</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Suggested Dakshina</p>
                  <p className="text-sm font-bold text-foreground">{formatCurrency(priest.dakshinaSuggested || 2100)}</p>
                </div>
                <Link to={`/priests/${priest.id}`}>
                  <Button size="sm">View Profile</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriestListingPage;
