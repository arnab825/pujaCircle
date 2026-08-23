import React, { useEffect, useState } from 'react';
import { addressApi } from '@/api/address.api';
import { Address } from '@/types/address.types';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AddressModal } from '@/components/address/AddressModal';
import { useAddressStore } from '@/store/address.store';
import { toast } from 'sonner';
import { MapPin, Plus, Trash2, Edit, Check } from 'lucide-react';

const AddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openAddressModal } = useAddressStore();

  const loadAddresses = () => {
    setIsLoading(true);
    addressApi.getAddresses()
      .then(setAddresses)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSetDefault = async (id: string) => {
    try {
      await addressApi.setDefaultAddress(id);
      toast.success('Default address updated');
      loadAddresses();
    } catch {
      toast.error('Failed to set default address');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await addressApi.deleteAddress(id);
      toast.success('Address removed');
      loadAddresses();
    } catch {
      toast.error('Failed to delete address');
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Saved Addresses</h1>
          <p className="text-muted-foreground mt-1">Manage locations for your home and office rituals.</p>
        </div>
        <Button onClick={() => openAddressModal()} className="gap-2">
          <Plus className="h-4 w-4" /> Add New Address
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner label="Loading addresses..." />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card p-6">
          <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-lg">No addresses added yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Add your home or temple address to book rituals easily.</p>
          <Button onClick={() => openAddressModal()}>Add Address</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <Card key={address.id} className={address.isDefault ? 'border-primary/50 shadow-sm' : ''}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={address.label === 'HOME' ? 'default' : 'secondary'}>{address.label}</Badge>
                  {address.isDefault && (
                    <Badge variant="outline" className="text-primary border-primary text-[10px]">
                      Default Address
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAddressModal(address)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(address.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-semibold">{address.recipientName} ({address.phoneNumber})</p>
                <p className="text-muted-foreground">{address.houseBuilding}, {address.street}</p>
                <p className="text-muted-foreground">{address.locality}{address.landmark ? `, Near ${address.landmark}` : ''}</p>
                <p className="text-muted-foreground">{address.city}, {address.district}, {address.state} - {address.pincode}</p>
              </CardContent>
              <CardFooter className="border-t pt-3 flex justify-end">
                {!address.isDefault && (
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => handleSetDefault(address.id)}>
                    <Check className="h-3.5 w-3.5" /> Set as Default
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AddressModal onSuccess={loadAddresses} />
    </div>
  );
};

export default AddressesPage;
