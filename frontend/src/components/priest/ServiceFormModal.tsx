import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { priestServiceSchema, PriestServiceInput } from '@/schemas/priest.schema';
import { PriestService } from '@/types/priest.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IndianRupee } from 'lucide-react';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: PriestService | null;
  onSubmit: (data: PriestServiceInput) => Promise<void>;
  isLoading?: boolean;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  serviceToEdit,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PriestServiceInput>({
    resolver: zodResolver(priestServiceSchema),
    defaultValues: {
      serviceName: '',
      price: 2100,
    },
  });

  useEffect(() => {
    if (serviceToEdit) {
      reset({
        serviceName: serviceToEdit.serviceName,
        price: serviceToEdit.price,
      });
    } else {
      reset({
        serviceName: '',
        price: 2100,
      });
    }
  }, [serviceToEdit, reset, isOpen]);

  const handleFormSubmit = async (data: PriestServiceInput) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">
            {serviceToEdit ? 'Edit Ceremony Service' : 'Add New Ceremony Service'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Set your priest-specific ceremonial offering and custom cash Dakshina.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          {/* Service Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Ceremony / Puja Name</Label>
            <Input
              placeholder="e.g. Griha Pravesh & Vastu Shanti"
              {...register('serviceName')}
              className="text-xs"
            />
            {errors.serviceName && (
              <p className="text-[11px] text-destructive">{errors.serviceName.message}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Expected Cash Dakshina (₹ INR)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="2500"
                {...register('price')}
                className="pl-9 text-xs"
              />
            </div>
            {errors.price && (
              <p className="text-[11px] text-destructive">{errors.price.message}</p>
            )}
            <p className="text-[10px] text-muted-foreground">
              Direct offline cash amount devotees will offer upon ceremony completion.
            </p>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="text-xs">
              {isLoading ? 'Saving...' : serviceToEdit ? 'Update Service' : 'Save Service'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
