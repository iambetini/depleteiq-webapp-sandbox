import { User } from "./user";

export interface VssOrderBrandPackageBrand {
  uuid: string;
  name: string;
  category: string;
  is_group_brand: boolean;
  image: string;
  created_at: string;
  pcs_per_carton: number;
  packages: {
    uuid: string;
    type: string;
    quantity: number;
    og_price: string;
    distributor_price: string;
    wholesale_price: string;
    retail_price: string;
    retail_price_with_markup: string;
    height: string;
    width: string;
    length: string;
    weight: string;
  }[];
}

export interface VssOrderBrandPackage {
  uuid: string;
  brand: VssOrderBrandPackageBrand;
  type: string;
  quantity: number;
  og_price: string;
  distributor_price: string;
  wholesale_price: string;
  retail_price: string;
  retail_price_with_markup: string;
  height: string;
  width: string;
  length: string;
  weight: string;
}

export interface VssOrderBrand {
  uuid: string;
  negotiated_price: string;
  distributor_price: string;
  quantity: number;
  quantity_remaining: number;
  brand_package: VssOrderBrandPackage;
  created_at: string;
  updated_at: string;
}

export interface VssOrder {
  uuid: string;
  reference: string;
  ref?: string; // alias for reference for compatibility
  total_amount: string;
  vss_user: User & {
    email_verified_at: string | null;
    is_active: boolean;
  };
  distributor_user: User & {
    is_active: boolean;
    email_verified_at: string | null;
    distributor_details: {
      uuid: string;
      business_name: string;
      address: string;
      created_at?: string;
    };
    market?: any;
  };
  brands: VssOrderBrand[];
  created_at: string;
  updated_at: string;
}
