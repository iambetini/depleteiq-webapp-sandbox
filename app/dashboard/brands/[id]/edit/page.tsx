"use client";
import BrandForm from "@/components/dashboard/BrandForm";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { catchError } from "@/lib/utils";
import { useUpdateBrandMutation } from "@/store/brands";
import { BrandPackage } from "@/types/brand";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import * as Yup from "yup";
import { useContext } from "../layout";
import { toast } from "@/hooks/use-toast";

export default function EditBrandPage() {
  const { brand, isLoading, fetchBrand } = useContext();
  const router = useRouter();
  
  const [updateBrand] = useUpdateBrandMutation();
  const initialValues = useMemo(() => {
    if (!brand) return null;
    return {
      name: brand.name || "",
      category: brand.category || "",
      image: brand.image || "",
      is_group_brand: brand.is_group_brand || false,
      packages: (brand.packages || []).map((pkg: BrandPackage) => ({
        uuid: pkg.uuid,
        type: pkg.type || "",
        quantity: pkg.quantity || 0,
        width: pkg.width || 0,
        height: pkg.height || 0,
        length: pkg.length || 0,
        weight: pkg.weight || 0,
        wholesale_price: pkg.wholesale_price || 0,
        retail_price: pkg.retail_price || 0,
        retail_price_with_markup: pkg.retail_price_with_markup || 0,
        og_price: pkg.og_price || 0,
        distributor_price: pkg.distributor_price || 0,
      })),
    };
  }, [brand]);
  if (!brand) { return null; }

  const validationSchema = Yup.object({
    name: Yup.string().required("Brand name is required"),
    category: Yup.string().required("Category is required"),
    image: Yup.string(),
    is_group_brand: Yup.boolean(),
    packages: Yup.array()
      .of(
        Yup.object({
          type: Yup.string().required("Type is required"),
          quantity: Yup.number().min(1, "Quantity must be greater than 0").required("Quantity is required"),
          width: Yup.number().min(0, "Width must be at least 0"),
          height: Yup.number().min(0, "Height must be at least 0"),
          length: Yup.number().min(0, "Length must be at least 0"),
          weight: Yup.number().min(0, "Weight must be at least 0"),
          wholesale_price: Yup.number().min(0.0, "Wholesale price must be greater than 0").required("Wholesale price is required"),
          retail_price: Yup.number().min(0.0, "Retail price must be at least 0").required("Retail price is required"),
          retail_price_with_markup: Yup.number().min(0, "Price with markup must be at least 0"),
          og_price: Yup.number().min(0.0, "OG price must be at least 0").required("OG price is required"),
          distributor_price: Yup.number().min(0.0, "Distributor price must be at least 0").required("Distributor price is required"),
        })
      )
      .min(1, "At least one package is required"),
  });

  const handleSubmit = async (values: any, { setSubmitting, setFieldError }: any) => {
    try {
      const filteredPackages = values.packages.filter((pkg: BrandPackage) => pkg.type && pkg.quantity > 0);
      const data = {
        name: values.name,
        category: values.category,
        image: values.image,
        is_group_brand: values.is_group_brand,
        packages: filteredPackages,
      };
      await updateBrand({ id: brand.uuid, data }).unwrap();
      toast({
        title: "Success",
        description: "Brand updated successfully",
      });
      fetchBrand();
      router.push(`/dashboard/brands/${brand.uuid}`);
    } catch (error: any) {
      catchError(error, setFieldError);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !initialValues) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ViewPageHeader title="Edit Brand" description="Update brand details" />
      <BrandForm
        mode="edit"
        initialValues={initialValues}
        validationSchema={validationSchema}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onBack={() => router.back()}
      />
    </>
  );
}
