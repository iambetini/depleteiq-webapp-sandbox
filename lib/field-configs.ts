export interface AddressFieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea";
  required: boolean;
  placeholder: string;
  rows?: number;
  onFocus: () => void;
}

export function createAddressFieldConfig(
  onFocus: () => void,
  type: "text" | "textarea" = "text",
  rows?: number,
): AddressFieldConfig {
  return {
    name: "address",
    label: "Address",
    type,
    required: true,
    placeholder: "Enter address (click to create location)",
    rows,
    onFocus,
  };
}
