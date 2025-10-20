"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { Download, FileText } from "lucide-react";
import { useState } from "react";

interface ExportField {
  key: string;
  label: string;
  value: string | number | null | undefined;
  category?: string;
}

interface ExportCategory {
  name: string;
  fields: ExportField[];
}

interface PdfExportOptions {
  title: string;
  fileName: string;
  categories: ExportCategory[];
  includeLogo?: boolean;
  includeTimestamp?: boolean;
  includeFooter?: boolean;
  customTemplate?: (pdf: jsPDF, data: any, options: PdfExportOptions) => void | Promise<void>;
}

interface GenericPdfExportButtonProps {
  data: any;
  options: PdfExportOptions;
  className?: string;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
}

export default function GenericPdfExportButton({
  data,
  options,
  className,
  buttonText = "Export PDF",
  buttonIcon = <FileText className="mr-2 h-4 w-4" />
}: GenericPdfExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    options.categories.forEach(category => {
      initial[category.name] = true;
    });
    return initial;
  });
  const [includeLogo, setIncludeLogo] = useState(options.includeLogo ?? true);
  const [includeTimestamp, setIncludeTimestamp] = useState(options.includeTimestamp ?? true);
  const [includeFooter, setIncludeFooter] = useState(options.includeFooter ?? true);

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    setSelectedCategories(prev => ({ ...prev, [categoryName]: checked }));
  };

  const generatePdf = async () => {
    setIsExporting(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Use custom template if provided
      if (options.customTemplate) {
        await options.customTemplate(pdf, data, {
          ...options,
          includeLogo,
          includeTimestamp,
          includeFooter
        });
      } else {
        // Default generic template
        generateGenericTemplate(pdf, data, options, selectedCategories, includeLogo, includeTimestamp, includeFooter);
      }

      // Save the PDF
      pdf.save(options.fileName);

      toast({
        title: "Success",
        description: "PDF exported successfully",
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generateGenericTemplate = (
    pdf: jsPDF,
    data: any,
    options: PdfExportOptions,
    selectedCategories: Record<string, boolean>,
    includeLogo: boolean,
    includeTimestamp: boolean,
    includeFooter: boolean
  ) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let yPosition = 20;

    // Add logo if requested
    if (includeLogo) {
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("DepleteIQ", 20, yPosition);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(options.title, 20, yPosition + 7);
      yPosition += 20;
    }

    // Add timestamp if requested
    if (includeTimestamp) {
      const timestamp = new Date().toLocaleString();
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated on: ${timestamp}`, pageWidth - 20, 20, { align: 'right' });
    }

    // Add content sections
    options.categories.forEach(category => {
      if (!selectedCategories[category.name]) return;

      // Check if category has any fields with values
      const hasValues = category.fields.some(field => {
        const value = getNestedValue(data, field.key);
        return value !== null && value !== undefined && value !== '';
      });

      if (!hasValues) return;

      // Category header
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(category.name, 20, yPosition);
      yPosition += 10;

      // Category fields
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      category.fields.forEach(field => {
        const value = getNestedValue(data, field.key);
        if (value !== null && value !== undefined && value !== '') {
          pdf.text(`${field.label}: ${value}`, 20, yPosition);
          yPosition += 7;
        }
      });

      yPosition += 10;
    });

    // Add footer if requested
    if (includeFooter) {
      const footerY = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text("Generated by DepleteIQ Delivery Management System", pageWidth / 2, footerY, { align: 'center' });
    }
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const selectAll = () => {
    const newSelection: Record<string, boolean> = {};
    options.categories.forEach(category => {
      newSelection[category.name] = true;
    });
    setSelectedCategories(newSelection);
  };

  const deselectAll = () => {
    const newSelection: Record<string, boolean> = {};
    options.categories.forEach(category => {
      newSelection[category.name] = false;
    });
    setSelectedCategories(newSelection);
  };

  const hasSelectedCategories = Object.values(selectedCategories).some(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          {buttonIcon}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export {options.title} to PDF</DialogTitle>
          <DialogDescription>
            Select the information you want to include in the PDF export.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Content Sections</h4>
              <div className="space-y-2">
                {options.categories.map((category) => (
                  <div key={category.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.name}
                      checked={selectedCategories[category.name]}
                      onCheckedChange={(checked) => handleCategoryChange(category.name, checked as boolean)}
                    />
                    <Label htmlFor={category.name} className="text-sm">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Document Options</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeLogo"
                    checked={includeLogo}
                    onCheckedChange={(checked) => setIncludeLogo(checked as boolean)}
                  />
                  <Label htmlFor="includeLogo" className="text-sm">Include Company Logo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeTimestamp"
                    checked={includeTimestamp}
                    onCheckedChange={(checked) => setIncludeTimestamp(checked as boolean)}
                  />
                  <Label htmlFor="includeTimestamp" className="text-sm">Include Generation Timestamp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeFooter"
                    checked={includeFooter}
                    onCheckedChange={(checked) => setIncludeFooter(checked as boolean)}
                  />
                  <Label htmlFor="includeFooter" className="text-sm">Include Footer</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={generatePdf}
            disabled={isExporting || !hasSelectedCategories}
          >
            {isExporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
