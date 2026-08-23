import { create } from 'zustand';
import { Address } from '@/types/address.types';

/**
 * Address Store
 * Responsibility: Manages active selected address for booking flows and address modal states.
 */
interface AddressState {
  selectedAddressId: string | null;
  isAddressModalOpen: boolean;
  editingAddress: Address | null;

  // Actions
  setSelectedAddressId: (id: string | null) => void;
  openAddressModal: (address?: Address | null) => void;
  closeAddressModal: () => void;
}

export const useAddressStore = create<AddressState>((set) => ({
  selectedAddressId: null,
  isAddressModalOpen: false,
  editingAddress: null,

  setSelectedAddressId: (id) => set({ selectedAddressId: id }),
  openAddressModal: (address = null) => set({ isAddressModalOpen: true, editingAddress: address }),
  closeAddressModal: () => set({ isAddressModalOpen: false, editingAddress: null }),
}));
