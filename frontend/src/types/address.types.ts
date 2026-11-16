export interface Address {
  id: string;
  userId: string;
  recipientName?: string;
  phoneNumber?: string;
  houseNo: string;
  street?: string;
  locality?: string;
  villageTown?: string;
  landmark?: string;
  pincode: string;
  pinCode?: string;
  city: string;
  district: string;
  state: string;
  country?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAddressRequest {
  recipientName?: string;
  phoneNumber?: string;
  houseNo: string;
  street?: string;
  locality?: string;
  villageTown?: string;
  landmark?: string;
  pincode: string;
  pinCode?: string;
  city: string;
  district: string;
  state: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  id: string;
}

export interface PincodeLocation {
  postOffice: string;
  locality: string;
  villageTown?: string;
  city: string;
  district: string;
  state: string;
  country: string;
}

export interface PincodeLookupResponse {
  pincode: string;
  locations: PincodeLocation[];
}
