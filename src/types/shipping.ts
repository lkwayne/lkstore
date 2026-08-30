export interface ShippingZone {
  id: string;
  city: string;
  neighborhood: string | null;
  fee: number;
  estimatedDays: number;
  codAllowed: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
}
