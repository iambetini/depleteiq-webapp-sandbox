import jsPDF from "jspdf";
import type { Delivery } from "@/types/delivery";
import { loadPublicImageAsBase64 } from "./image-utils";

interface DeliveryReportOptions {
  includeLogo?: boolean;
  includeTimestamp?: boolean;
  includeFooter?: boolean;
}

export async function generateDeliveryReportTemplate(
  pdf: jsPDF, 
  delivery: Delivery, 
  options: DeliveryReportOptions
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Set font to support Unicode characters
  pdf.setFont("helvetica", "normal");
  
  // Colors
  const primaryColor = [255, 102, 0]; // Orange #ff6600
  const secondaryColor = [51, 51, 51]; // Dark gray
  const accentColor = [0, 102, 204]; // Blue
  const lightGray = [245, 245, 245];
  
  let yPosition = 20;

  // Header with logo and company info
  if (options.includeLogo) {
    try {
      // Load the actual logo
      const logoBase64 = await loadPublicImageAsBase64('/images/orbit-logo.png');
      pdf.addImage(logoBase64, 'PNG', pageWidth / 2 - 20, yPosition, 40, 15);
      
      // Tagline below logo - center aligned
      pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Delivery Management System", pageWidth / 2, yPosition + 20, { align: 'center' });
      
      yPosition += 30;
    } catch (error) {
      // Fallback if logo fails to load
      console.warn('Could not load logo, using text fallback:', error);
      
      // Company logo area (fallback) - center aligned
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(pageWidth / 2 - 15, yPosition, 30, 15, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("DIQ", pageWidth / 2, yPosition + 10, { align: 'center' });
      
      // Tagline below logo - center aligned
      pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Delivery Management System", pageWidth / 2, yPosition + 20, { align: 'center' });
      
      yPosition += 30;
    }
  }

  // Report title
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("DELIVERY REPORT", pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Report number and date
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.text(`Report ID: ${delivery.uuid}`, 20, yPosition);
  pdf.text(`Order Ref: ${delivery.order?.ref || 'N/A'}`, pageWidth - 20, yPosition, { align: 'right' });
  yPosition += 8;
  
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
  pdf.text(`Status: ${delivery.status.replace('_', ' ').toUpperCase()}`, pageWidth - 20, yPosition, { align: 'right' });
  yPosition += 20;

  // Delivery Overview Box
  pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.rect(20, yPosition, pageWidth - 40, 40, 'F');
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.text("DELIVERY OVERVIEW", 25, yPosition + 10);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Distance: ${delivery.distance} km`, 25, yPosition + 20);
  pdf.text(`Volume: ${delivery.total_order_volume} m³`, 25, yPosition + 28);
  pdf.text(`Weight: ${delivery.total_order_weight} kg`, 25, yPosition + 36);
  
  pdf.text(`Cost Ratio: ${delivery.cost_ratio}`, pageWidth - 25, yPosition + 20, { align: 'right' });
    pdf.text(`Burn Rate (NGN): ${delivery.delivery_burn_rate}`, pageWidth - 25, yPosition + 28, { align: 'right' });
  pdf.text(`Density: ${delivery.total_order_density} kg/m³`, pageWidth - 25, yPosition + 36, { align: 'right' });
  
  yPosition += 50;

  // Vehicle Information Section
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("VEHICLE ASSIGNMENT", 20, yPosition);
  yPosition += 10;

  // Vehicle info box
  pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.rect(20, yPosition, pageWidth - 40, 25, 'F');
  
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.text(`Vehicle Number: ${delivery.vehicle?.vehicle_number || 'N/A'}`, 25, yPosition + 8);
  pdf.text(`Vehicle Type: ${delivery.vehicle?.type || 'N/A'}`, 25, yPosition + 16);
  
  pdf.text(`Max Density: ${delivery.vehicle_max_density} kg/m³`, pageWidth - 25, yPosition + 8, { align: 'right' });
  pdf.text(`Coverage: ${delivery.vehicle_coverage} km`, pageWidth - 25, yPosition + 16, { align: 'right' });
  
  yPosition += 35;

  // Route Information Section
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("ROUTE INFORMATION", 20, yPosition);
  yPosition += 10;

  // Route info box
  pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.rect(20, yPosition, pageWidth - 40, 30, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  
  pdf.text("PICKUP LOCATION:", 25, yPosition + 8);
  pdf.text(`${delivery.from?.full_location || 'Not specified'}`, 25, yPosition + 15);
  
  pdf.text("DELIVERY LOCATION:", pageWidth - 25, yPosition + 8, { align: 'right' });
  pdf.text(`${delivery.to?.full_location || 'Not specified'}`, pageWidth - 25, yPosition + 15, { align: 'right' });
  
  yPosition += 40;

  // Performance Metrics Section
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("PERFORMANCE METRICS", 20, yPosition);
  yPosition += 10;

  // Metrics table
  const metrics = [
    { label: "Order Volume", value: `${delivery.total_order_volume} m³` },
    { label: "Order Weight", value: `${delivery.total_order_weight} kg` },
    { label: "Total Density", value: `${delivery.total_order_density} kg/m³` },
    { label: "Distance", value: `${delivery.distance} km` },
    { label: "Cost Ratio", value: delivery.cost_ratio },
    { label: "Burn Rate (NGN)", value: delivery.delivery_burn_rate },
  ];

  metrics.forEach((metric, index) => {
    const rowY = yPosition + (index * 8);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    
    pdf.text(metric.label, 25, rowY);
    pdf.text(metric.value.toString(), pageWidth - 25, rowY, { align: 'right' });
  });
  
  yPosition += (metrics.length * 8) + 15;

  // Comments Section (if exists)
  if (delivery.comment) {
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text("ADDITIONAL NOTES", 20, yPosition);
    yPosition += 10;

    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(20, yPosition, pageWidth - 40, 20, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    
    const commentLines = pdf.splitTextToSize(delivery.comment, pageWidth - 50);
    pdf.text(commentLines, 25, yPosition + 8);
    
    yPosition += 30;
  }

  // Footer
  if (options.includeFooter) {
    const footerY = pageHeight - 30;
    
    // Footer line
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.line(20, footerY, pageWidth - 20, footerY);
    
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.text("Generated by DepleteIQ Delivery Management System", pageWidth / 2, footerY + 8, { align: 'center' });
    pdf.text("For internal use only", pageWidth / 2, footerY + 15, { align: 'center' });
  }

}
