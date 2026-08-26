import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ratingSchema, RatingInput } from '@/schemas/booking.schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  priestName?: string;
  serviceName?: string;
  onSubmit: (data: RatingInput) => Promise<void>;
  isLoading?: boolean;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  priestName = 'Pandit Ji',
  serviceName = 'Ceremony',
  onSubmit,
  isLoading = false,
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RatingInput>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      bookingId,
      rating: 5,
      review: '',
    },
  });

  const handleStarClick = (score: number) => {
    setSelectedRating(score);
    setValue('rating', score, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: RatingInput) => {
    await onSubmit({ ...data, bookingId });
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="text-center">
          <DialogTitle className="font-serif text-xl">Rate Vedic Ceremony</DialogTitle>
          <DialogDescription className="text-xs">
            How was your experience with <strong>{priestName}</strong> for <em>{serviceName}</em>?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2 text-left">
          {/* Star Rating Input */}
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating !== null ? hoverRating : selectedRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 rounded-md hover:scale-110 transition-transform focus:outline-hidden"
                    aria-label={`${star} star`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/40'
                      } transition-colors`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-foreground">
              {selectedRating === 5 && 'Outstanding & Divine (5/5)'}
              {selectedRating === 4 && 'Very Good (4/5)'}
              {selectedRating === 3 && 'Satisfactory (3/5)'}
              {selectedRating === 2 && 'Needs Improvement (2/5)'}
              {selectedRating === 1 && 'Disappointing (1/5)'}
            </span>
          </div>

          {/* Optional Review */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Review & Feedback (Optional)</Label>
            <Textarea
              placeholder="Share details about punctuality, Vedic pronunciation, samagri guidance, etc."
              rows={3}
              {...register('review')}
              className="text-xs resize-none"
            />
            {errors.review && (
              <p className="text-[11px] text-destructive">{errors.review.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2 sm:justify-center">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="text-xs px-6">
              {isLoading ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
