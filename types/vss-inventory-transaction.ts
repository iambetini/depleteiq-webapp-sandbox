export interface VssInventoryBrand {
  uuid: string;
  name: string;
  category: string;
  is_group_brand: boolean;
  image: string;
  created_at: string;
  pcs_per_carton: number | null;
  packages: {
    uuid: string;
    type: string;
    quantity: number;
    og_price: number | string;
    distributor_price: number | string;
    wholesale_price: number | string;
    retail_price: number | string;
    retail_price_with_markup: number | string;
    height: number | string;
    width: number | string;
    length: number | string;
    weight: number | string;
  }[];
}

export interface VssInventoryBrandPackage {
  uuid: string;
  brand: VssInventoryBrand;
  type: string;
  quantity: number;
  og_price: number | string;
  distributor_price: number | string;
  wholesale_price: number | string;
  retail_price: number | string;
  retail_price_with_markup: number | string;
  height: number | string;
  width: number | string;
  length: number | string;
  weight: number | string;
}

export interface VssInventoryTransaction {
  uuid: string;
  type: string;
  vss_order_brand_id: string | null;
  vss_supply_brand_id: string | null;
  brand_package: VssInventoryBrandPackage;
  quantity: number;
  price: string;
  note: string | null;
  created_at: string;
  // Order specific (flat fields from API)
  vss_user_name?: string | null;
  vss_user?: { uuid?: string; full_name?: string; name?: string } | null;
  distributor_name?: string | null;
  distributor_phone?: string | null;
  distributor_user?: { uuid?: string; full_name?: string } | null;
  // Supply specific (flat fields from API)
  business_name?: string | null;
  business_phone?: string | null;
  business_type?: string | null;
  business?: { uuid?: string; name?: string } | null;
}
