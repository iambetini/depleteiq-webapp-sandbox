import { User } from "./user";

export interface VssSupplyBrandPackageBrand {
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

export interface VssSupplyBrandPackage {
  uuid: string;
  brand: VssSupplyBrandPackageBrand;
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

export interface VssSupplyBrand {
  uuid: string;
  vss_order_brand_id: string;
  brand_package: VssSupplyBrandPackage;
  price: string;
  quantity: number;
  reversed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VssSupplyStore {
  uuid: string;
  business?: any;
  location?: any;
  market?: any;
  coverage_area?: any;
  in_market?: boolean;
  promo_class?: string;
  category?: string[];
  has_qr?: boolean;
  qr_code?: any;
  created_at?: string;
  updated_at?: string;
}

export interface VssSupplyBusiness {
  uuid: string;
  user?: any;
  name: string;
  type: string;
  address: string;
  email?: string | null;
  phone?: string | null;
  location?: any;
  stores?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface VssSupply {
  uuid: string;
  total_amount: string;
  vss_user: User & {
    market?: any;
    market_assignment?: any;
    email_verified_at: string | null;
    is_active: boolean;
  };
  store: VssSupplyStore;
  business: VssSupplyBusiness;
  supplied_brands: VssSupplyBrand[];
  created_at: string;
  updated_at: string;
}
