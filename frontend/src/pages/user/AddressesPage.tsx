import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { addressApi } from "@/api/address.api";
import { Address, PincodeLocation } from "@/types/address.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MapPin,
  Plus,
  Trash2,
  Home,
  Loader2,
  Edit2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

/**
 * AddressesPage
 * Devotee sacred ceremony locations manager (maximum 2 addresses).
 * 100% Flexbox, pure solid white canvas, radiant Haldi gold trims, deep vermilion accents.
 */
export const AddressesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Address Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [pinCode, setPinCode] = useState("");
  const [isLookingUpPin, setIsLookingUpPin] = useState(false);
  const [pinLocations, setPinLocations] = useState<PincodeLocation[]>([]);
  const [selectedVillageTown, setSelectedVillageTown] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const data = await addressApi.getAddresses(user.id);
      setAddresses(data);
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
      addressApi
        .lookupPincode(clean)
        .then((res) => {
          if (res.locations && res.locations.length > 0) {
            setPinLocations(res.locations);
            const first = res.locations[0];
            if (!editingAddress || editingAddress.pincode !== clean) {
              setSelectedVillageTown(
                first.villageTown || first.locality || first.postOffice,
              );
              setDistrict(first.district);
              setState(first.state);
              setCity(first.city);
            }
          }
        })
        .catch(() => toast.error("PIN code lookup failed"))
        .finally(() => setIsLookingUpPin(false));
    } else {
      if (!editingAddress) {
        setPinLocations([]);
        setSelectedVillageTown("");
        setDistrict("");
        setState("");
        setCity("");
      }
    }
  }, [pinCode, editingAddress]);

  const handleOpenAdd = () => {
    if (addresses.length >= 2) {
      toast.error(
        "You cannot add more than 2 addresses. Please edit or delete an existing address.",
      );
      return;
    }
    setEditingAddress(null);
    setPinCode("");
    setHouseNo("");
    setPinLocations([]);
    setSelectedVillageTown("");
    setDistrict("");
    setState("");
    setCity("");
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setPinCode(addr.pincode || addr.pinCode || "");
    setHouseNo(addr.houseNo || addr.houseBuilding || "");
    setSelectedVillageTown(addr.villageTown || addr.locality || "");
    setDistrict(addr.district || "");
    setState(addr.state || "");
    setCity(addr.city || "");
    setIsDefault(!!addr.isDefault);
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!pinCode.trim() || pinCode.length !== 6) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (!houseNo.trim()) {
      toast.error("Please enter house/flat/building details.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingAddress) {
        const res = await addressApi.updateAddress(
          {
            id: editingAddress.id,
            pincode: pinCode,
            houseNo: houseNo.trim(),
            locality: selectedVillageTown || city || district,
            villageTown: selectedVillageTown,
            city: city || district,
            district,
            state,
            isDefault,
          },
          user.id,
        );

        if (res.success) {
          toast.success(res.message);
          setIsModalOpen(false);
          fetchAddresses();
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await addressApi.createAddress(
          {
            pincode: pinCode,
            houseNo: houseNo.trim(),
            locality: selectedVillageTown || city || district,
            villageTown: selectedVillageTown,
            city: city || district,
            district,
            state,
            isDefault: addresses.length === 0 ? true : isDefault,
          },
          user.id,
        );

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
    const res = await addressApi.setDefaultAddress(addressId, user.id);
    if (res.success) {
      toast.success(res.message);
      fetchAddresses();
    } else {
      toast.error(res.message);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!user) return;
    const res = await addressApi.deleteAddress(addressId, user.id);
    if (res.success) {
      toast.success(res.message);
      fetchAddresses();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="w-full text-stone-900 py-6 sm:py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header (100% Flexbox) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl border-2 border-amber-300 bg-white shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
              <span className="text-sm font-serif font-black leading-none">
                ॐ
              </span>
              <span>Ceremony Locations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-950">
              Saved Addresses ({addresses.length}/2)
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
              Manage your sacred ceremony locations (maximum 2 addresses
              allowed). Accurate PIN code ensures assigned Purohits can arrive
              punctually for Shubh Muhurats.
            </p>
          </div>

          <Button
            onClick={handleOpenAdd}
            disabled={addresses.length >= 2}
            size="sm"
            className="gap-2 text-xs w-full sm:w-auto h-11 px-5 font-bold bg-[#780016] hover:bg-red-800 text-white border border-amber-400 rounded-md shadow-xs cursor-pointer shrink-0 puja-btn-tap"
          >
            <Plus className="h-4 w-4" /> Add Address
          </Button>
        </div>

        {/* Address List */}
        {isLoading ? (
          <div className="text-center py-12 text-xs text-stone-500 font-medium">
            Loading saved addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className="border-2 border-amber-300 rounded-xl bg-white text-center py-12 px-6 shadow-sm">
            <div className="max-w-md mx-auto space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                <MapPin className="h-7 w-7 text-amber-700" />
              </div>
              <h2 className="text-lg font-bold font-serif text-stone-900">
                No Saved Addresses
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Please save your home address so Purohits can travel to your
                location for pujas and sacred ceremonies.
              </p>
              <Button
                onClick={handleOpenAdd}
                size="sm"
                className="text-xs gap-1.5 w-full sm:w-auto h-11 px-6 bg-[#780016] hover:bg-red-800 text-white font-bold border border-amber-400 rounded-md shadow-xs cursor-pointer puja-btn-tap"
              >
                <Plus className="h-4 w-4" /> Add Your Primary Address
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-5 rounded-lg transition-all shadow-xs border-2 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  addr.isDefault
                    ? "border-red-700 ring-2 ring-red-700/20"
                    : "border-amber-200 hover:border-amber-400"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Custom Aesthetic Radio Button */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={!!addr.isDefault}
                    onClick={() => handleSetDefault(addr.id)}
                    className="flex items-center justify-center pt-0.5 group focus:outline-none cursor-pointer"
                    title={
                      addr.isDefault
                        ? "Current primary default address"
                        : "Click to make primary default address"
                    }
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        addr.isDefault
                          ? "border-red-700 bg-red-50 shadow-xs"
                          : "border-stone-400 group-hover:border-red-700 bg-white"
                      }`}
                    >
                      {addr.isDefault && (
                        <div className="w-2.5 h-2.5 rounded-full bg-red-700 animate-in zoom-in-75 duration-200" />
                      )}
                    </div>
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-800 shrink-0 border border-amber-300">
                        <Home className="h-3.5 w-3.5 text-amber-800" />
                      </div>
                      <span className="font-bold text-sm text-stone-950">
                        {addr.houseNo || addr.houseBuilding},{" "}
                        {addr.villageTown || addr.locality}
                      </span>
                      {addr.isDefault && (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-800 border-red-200 text-[10px] py-0.5 gap-1 font-bold"
                        >
                          <CheckCircle2 className="h-3 w-3 text-red-700" />{" "}
                          Primary Sanctum
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-stone-600">
                      {addr.city}, {addr.district}, {addr.state} -{" "}
                      <strong className="font-mono text-stone-900 font-bold">
                        {addr.pincode || addr.pinCode}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(addr)}
                    className="text-xs h-9 px-3 gap-1.5 border-stone-300 hover:border-amber-400 rounded-md cursor-pointer font-semibold"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-stone-600" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(addr.id)}
                    className="text-stone-400 hover:text-red-700 hover:bg-red-50 h-9 w-9 p-0 rounded-md cursor-pointer"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add / Edit Address Modal with PIN Auto-Lookup */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md p-4 sm:p-6 rounded-xl max-h-[90vh] overflow-y-auto bg-white border-2 border-amber-300 shadow-xl">
            <DialogHeader className="pr-8 sm:pr-10 space-y-1 pb-1 text-left">
              <DialogTitle className="font-serif text-xl font-bold text-stone-950 flex items-center gap-2">
                <span className="text-amber-600 font-serif font-black text-xl">
                  ॐ
                </span>
                <span>
                  {editingAddress
                    ? "Edit Ceremony Address"
                    : "Add Ceremony Address"}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-600">
                Enter your 6-digit Indian PIN code to automatically resolve
                location details.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSaveAddress}
              className="space-y-4 pt-2 text-xs"
            >
              {/* PIN Code */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-stone-800 block">
                  6-Digit PIN Code
                </Label>
                <div className="relative">
                  <Input
                    placeholder="e.g. 400050"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) =>
                      setPinCode(e.target.value.replace(/\D/g, ""))
                    }
                    className="font-mono text-xs pr-9 h-10 rounded-md border-stone-300 focus:ring-amber-500 bg-white"
                  />
                  {isLookingUpPin && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-amber-600" />
                  )}
                </div>
              </div>

              {/* Village / Town Dropdown if multiple or resolved */}
              {pinLocations.length > 0 ? (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-stone-800 block">
                    Village / Town / Locality
                  </Label>
                  <select
                    value={selectedVillageTown}
                    onChange={(e) => setSelectedVillageTown(e.target.value)}
                    className="w-full h-10 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs focus:ring-2 focus:ring-amber-500 shadow-xs"
                  >
                    {pinLocations.map((loc, idx) => {
                      const val =
                        loc.villageTown || loc.locality || loc.postOffice;
                      return (
                        <option key={idx} value={val}>
                          {val} ({loc.postOffice})
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : selectedVillageTown ? (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-stone-800 block">
                    Village / Town / Locality
                  </Label>
                  <Input
                    value={selectedVillageTown}
                    onChange={(e) => setSelectedVillageTown(e.target.value)}
                    className="text-xs h-10 rounded-md border-stone-300 focus:ring-amber-500 bg-white"
                  />
                </div>
              ) : null}

              {/* Auto-filled District & State */}
              {district && (
                <div className="flex items-center justify-between gap-4 p-3 rounded-md bg-amber-50/70 border border-amber-300">
                  <div className="flex-1 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                      District
                    </span>
                    <strong className="text-stone-900 text-xs">
                      {district}
                    </strong>
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                      State
                    </span>
                    <strong className="text-stone-900 text-xs">{state}</strong>
                  </div>
                </div>
              )}

              {/* House / Flat Number */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-stone-800 block">
                  House / Flat / Building No.
                </Label>
                <Input
                  placeholder="e.g. Flat 402, Ganga Heights"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  className="text-xs h-10 rounded-md border-stone-300 focus:ring-amber-500 bg-white"
                />
              </div>

              {/* Default Address Radio Option */}
              <div
                onClick={() => setIsDefault(!isDefault)}
                className={`flex items-center gap-3 p-3 rounded-md border-2 transition-all cursor-pointer select-none ${
                  isDefault
                    ? "border-red-700 bg-red-50/50"
                    : "border-stone-200 hover:bg-stone-50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    isDefault
                      ? "border-red-700 bg-white"
                      : "border-stone-400 bg-white"
                  }`}
                >
                  {isDefault && (
                    <div className="w-2.5 h-2.5 rounded-full bg-red-700 animate-in zoom-in-75 duration-200" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-950 block">
                    Set as Primary Default Address
                  </span>
                  <span className="text-[11px] text-stone-600 block leading-tight">
                    Purohits will use this address by default when you schedule
                    ceremonies.
                  </span>
                </div>
              </div>

              <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs w-full sm:w-auto h-10 px-4 rounded-md border-2 border-amber-300 text-stone-800 hover:bg-amber-50 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving || !pinCode.trim() || !houseNo.trim()}
                  className="text-xs w-full sm:w-auto h-10 px-5 rounded-md font-bold bg-[#780016] hover:bg-[#600012] text-white border border-amber-400 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSaving
                    ? "Saving..."
                    : editingAddress
                      ? "Update Address"
                      : "Save Address"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AddressesPage;
