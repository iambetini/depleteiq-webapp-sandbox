"use client";
import BrandForm from "@/components/dashboard/BrandForm";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/utils";
import { useCreateBrandMutation } from "@/store/brands";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";


export default function CreateBrandPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const [createBrand] = useCreateBrandMutation();

  const initialValues = {
    name: "",
    category: "",
    image: "",
    is_group_brand: false,
    packages: [
      {
        type: "",
        quantity: 0,
        width: 0,
        height: 0,
        length: 0,
        weight: 0,
        wholesale_price: 0,
        retail_price: 0,
        retail_price_with_markup: 0,
        og_price: 0,
        distributor_price: 0,
      },
    ],
  };

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
          wholesale_price: Yup.number().min(0.0, "Wholesale price must be at least 0").required("Wholesale price is required"),
          retail_price: Yup.number().min(0.0, "Retail price must be at least 0").required("Retail price is required"),
          retail_price_with_markup: Yup.number().min(0, "Price with markup must be at least 0"),
          og_price: Yup.number().min(0.0, "OG price must be at least 0").required("OG price is required"),
          distributor_price: Yup.number().min(0.0, "Distributor price must be at least 0").required("Distributor price is required"),
        })
      )
      .min(1, "At least one package is required"),
  });

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      const filteredPackages = values.packages.filter((pkg: any) => pkg.type && pkg.quantity > 0);
      const data = {
        name: values.name,
        category: values.category,
        image: values.image,
        is_group_brand: values.is_group_brand,
        packages: filteredPackages,
      };
      await createBrand(data).unwrap();
      toast({
        title: "Success",
        description: "Brand created successfully",
      });
      helpers.resetForm();
    } catch (error: any) {
      catchError(error, helpers.setFieldError);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <>
      <ViewPageHeader title="Create Brand" description="Add a new brand to the system" />
      <BrandForm
        mode="create"
        initialValues={initialValues}
        validationSchema={validationSchema}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onBack={() => router.back()}
      />
    </>
  );
}
