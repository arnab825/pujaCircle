import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { priestApi } from '@/api/priest.api';
import { Priest, PriestSlot } from '@/types/priest.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useBookingStore } from '@/store/booking.store';
import { useAuthStore } from '@/store/auth.store';
import { BookingConfirmModal } from '@/components/booking/BookingConfirmModal';
import { toast } from 'sonner';
import { Star, MapPin, Languages, Award, Clock } from 'lucide-react';

const PriestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [priest, setPriest] = useState<Priest | null>(null);
  const [slots, setSlots] = useState<PriestSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openBookingModal } = useBookingStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();

  useEffect(() => {
    if (id) {
      Promise.all([priestApi.getPriestById(id), priestApi.getPriestSlots(id)])
        .then(([pData, sData]) => {
          setPriest(pData);
          setSlots(sData);
        })
        .catch(() => toast.error('Priest not found'))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleBook = (slot: PriestSlot) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to proceed with booking');
      openAuthModal('LOGIN');
      return;
    }
    openBookingModal({
      priestId: priest?.id,
      slotId: slot.id,
      bookingDate: slot.date,
      estimatedDakshina: priest?.dakshinaSuggested,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <LoadingSpinner label="Loading priest details..." />
      </div>
    );
  }

  if (!priest) {
    return (
      <div className="container py-16 text-center">
        <p className="text-lg">Priest not found.</p>
        <Link to="/priests"><Button className="mt-4">Back to Priests</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Priest Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b pb-8">
        <div className="flex gap-4 items-center">
          <img
            src={priest.profileImageUrl}
            alt={priest.fullName}
            className="h-24 w-24 rounded-full object-cover border-2 border-primary/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{priest.displayName}</h1>
              <Badge variant="accent" className="text-xs">Verified Purohit</Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5" /> {priest.city}, {priest.state}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1 font-semibold text-amber-600">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {priest.rating} ({priest.reviewCount} reviews)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> {priest.experienceYears} Years Vedic Experience
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details & Available Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">About & Vedic Background</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>{priest.bio}</p>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Languages Spoken</h4>
                <div className="flex gap-2 items-center">
                  <Languages className="h-4 w-4 text-primary" />
                  <span>{priest.languages.join(', ')}</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Specializations</h4>
                <div className="flex gap-2 flex-wrap">
                  {priest.specializations.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Slots Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Available Muhurat Slots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {slots.length === 0 ? (
                <p className="text-xs text-muted-foreground">No slots currently available.</p>
              ) : (
                slots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-xs font-semibold">{slot.date}</p>
                      <p className="text-xs text-muted-foreground">{slot.startTime} - {slot.endTime}</p>
                    </div>
                    <Button
                      size="sm"
                      disabled={slot.status !== 'AVAILABLE'}
                      onClick={() => handleBook(slot)}
                    >
                      {slot.status === 'AVAILABLE' ? 'Book' : 'Booked'}
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <BookingConfirmModal
        onConfirm={() => {
          toast.success('Puja booking request confirmed! Payment is offline.');
          useBookingStore.getState().closeBookingModal();
        }}
      />
    </div>
  );
};

export default PriestDetailsPage;
