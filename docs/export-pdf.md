# PDF Export System

This directory contains the PDF export system for the DepleteIQ application. The system is designed to be flexible and reusable across different data types.

## Architecture

### Components

1. **GenericPdfExportButton** (`/components/dashboard/GenericPdfExportButton.tsx`)
   - Generic PDF export component that works with any data type
   - Supports custom templates and default key-value pair export
   - Configurable export options (logo, timestamp, footer)

2. **Specific Export Components** (e.g., `DeliveryPdfExportButton`)
   - Wrapper components that configure the generic component for specific data types
   - Define field mappings and custom templates

### Templates

Templates are located in `/lib/pdf-templates/` and provide custom PDF layouts:

1. **delivery-report.ts** - Professional delivery report template with:
   - Company branding and actual logo from `/images/orbit-logo.png`
   - Center-aligned logo with tagline positioned below
   - Structured sections (Overview, Vehicle, Route, Metrics)
   - Professional styling with colors and layout
   - Clean performance metrics list
   - Comments section
   - Async logo loading with fallback

## Usage

### For Delivery Reports

```tsx
import DeliveryPdfExportButton from "@/components/dashboard/DeliveryPdfExportButton";

<DeliveryPdfExportButton delivery={deliveryData} />
```

### For Custom Data Types

```tsx
import GenericPdfExportButton from "@/components/dashboard/GenericPdfExportButton";

const exportOptions = {
  title: "My Report",
  fileName: "my-report.pdf",
  categories: [
    {
      name: "Basic Info",
      fields: [
        { key: "name", label: "Name", value: data.name },
        { key: "email", label: "Email", value: data.email }
      ]
    }
  ],
  customTemplate: myCustomTemplate // Optional
};

<GenericPdfExportButton data={myData} options={exportOptions} />
```

## Creating Custom Templates

1. Create a new template file in `/lib/pdf-templates/`
2. Export a function that takes `(pdf: jsPDF, data: any, options: any) => void`
3. Use jsPDF methods to create your custom layout
4. Import and use in your specific export component

### Template Example

```typescript
import jsPDF from "jspdf";

export function generateMyCustomTemplate(
  pdf: jsPDF, 
  data: any, 
  options: any
) {
  // Your custom PDF generation logic here
  pdf.setFontSize(16);
  pdf.text("Custom Report", 20, 20);
  // ... more layout code
}
```

## Features

- **Flexible Data Mapping**: Works with any object structure using dot notation
- **Custom Templates**: Professional layouts for specific use cases
- **User Selection**: Users can choose what sections to include
- **Branding**: Consistent company branding with actual logo integration
- **Logo Integration**: Automatic logo loading from `/images/orbit-logo.png` with fallback
- **Async Support**: Templates can be async for complex operations like image loading
- **Error Handling**: Comprehensive error handling with user feedback
- **Responsive**: Works on all screen sizes

## Logo Integration

The system automatically loads the company logo from `/images/orbit-logo.png`:

```typescript
import { loadPublicImageAsBase64 } from "@/lib/pdf-templates/image-utils";

// In your template function
const logoBase64 = await loadPublicImageAsBase64('/images/orbit-logo.png');
pdf.addImage(logoBase64, 'PNG', x, y, width, height);
```

**Features:**
- Automatic base64 conversion
- Error handling with fallback
- Supports both PNG and other formats
- Works with public folder assets

## Styling Guidelines

When creating custom templates, follow these guidelines:

- Use consistent color scheme (primary orange #ff6600, secondary gray, accent blue)
- Include company logo and branding with center alignment
- Use proper typography hierarchy
- Add appropriate spacing and margins
- Include page numbers and footers
- Make reports look professional and agency-standard
- Handle logo loading errors gracefully with fallbacks
- Center-align header elements for professional appearance
