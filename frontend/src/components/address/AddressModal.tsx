import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddressStore } from '@/store/address.store';
import { addressApi } from '@/api/address.api';
import { toast } from 'sonner';
import { AddressLabel } from '@/types/address.types';

export const AddressModal: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { isAddressModalOpen, editingAddress, closeAddressModal } = useAddressStore();
  const [label, setLabel] = useState<AddressLabel>('HOME');
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [houseBuilding, setHouseBuilding] = useState('');
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingAddress) {
      setLabel(editingAddress.label || 'HOME');
      setRecipientName(editingAddress.recipientName || '');
      setPhoneNumber(editingAddress.phoneNumber || '');
      setHouseBuilding(editingAddress.houseBuilding || editingAddress.houseNo || '');
      setStreet(editingAddress.street || '');
      setLocality(editingAddress.locality || editingAddress.villageTown || '');
      setLandmark(editingAddress.landmark || '');
      setPincode(editingAddress.pincode || editingAddress.pinCode || '');
      setCity(editingAddress.city || '');
      setDistrict(editingAddress.district || '');
      setState(editingAddress.state || '');
    } else {
      setLabel('HOME');
      setRecipientName('');
      setPhoneNumber('');
      setHouseBuilding('');
      setStreet('');
      setLocality('');
      setLandmark('');
      setPincode('');
      setCity('');
      setDistrict('');
      setState('');
    }
  }, [editingAddress]);

  const handlePincodeChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setPincode(cleaned);
    if (cleaned.length === 6) {
      try {
        const lookup = await addressApi.lookupPincode(cleaned);
        if (lookup.locations.length > 0) {
          const loc = lookup.locations[0];
          setCity(loc.city);
          setDistrict(loc.district);
          setState(loc.state);
          setLocality(loc.locality);
          toast.info(`Auto-detected: ${loc.city}, ${loc.state}`);
        }
      } catch {
        // Continue
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingAddress) {
        await addressApi.updateAddress({
          id: editingAddress.id,
          label,
          recipientName,
          phoneNumber,
          houseBuilding,
          street,
          locality,
          landmark,
          pincode,
          city,
          district,
          state,
        });
        toast.success('Address updated successfully');
      } else {
        await addressApi.createAddress({
          label,
          recipientName,
          phoneNumber,
          houseBuilding,
          street,
          locality,
          landmark,
          pincode,
          city,
          district,
          state,
        });
        toast.success('Address added successfully');
      }
      closeAddressModal();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isAddressModalOpen} onOpenChange={(open) => !open && closeAddressModal()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          <DialogDescription>
            Enter full ritual location details. Verified priests will arrive at this address.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Recipient Name</Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Aditi Sharma"
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Contact Phone</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                placeholder="10-digit number"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>PIN Code (Auto-detects City & State)</Label>
            <Input
              value={pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              placeholder="e.g. 400050"
              maxLength={6}
              required
            />
          </div>

          <div className="space-y-1">
            <Label>House / Flat / Building</Label>
            <Input
              value={houseBuilding}
              onChange={(e) => setHouseBuilding(e.target.value)}
              placeholder="Flat 402, Shivam Apts"
              required
            />
          </div>

          <div className="space-y-1">
            <Label>Street / Road</Label>
            <Input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Main Road"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Locality / Area</Label>
              <Input
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Bandra West"
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Landmark (Optional)</Label>
              <Input
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near Temple"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>District</Label>
              <Input value={district} onChange={(e) => setDistrict(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>State</Label>
              <Input value={state} onChange={(e) => setState(e.target.value)} required />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Saving Address...' : editingAddress ? 'Update Address' : 'Save Address'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
