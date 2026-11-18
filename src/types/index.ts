export const CATEGORIES = [
  'Sofás',
  'Camas',
  'Mesas',
  'Cadeiras',
  'Armários',
  'Outros',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image_url: string;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: number;
  whatsapp_number: string;
  store_name: string;
  updated_at: string;
}

