import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  mockGetAddresses,
  mockCreateAddress,
  mockUpdateAddress,
  mockSetDefaultAddress,
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
import { MapPin, Plus, Trash2, Home, Loader2, Sparkles, Edit2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const AddressesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Address Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [pinCode, setPinCode] = useState('');
  const [isLookingUpPin, setIsLookingUpPin] = useState(false);
  const [pinLocations, setPinLocations] = useState<PincodeLocation[]>([]);
  const [selectedVillageTown, setSelectedVillageTown] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [isDefault, setIsDefault] = useState(false);
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
            if (!editingAddress || editingAddress.pincode !== clean) {
              setSelectedVillageTown(first.villageTown || first.locality || first.postOffice);
              setDistrict(first.district);
              setState(first.state);
              setCity(first.city);
            }
          }
        })
        .catch(() => toast.error('PIN code lookup failed'))
        .finally(() => setIsLookingUpPin(false));
    } else {
      if (!editingAddress) {
        setPinLocations([]);
        setSelectedVillageTown('');
        setDistrict('');
        setState('');
        setCity('');
      }
    }
  }, [pinCode, editingAddress]);

  const handleOpenAdd = () => {
    if (addresses.length >= 2) {
      toast.error('You cannot add more than 2 addresses. Please edit or delete an existing address.');
      return;
    }
    setEditingAddress(null);
    setPinCode('');
    setHouseNo('');
    setPinLocations([]);
    setSelectedVillageTown('');
    setDistrict('');
    setState('');
    setCity('');
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setPinCode(addr.pincode || addr.pinCode || '');
    setHouseNo(addr.houseNo || addr.houseBuilding || '');
    setSelectedVillageTown(addr.villageTown || addr.locality || '');
    setDistrict(addr.district || '');
    setState(addr.state || '');
    setCity(addr.city || '');
    setIsDefault(!!addr.isDefault);
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
      if (editingAddress) {
        const res = await mockUpdateAddress(user.id, {
          id: editingAddress.id,
          pincode: pinCode,
          houseNo: houseNo.trim(),
          houseBuilding: houseNo.trim(),
          villageTown: selectedVillageTown,
          locality: selectedVillageTown,
          city: city || district,
          district,
          state,
          isDefault,
        });

        if (res.success) {
          toast.success(res.message);
          setIsModalOpen(false);
          fetchAddresses();
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await mockCreateAddress(user.id, {
          pincode: pinCode,
          houseNo: houseNo.trim(),
          villageTown: selectedVillageTown,
          city: city || district,
          district,
          state,
          isDefault: addresses.length === 0 ? true : isDefault,
        });

        if (res.success) {
          toast.success(res.message);
          setIsModalOpen(false);
          fetchAddresses();
        } else {
          toast.error(res.message);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;
    const res = await mockSetDefaultAddress(user.id, addressId);
    if (res.success) {
      toast.success(res.message);
      fetchAddresses();
    } else {
      toast.error(res.message);
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
    <div className="container max-w-3xl py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ceremony Locations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
            Saved Addresses ({addresses.length}/2)
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your sacred ceremony locations (maximum 2 addresses allowed). PIN code ensures Purohits can easily locate your home.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          disabled={addresses.length >= 2}
          size="sm"
          className="gap-2 text-xs w-full sm:w-auto h-9 font-medium"
        >
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      </div>

      {/* Address List */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-muted-foreground">
          Loading addresses...
        </div>
      ) : addresses.length === 0 ? (
        <Card className="border bg-card text-center py-12 px-4 shadow-xs">
          <div className="max-w-md mx-auto space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold font-serif text-foreground">No Saved Addresses</h2>
            <p className="text-xs text-muted-foreground">
              Please save your home address so Purohits can travel to your location for pujas.
            </p>
            <Button onClick={handleOpenAdd} size="sm" className="text-xs gap-1.5 w-full sm:w-auto h-9">
              <Plus className="h-3.5 w-3.5" /> Add Your Primary Address
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={`border bg-card transition-all shadow-xs ${
                addr.isDefault
                  ? 'border-primary/50 ring-1 ring-primary/20'
                  : 'border-border/80 hover:border-primary/40'
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Custom Aesthetic Radio Button */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={!!addr.isDefault}
                    onClick={() => handleSetDefault(addr.id)}
                    className="flex items-center justify-center pt-0.5 group focus:outline-none cursor-pointer"
                    title={addr.isDefault ? "Current primary default address" : "Click to make primary default address"}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        addr.isDefault
                          ? 'border-primary bg-primary/10 shadow-xs'
                          : 'border-muted-foreground/40 group-hover:border-primary/60 bg-card'
                      }`}
                    >
                      {addr.isDefault && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-in zoom-in-75 duration-200" />
                      )}
                    </div>
                  </button>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <Home className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-semibold text-sm text-foreground">
                        {addr.houseNo || addr.houseBuilding}, {addr.villageTown || addr.locality}
                      </span>
                      {addr.isDefault && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] py-0 gap-1 font-semibold">
                          <CheckCircle2 className="h-3 w-3" /> Primary Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {addr.city}, {addr.district}, {addr.state} -{' '}
                      <strong className="font-mono text-foreground">{addr.pincode || addr.pinCode}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(addr)}
                    className="text-xs h-8 px-2.5 gap-1"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(addr.id)}
                    className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal with PIN Auto-Lookup */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
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
                  className="font-mono text-xs pr-9 h-9"
                />
                {isLookingUpPin && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-primary" />
                )}
              </div>
            </div>

            {/* Village / Town Dropdown if multiple or resolved */}
            {pinLocations.length > 0 ? (
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
            ) : selectedVillageTown ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Village / Town / Locality</Label>
                <Input
                  value={selectedVillageTown}
                  onChange={(e) => setSelectedVillageTown(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            ) : null}

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
                className="text-xs h-9"
              />
            </div>

            {/* Default Address Radio Option */}
            <div
              onClick={() => setIsDefault(!isDefault)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                isDefault ? 'border-primary/50 bg-primary/5' : 'border-border/70 hover:bg-muted/40'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                  isDefault ? 'border-primary bg-primary/10' : 'border-muted-foreground/40 bg-card'
                }`}
              >
                {isDefault && <div className="w-2.5 h-2.5 rounded-full bg-primary animate-in zoom-in-75 duration-200" />}
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Set as Primary Default Address
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Purohits will use this address by default when you book rituals.
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs w-full sm:w-auto h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving || !pinCode || !houseNo}
                className="text-xs w-full sm:w-auto h-9"
              >
                {isSaving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressesPage;
