import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  mockGetAddresses,
  mockCreateAddress,
  mockDeleteAddress,
  mockLookupPincode,
} from '@/mocks/mock-api';
import { Address, PincodeLocation } from '@/types/address.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { MapPin, Plus, Trash2, Home, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const AddressesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Address Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [isLookingUpPin, setIsLookingUpPin] = useState(false);
  const [pinLocations, setPinLocations] = useState<PincodeLocation[]>([]);
  const [selectedVillageTown, setSelectedVillageTown] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const res = await mockGetAddresses(user.id);
      if (res.success) {
        setAddresses(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  // Handle PIN Code Auto-Lookup on 6 digits
  useEffect(() => {
    const clean = pinCode.trim();
    if (clean.length === 6 && /^\d{6}$/.test(clean)) {
      setIsLookingUpPin(true);
      mockLookupPincode(clean)
        .then((res) => {
          if (res.locations && res.locations.length > 0) {
            setPinLocations(res.locations);
            const first = res.locations[0];
            setSelectedVillageTown(first.villageTown || first.locality || first.postOffice);
            setDistrict(first.district);
            setState(first.state);
            setCity(first.city);
            toast.success(`Resolved ${res.locations.length} location(s) for PIN ${clean}`);
          }
        })
        .catch(() => toast.error('PIN code lookup failed'))
        .finally(() => setIsLookingUpPin(false));
    } else {
      setPinLocations([]);
      setSelectedVillageTown('');
      setDistrict('');
      setState('');
      setCity('');
    }
  }, [pinCode]);

  const handleOpenAdd = () => {
    setPinCode('');
    setHouseNo('');
    setPinLocations([]);
    setSelectedVillageTown('');
    setDistrict('');
    setState('');
    setCity('');
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!pinCode || pinCode.length !== 6) {
      toast.error('Please enter a valid 6-digit PIN code.');
      return;
    }
    if (!selectedVillageTown) {
      toast.error('Please select your village/town or locality.');
      return;
    }
    if (!houseNo.trim()) {
      toast.error('Please enter your house/flat number.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await mockCreateAddress(user.id, {
        pincode: pinCode,
        houseNo: houseNo.trim(),
        villageTown: selectedVillageTown,
        city: city || district,
        district,
        state,
        isDefault: addresses.length === 0,
      });

      if (res.success) {
        toast.success(res.message);
        setIsModalOpen(false);
        fetchAddresses();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!user) return;
    const res = await mockDeleteAddress(user.id, addressId);
    if (res.success) {
      toast.success(res.message);
      fetchAddresses();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ceremony Locations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
            Saved Addresses
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your sacred ceremony locations. PIN code ensures Purohits can easily locate your home.
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="sm" className="gap-2 text-xs self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      </div>

      {/* Address List */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-muted-foreground">
          Loading addresses...
        </div>
      ) : addresses.length === 0 ? (
        <Card className="border-border/80 text-center py-12 px-4 shadow-xs">
          <div className="max-w-md mx-auto space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold font-serif text-foreground">No Saved Addresses</h2>
            <p className="text-xs text-muted-foreground">
              Please save your home address so Purohits can travel to your location for pujas.
            </p>
            <Button onClick={handleOpenAdd} size="sm" className="text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Your Primary Address
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {addresses.map((addr) => (
            <Card key={addr.id} className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
              <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Home className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-semibold text-sm text-foreground">
                      {addr.houseNo || addr.houseBuilding}, {addr.villageTown || addr.locality}
                    </span>
                    {addr.isDefault && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] py-0">
                        Primary Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground pl-9">
                    {addr.city}, {addr.district}, {addr.state} -{' '}
                    <strong className="font-mono text-foreground">{addr.pincode}</strong>
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(addr.id)}
                  className="text-muted-foreground hover:text-destructive h-8 w-8 p-0 shrink-0"
                  aria-label="Delete address"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Address Modal with PIN Auto-Lookup */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Add New Address</DialogTitle>
            <DialogDescription className="text-xs">
              Enter your 6-digit Indian PIN code to automatically resolve your village/town, district, and state.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAddress} className="space-y-4 pt-2 text-xs">
            {/* PIN Code */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">6-Digit PIN Code</Label>
              <div className="relative">
                <Input
                  placeholder="e.g. 400050"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  className="font-mono text-xs pr-9"
                />
                {isLookingUpPin && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-primary" />
                )}
              </div>
            </div>

            {/* Village / Town Dropdown if multiple or resolved */}
            {pinLocations.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Village / Town / Locality</Label>
                <select
                  value={selectedVillageTown}
                  onChange={(e) => setSelectedVillageTown(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                >
                  {pinLocations.map((loc, idx) => {
                    const val = loc.villageTown || loc.locality || loc.postOffice;
                    return (
                      <option key={idx} value={val}>
                        {val} ({loc.postOffice})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Auto-filled District & State */}
            {district && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border">
                <div>
                  <span className="text-[10px] text-muted-foreground block">District:</span>
                  <strong className="text-foreground text-xs">{district}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">State:</span>
                  <strong className="text-foreground text-xs">{state}</strong>
                </div>
              </div>
            )}

            {/* House / Flat Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">House / Flat / Building No.</Label>
              <Input
                placeholder="e.g. Flat 402, Ganga Heights"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving || !pinCode || !houseNo} className="text-xs">
                {isSaving ? 'Saving...' : 'Save Address'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressesPage;
