import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandPackage } from "@/types/brand";
import { ErrorMessage, FieldArray, Form, Formik } from "formik";
import { Plus, Save, Trash2, Upload, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useImageUpload } from "@/hooks/use-image-upload";

// Default brand image fallback URL
const DEFAULT_BRAND_IMAGE_URL = process.env.NEXT_PUBLIC_DEFAULT_BRAND_IMAGE_URL || 'https://depleteiqstore.s3.eu-west-2.amazonaws.com/brand-images/1765453346869-w0msa6stce.jpg';

interface BrandFormProps {
  mode: "create" | "edit";
  initialValues: any;
  validationSchema: any;
  isLoading: boolean;
  onSubmit: (values: any, helpers: any) => Promise<void>;
  onBack: () => void;
}

export function BrandForm({
  mode,
  initialValues,
  validationSchema,
  isLoading,
  onSubmit,
  onBack,
}: BrandFormProps) {
  // Image upload hook
  const { uploadImage, isUploading, previewUrl, setPreviewUrl, clearPreview } = useImageUpload({
    folder: 'brand-images',
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/*'],
    provider: 'aws-s3-proxy',
    showToast: false,
  });

  // Track image changes
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection (preview only, no upload)
  const handleImageSelection = (file: File) => {
    setSelectedFile(file);
    setHasImageChanged(true);

    // Create preview URL for the selected file
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission with image upload
  const handleSubmit = async (values: any, helpers: any) => {
    try {
      let finalValues = { ...values };

      // Upload image only if it has changed
      if (hasImageChanged && selectedFile) {
        finalValues.image = (await uploadImage(selectedFile)) || DEFAULT_BRAND_IMAGE_URL;
      }

      await onSubmit(finalValues, helpers);

      // Reset image state after successful submission
      if (mode === "create") {
        clearPreview();
        setSelectedFile(null);
        setHasImageChanged(false);
        helpers.setFieldValue('image', '');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      // Re-throw error to be handled by the parent component
      throw error;
    }
  };

  // Update preview URL when initialValues.image changes
  useEffect(() => {
    if (initialValues.image && initialValues.image.trim() !== "") {
      setPreviewUrl(initialValues.image);
      setHasImageChanged(false);
      setSelectedFile(null);
    } else {
      setPreviewUrl(null);
      setHasImageChanged(false);
      setSelectedFile(null);
    }
  }, [initialValues.image, setPreviewUrl]);
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl px-4 sm:px-6 lg:px-8">
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, setFieldValue, isSubmitting, resetForm }) => (
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#ff6600] to-[#ff6b00] text-white rounded-t-lg">
                {/* <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                <div className="text-center lg:text-left">
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {mode === "create" ? "Create New Brand" : "Edit Brand"}
                  </CardTitle>
                  <CardDescription className="text-orange-100 text-base">
                    {mode === "create"
                      ? "Enter the details for the new brand and configure packages"
                      : "Update the brand information and package details"}
                  </CardDescription>
                </div>
              </div> */}

                <div className="flex flex-col items-center space-y-4 mt-8">
                  <div className="relative group cursor-pointer">
                    <input
                      ref={fileInputRef}
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          handleImageSelection(file);
                        }
                      }}
                      className="hidden"
                      disabled={isSubmitting}
                    />

                    <label htmlFor="image" className="flex items-center justify-center relative group">
                      {isSubmitting && hasImageChanged ? (
                        <div className="h-56 w-56 flex items-center justify-center rounded-2xl border-2 border-dashed border-white/30 bg-white/10 backdrop-blur-sm">
                          <Loader2 className="h-10 w-10 animate-spin text-white" />
                        </div>
                      ) : previewUrl ? (
                        <>
                          <Image
                            src={previewUrl}
                            alt="Brand Image"
                            width={224}
                            height={224}
                            className="h-56 w-56 rounded-2xl object-cover border-4 border-white shadow-2xl"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl">
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                              <span className="text-white text-sm font-semibold">Click to change</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="h-56 w-56 flex items-center justify-center rounded-2xl border-2 border-dashed border-white/30 bg-white/10 backdrop-blur-sm text-white hover:border-white/50 hover:bg-white/20 transition-all duration-300">
                          <div className="text-center px-6">
                            <Upload className="h-12 w-12 mx-auto mb-3 text-white" />
                            <span className="text-white font-medium">Add Brand Image</span>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  {previewUrl && !isSubmitting && (
                    <div className="text-sm text-orange-100 text-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                      {hasImageChanged ? "Image selected - will upload on form submission" : "Click the image above to change"}
                    </div>
                  )}
                  {isSubmitting && hasImageChanged && (
                    <div className="text-sm text-orange-100 text-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                      Uploading image...
                    </div>
                  )}
                  {!previewUrl && !isSubmitting && (
                    <div className="text-sm text-orange-100 text-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                      Upload a brand image (JPG, PNG, GIF - Max 5MB)
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <Form className="space-y-10">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-[#444444]">Basic Information</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-semibold text-[#444444]">
                          Brand Name <span className="text-[#ff0000]">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          placeholder="Enter brand name"
                          className="h-12 border-2 transition-all duration-200"
                        />
                        <ErrorMessage name="name" component="p" className="text-sm text-[#ff0000] font-medium" />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="category" className="text-sm font-semibold text-[#444444]">
                          Category <span className="text-[#ff0000]">*</span>
                        </Label>
                        <Select
                          value={values.category}
                          onValueChange={(value) => setFieldValue("category", value)}
                        >
                          <SelectTrigger className="h-12 border-2 transition-all duration-200">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FnB">Food & Beverage</SelectItem>
                            <SelectItem value="PC">Personal Care</SelectItem>
                            <SelectItem value="Pharma">Pharmaceutical</SelectItem>
                          </SelectContent>
                        </Select>
                        <ErrorMessage name="category" component="p" className="text-sm text-[#ff0000] font-medium" />
                      </div>
                    </div>
                  </div>
                  {/* Package Information */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#444444]">Package Information</h3>
                      <FieldArray
                        name="packages"
                        render={arrayHelpers => (
                          <Button
                            type="button"
                            className="bg-white hover:bg-white-800 text-black border-[1px] border-[#000000] transition-all duration-200"
                            onClick={() =>
                              arrayHelpers.push({
                                type: "",
                                quantity: 0,
                                wholesale_price: 0,
                                retail_price: 0,
                                retail_price_with_markup: 0,
                                og_price: 0,
                                distributor_price: 0,
                              })
                            }
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Package
                          </Button>
                        )}
                      />
                    </div>
                    <div className="space-y-6">
                      {values.packages.map((pkg: BrandPackage, index: number) => (
                        <Card key={pkg.uuid || index} className="p-6 border-2 border-gray-100 hover:border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-gradient-to-r from-[#ff6600] to-[#ff6b00] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <h4 className="text-lg font-bold text-[#444444]">Package {index + 1}</h4>
                            </div>
                            {values.packages.length > 1 && (
                              <FieldArray
                                name="packages"
                                render={arrayHelpers => (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#ff0000] hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                                    onClick={() => arrayHelpers.remove(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-[#444444]">
                                Package Type <span className="text-[#ff0000]">*</span>
                              </Label>
                              <Select
                                value={pkg.type}
                                onValueChange={value => setFieldValue(`packages[${index}].type`, value)}
                              >
                                <SelectTrigger className="h-11 border-2 transition-all duration-200">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bottle">Bottle</SelectItem>
                                  <SelectItem value="can">Can</SelectItem>
                                  <SelectItem value="pack">Pack</SelectItem>
                                  <SelectItem value="carton">Carton</SelectItem>
                                  <SelectItem value="box">Box</SelectItem>
                                  <SelectItem value="sachet">Sachet</SelectItem>
                                </SelectContent>
                              </Select>
                              <ErrorMessage name={`packages[${index}].type`} component="p" className="text-sm text-[#ff0000] font-medium" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-[#444444]">
                                Quantity <span className="text-[#ff0000]">*</span>
                              </Label>
                              <Input
                                type="number"
                                name={`packages[${index}].quantity`}
                                value={pkg.quantity}
                                onChange={e => setFieldValue(`packages[${index}].quantity`, Number(e.target.value))}
                                placeholder="0"
                                min="1"
                                className="h-11 border-2 transition-all duration-200"
                              />
                              <ErrorMessage name={`packages[${index}].quantity`} component="p" className="text-sm text-[#ff0000] font-medium" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-[#444444]">
                                Wholesale Price
                              </Label>
                              <Input
                                type="number"
                                name={`packages[${index}].wholesale_price`}
                                value={pkg.wholesale_price}
                                onChange={e => setFieldValue(`packages[${index}].wholesale_price`, Number(e.target.value))}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="h-11 border-2 transition-all duration-200"
                              />
                              <ErrorMessage name={`packages[${index}].wholesale_price`} component="p" className="text-sm text-[#ff0000] font-medium" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-[#444444]">
                                Retail Price
                              </Label>
                              <Input
                                type="number"
                                name={`packages[${index}].retail_price`}
                                value={pkg.retail_price}
                                onChange={e => {
                                  setFieldValue(`packages[${index}].retail_price`, Number(e.target.value));
                                  setFieldValue(`packages[${index}].retail_price_with_markup`, Number(e.target.value) * 1.2);
                                }}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="h-11 border-2 transition-all duration-200"
                              />
                              <ErrorMessage name={`packages[${index}].retail_price`} component="p" className="text-sm text-[#ff0000] font-medium" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-[#444444]">
                                Price with Markup
                              </Label>
                              <Input
                                type="number"
                                name={`packages[${index}].retail_price_with_markup`}
                                value={pkg.retail_price_with_markup}
                                onChange={e => setFieldValue(`packages[${index}].retail_price_with_markup`, Number(e.target.value))}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="h-11 border-2 transition-all duration-200"
                              />
                              <ErrorMessage name={`packages[${index}].retail_price_with_markup`} component="p" className="text-sm text-[#ff0000] font-medium" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-[#444444]">
                                OG Price <span className="text-[#ff0000]">*</span>
                              </Label>
                              <Input
                                type="number"
                                name={`packages[${index}].og_price`}
                                value={pkg.og_price}
                                onChange={e => setFieldValue(`packages[${index}].og_price`, Number(e.target.value))}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="h-11 border-2 transition-all duration-200"
                              />
                              <ErrorMessage name={`packages[${index}].og_price`} component="p" className="text-sm text-[#ff0000] font-medium" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-[#444444]">
                                Distributor Price
                              </Label>
                              <Input
                                type="number"
                                name={`packages[${index}].distributor_price`}
                                value={pkg.distributor_price}
                                onChange={e => setFieldValue(`packages[${index}].distributor_price`, Number(e.target.value))}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="h-11 border-2 transition-all duration-200"
                              />
                              <ErrorMessage name={`packages[${index}].distributor_price`} component="p" className="text-sm text-[#ff0000] font-medium" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-[#444444]">
                                Length (cm)
                              </Label>
                              <Input
                                type="number"
                                name={`packages[${index}].length`}
                                value={pkg.length}
                                onChange={e => setFieldValue(`packages[${index}].length`, Number(e.target.value))}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="h-11 border-2 transition-all duration-200"
                              />
                              <ErrorMessage name={`packages[${index}].length`} component="p" className="text-sm text-[#ff0000] font-medium" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-[#444444]">
                                Width (cm)
                              </Label>
                              <Input
                                type="number"
                                name={`packages[${index}].width`}
                                value={pkg.width}
                                onChange={e => setFieldValue(`packages[${index}].width`, Number(e.target.value))}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="h-11 border-2 transition-all duration-200"
                              />
                              <ErrorMessage name={`packages[${index}].width`} component="p" className="text-sm text-[#ff0000] font-medium" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-[#444444]">
                                Height (cm)
                              </Label>
                              <Input
                                type="number"
                                name={`packages[${index}].height`}
                                value={pkg.height}
                                onChange={e => setFieldValue(`packages[${index}].height`, Number(e.target.value))}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="h-11 border-2 transition-all duration-200"
                              />
                              <ErrorMessage name={`packages[${index}].height`} component="p" className="text-sm text-[#ff0000] font-medium" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-[#444444]">
                                Weight (kg)
                              </Label>
                              <Input
                                type="number"
                                name={`packages[${index}].weight`}
                                value={pkg.weight}
                                onChange={e => setFieldValue(`packages[${index}].weight`, Number(e.target.value))}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="h-11 border-2 transition-all duration-200"
                              />
                              <ErrorMessage name={`packages[${index}].weight`} component="p" className="text-sm text-[#ff0000] font-medium" />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-4 pt-8 border-t-2 border-[#eeeeee]">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onBack}
                      className="h-12 px-8 border-2 border-[#d9d9d9] text-[#444444] hover:bg-[#f8f8f8] hover:border-[#ababab] transition-all duration-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="h-12 px-8 bg-gradient-to-r from-[#ff6600] to-[#ff6b00] hover:from-[#ff6b00] hover:to-[#ff7700] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading || isSubmitting}
                    >
                      {isSubmitting && hasImageChanged ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {isLoading || isSubmitting
                        ? hasImageChanged && isSubmitting
                          ? "Uploading & Submitting..."
                          : mode === "create"
                            ? "Creating..."
                            : "Updating..."
                        : mode === "create"
                          ? "Create Brand"
                          : "Update Brand"}
                    </Button>
                  </div>
                </Form>
              </CardContent>
            </Card>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default BrandForm;
