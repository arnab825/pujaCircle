import { create } from 'zustand';

/**
 * Booking Store
 * Responsibility: Manages multi-step booking wizard state and booking dialogs.
 */
interface BookingDraft {
  priestId: string | null;
  ritualId: string | null;
  addressId: string | null;
  slotId: string | null;
  bookingDate: string | null;
  specialInstructions?: string;
  estimatedDakshina?: number;
}

interface BookingState {
  draft: BookingDraft;
  isBookingModalOpen: boolean;
  currentStep: number;

  // Actions
  setDraft: (partial: Partial<BookingDraft>) => void;
  resetDraft: () => void;
  openBookingModal: (initialDraft?: Partial<BookingDraft>) => void;
  closeBookingModal: () => void;
  setCurrentStep: (step: number) => void;
}

const initialDraft: BookingDraft = {
  priestId: null,
  ritualId: null,
  addressId: null,
  slotId: null,
  bookingDate: null,
  specialInstructions: '',
  estimatedDakshina: 0,
};

export const useBookingStore = create<BookingState>((set) => ({
  draft: initialDraft,
  isBookingModalOpen: false,
  currentStep: 1,

  setDraft: (partial) =>
    set((state) => ({
      draft: { ...state.draft, ...partial },
    })),
  resetDraft: () => set({ draft: initialDraft, currentStep: 1 }),
  openBookingModal: (initial = {}) =>
    set((state) => ({
      isBookingModalOpen: true,
      draft: { ...state.draft, ...initial },
    })),
  closeBookingModal: () => set({ isBookingModalOpen: false }),
  setCurrentStep: (step) => set({ currentStep: step }),
}));
