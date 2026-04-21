import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage, FieldArray } from "formik";
import { Plus, Trash2 } from "lucide-react";

interface ItemsFieldArrayProps {
  name: string;
  label: string;
  items: Array<{ name: string; quantity: number }>;
  setFieldValue: (field: string, value: any) => void;
  errors?: Record<string, any>;
}

export function ItemsFieldArray({
  name,
  label,
  items,
  setFieldValue,
  errors,
}: ItemsFieldArrayProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#444444]">{label}</h3>
        <FieldArray
          name={name}
          render={(arrayHelpers) => (
            <Button
              type="button"
              className="bg-white hover:bg-white-800 text-black border-[1px] border-[#000000] transition-all duration-200"
              onClick={() =>
                arrayHelpers.push({
                  name: "",
                  quantity: 1,
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        />
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          No items added yet. Click "Add Item" to start.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card
              key={index}
              className="p-6 border-2 border-gray-100 hover:border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-r from-[#ff6600] to-[#ff6b00] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <h4 className="text-lg font-bold text-[#444444]">Item {index + 1}</h4>
                </div>
                {items.length > 1 && (
                  <FieldArray
                    name={name}
                    render={(arrayHelpers) => (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-[#444444]">
                    Item Name <span className="text-[#ff0000]">*</span>
                  </Label>
                  <Input
                    type="text"
                    name={`${name}[${index}].name`}
                    value={item.name}
                    onChange={(e) =>
                      setFieldValue(`${name}[${index}].name`, e.target.value)
                    }
                    placeholder="Enter item name"
                    className="h-11 border-2 transition-all duration-200"
                  />
                  <ErrorMessage
                    name={`${name}[${index}].name`}
                    component="p"
                    className="text-sm text-[#ff0000] font-medium"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-[#444444]">
                    Quantity <span className="text-[#ff0000]">*</span>
                  </Label>
                  <Input
                    type="number"
                    name={`${name}[${index}].quantity`}
                    value={item.quantity}
                    onChange={(e) =>
                      setFieldValue(`${name}[${index}].quantity`, Number(e.target.value))
                    }
                    placeholder="0"
                    min="1"
                    className="h-11 border-2 transition-all duration-200"
                  />
                  <ErrorMessage
                    name={`${name}[${index}].quantity`}
                    component="p"
                    className="text-sm text-[#ff0000] font-medium"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
