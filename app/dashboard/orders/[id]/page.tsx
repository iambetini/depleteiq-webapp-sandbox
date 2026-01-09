"use client";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Modal from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/use-file-upload";
import SuccessIcon from "@/images/success.svg";
import { apiClient } from "@/lib/api-client";
import type { Order } from "@/types/order";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useContext } from "./layout";

// ============ Constants ============
const FILE_UPLOAD_CONFIG = {
  folder: "documents",
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png'
  ],
  provider: 'aws-s3-proxy' as const,
};

const ALLOWED_ROLES_FOR_PAYMENT = ["treasury", "sales-admin", "super-admin"];
const ALLOWED_ROLES_FOR_APPROVAL = ["sales-admin"];
const DOCUMENT_UPLOAD_STATUSES = ["confirmed", "approved", "delivered", "fulfilled"];

// ============ Sub-Components ============

interface DocumentSectionProps {
  invoice_url?: string;
  receipt_url?: string;
}

function DocumentsSection({ invoice_url, receipt_url }: DocumentSectionProps) {
  if (!invoice_url && !receipt_url) return null;

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-[#333333] mb-4">Documents</h3>
      <div className="flex gap-4">
        {invoice_url && (
          <a
            href={invoice_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#FF6600] text-white text-sm font-semibold rounded hover:bg-[#ff6b00] transition-colors"
          >
            View Invoice
          </a>
        )}
        {receipt_url && (
          <a
            href={receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#FF6600] text-white text-sm font-semibold rounded hover:bg-[#ff6b00] transition-colors"
          >
            View Receipt
          </a>
        )}
      </div>
    </div>
  );
}

interface FooterButtonsProps {
  userRole: string;
  orderStatus: string;
  isSubmitting: boolean;
  invoice_url?: string;
  receipt_url?: string;
  handleRequestUpdate: () => void;
  handleConfirmPayment: () => void;
  handleApproveOrder: () => void;
  onUploadDocuments: (type: 'invoice' | 'receipt') => void;
}

function FooterButtons({
  userRole,
  orderStatus,
  isSubmitting,
  invoice_url,
  receipt_url,
  handleRequestUpdate,
  handleConfirmPayment,
  handleApproveOrder,
  onUploadDocuments,
}: FooterButtonsProps) {
  const hasInvoice = !!invoice_url;
  const hasReceipt = !!receipt_url;

  if (userRole && ALLOWED_ROLES_FOR_PAYMENT.includes(userRole)) {
    if (orderStatus === "pending") {
      return (
        <>
          <Button
            variant="outline"
            className="btn-secondary ml-2"
            onClick={handleRequestUpdate}
            disabled={isSubmitting}
          >
            Request update
          </Button>
          <Button
            className="btn-primary ml-2"
            onClick={handleConfirmPayment}
            disabled={isSubmitting}
          >
            Confirm Payment
          </Button>
        </>
      );
    }

    if (orderStatus === "update_requested") {
      return (
        <Badge className="text-[#FF6600] bg-[#FF660012] border-none p-3 rounded-[10px]">
          Awaiting update
        </Badge>
      );
    }

    if (orderStatus === "cancelled") {
      return null;
    }

    if (DOCUMENT_UPLOAD_STATUSES.includes(orderStatus as any)) {
      return (
        <>
          {!hasInvoice && (
            <Button variant="outline" onClick={() => onUploadDocuments('invoice')} disabled={isSubmitting}>
              Upload Invoice
            </Button>
          )}
          {!hasReceipt && (
            <Button variant="outline" onClick={() => onUploadDocuments('receipt')} disabled={isSubmitting}>
              Upload Receipt
            </Button>
          )}
          <Badge className="text-[#12B636] bg-[#1CD34412] border-none ml-2 p-3 rounded-[10px]">
            Payment Confirmed{" "}
            <Image
              src={SuccessIcon}
              alt="Success"
              width={16}
              height={16}
              className="inline mx-2"
            />
          </Badge>
        </>
      );
    }

    return (
      <Badge className="text-[#12B636] bg-[#1CD34412] border-none p-3 rounded-[10px]">
        Payment Confirmed{" "}
        <Image src={SuccessIcon} alt="Success" width={16} height={16} className="inline mx-2" />
      </Badge>
    );
  }

  if (userRole && ALLOWED_ROLES_FOR_APPROVAL.includes(userRole)) {
    if (orderStatus === "confirmed") {
      return (
        <>
          <Button
            className="btn-secondary"
            onClick={handleRequestUpdate}
            disabled={isSubmitting}
          >
            Request update
          </Button>
          <Button
            className="btn-primary ml-2"
            onClick={handleApproveOrder}
            disabled={isSubmitting}
          >
            Approve Order
          </Button>
        </>
      );
    }

    if (orderStatus === "update_requested") {
      return (
        <Badge className="text-[#FF6600] bg-[#FF660012] border-none p-3 rounded-[10px]">
          Awaiting update
        </Badge>
      );
    }

    if (DOCUMENT_UPLOAD_STATUSES.includes(orderStatus as any)) {
      return (
        <>
          {!hasInvoice && (
            <Button variant="outline" onClick={() => onUploadDocuments('invoice')} disabled={isSubmitting}>
              Upload Invoice
            </Button>
          )}
          {!hasReceipt && (
            <Button variant="outline" onClick={() => onUploadDocuments('receipt')} disabled={isSubmitting}>
              Upload Receipt
            </Button>
          )}
          {(hasInvoice && hasReceipt) && (
            <Badge className="text-[#12B636] bg-[#1CD34412] border-none ml-2 p-3 rounded-[10px]">
              Order Approved{" "}
              <Image
                src={SuccessIcon}
                alt="Success"
                width={16}
                height={16}
                className="inline mx-2"
              />
            </Badge>
          )}
        </>
      );
    }
  }

  return null;
}

export default function OrderDetailPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { order, fetchEntity } = useContext();

  // State management - grouped by concern
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [documentType, setDocumentType] = useState<'invoice' | 'receipt' | null>(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const [selectedInvoiceFile, setSelectedInvoiceFile] = useState<File | null>(null);
  const [selectedReceiptFile, setSelectedReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(true);

  // File upload hook
  const fileUpload = useFileUpload(FILE_UPLOAD_CONFIG);

  // Computed values
  const userRole = useMemo(() => user?.role?.name?.toLowerCase() ?? "", [user?.role?.name]);
  const orderStatus = useMemo(() => order?.status?.toLowerCase() ?? "pending", [order?.status]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!order?.uuid) return;
    setIsMessagesLoading(true);
    try {
      const response = await apiClient.get<{ items: any[] }>(
        `/orders/${order.uuid}/messages`
      );
      setMessages(response.data.items ?? []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsMessagesLoading(false);
    }
  }, [order?.uuid]);

  useEffect(() => {
    fetchMessages();
  }, [order?.uuid, fetchMessages]);

  // ============ Handlers ============

  const updateOrderStatus = useCallback(async (status: string, extra: Record<string, any> = {}) => {
    setIsSubmitting(true);
    try {
      await apiClient.put(`/orders/${order.uuid}`, {
        status,
        ...extra,
      });
      toast({
        title: "Success",
        description: `Order ${status.replace(/_/g, " ")} successfully`,
      });
      fetchEntity();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [order.uuid, fetchEntity]);

  const handleRequestUpdate = useCallback(() => {
    setIsModalOpen(true);
    setUpdateMessage("");
  }, []);

  const handleSubmitUpdate = useCallback(async () => {
    if (!updateMessage.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post(`/orders/${order.uuid}/messages`, {
        content: updateMessage,
        sales_admin: user?.uuid,
      });
      await updateOrderStatus("update_requested", { sales_admin: user?.uuid });
      toast({
        title: "Success",
        description: "Update request sent successfully",
      });
      setIsModalOpen(false);
      setUpdateMessage("");
      fetchMessages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send update request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [updateMessage, order.uuid, user?.uuid, updateOrderStatus, fetchMessages]);

  const handleCancelOrder = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await apiClient.put(`/orders/${order.uuid}`, { status: "cancelled" });
      toast({
        title: "Success",
        description: "Order cancelled successfully",
      });
      setIsCancelModalOpen(false);
      fetchEntity();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to cancel order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [order.uuid, fetchEntity]);

  const handleUploadDocuments = useCallback(async () => {
    setIsUploadingFiles(true);
    try {
      let file: File | null = null;
      let fieldName = '';
      let label = '';
      
      if (documentType === 'invoice') {
        file = selectedInvoiceFile;
        fieldName = 'invoice_url';
        label = 'Invoice';
      } else if (documentType === 'receipt') {
        file = selectedReceiptFile;
        fieldName = 'receipt_url';
        label = 'Receipt';
      }
      
      if (!file) {
        toast({
          title: "Error",
          description: `Please select a ${label.toLowerCase()} file to upload`,
          variant: "destructive",
        });
        return;
      }

      fileUpload.clearFiles();
      fileUpload.addFiles([file]);
      const uploadedFiles = await fileUpload.uploadFiles();

      if (!uploadedFiles?.length) {
        throw new Error(`Failed to upload ${label.toLowerCase()}`);
      }

      await apiClient.put(`/orders/${order.uuid}`, { [fieldName]: uploadedFiles[0].url });
      toast({
        title: "Success",
        description: `${label} uploaded successfully`,
      });

      setSelectedInvoiceFile(null);
      setSelectedReceiptFile(null);
      fileUpload.clearFiles();
      setIsDocumentsModalOpen(false);
      fetchEntity();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploadingFiles(false);
    }
  }, [documentType, selectedInvoiceFile, selectedReceiptFile, fileUpload, order.uuid, fetchEntity]);

  const handleConfirmPayment = useCallback(() => updateOrderStatus("confirmed"), [updateOrderStatus]);
  const handleApproveOrder = useCallback(() => updateOrderStatus("approved"), [updateOrderStatus]);

  if (!order) return null;

  return (
    <div>
      {/* Header */}
      <ViewPageHeader
        title="Order Details"
        description={order.ref ? `#${order.ref}` : ""}
      />
      {/* Main Content */}
      <Card className="w-full max-w-3xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="mb-6 text-[#FF6600] font-bold text-lg">
              #{order.ref}
            </div>
            <div className="operations flex items-center space-x-2">
              {['operations', 'super-admin'].includes(userRole) && (
                <div className="flex items-center gap-1 text-sm text-[#444] bg-[#F8F8F8] px-3 py-1 rounded">
                  <span className="font-medium text-[#12B636]">Order Token:</span>
                  <span className="font-mono text-xs text-[#333]">{order.fulfilled_token || 'N/A'}</span>
                  {order.fulfilled_token && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="ml-1 p-1 h-6 w-6"
                      onClick={() => {
                        navigator.clipboard.writeText(order.fulfilled_token!);
                        toast({
                          title: "Copied!",
                          description: "Order token copied to clipboard.",
                        });
                      }}
                      aria-label="Copy order token"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                        <rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </Button>
                  )}
                </div>
              )}
              <Link
                href={`/dashboard/orders/${order.uuid}/tracks`}
                className="ml-2 px-3 py-1 rounded bg-[#FF6600] text-white text-sm font-semibold hover:bg-[#ff6b00] transition-colors"
                style={{ textDecoration: "none" }}
              >
                View Tracks
              </Link>
            </div>
          </div>
          {/* Order Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Order Date</p>
              <p className="font-sm text-sm text-[#666666]">
                {order.created_at ?? 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Field Agent [{order.ime_vss?.role?.name.toUpperCase()}]</p>
              <p className="font-sm text-sm text-[#666666]">
                {order.ime_vss?.full_name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Distributor</p>
              <p className="font-sm text-sm text-[#666666]">
                {order.distributor_user?.distributor_details?.business_name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Status</p>
              <StatusBadge status={order.status || "N/A"} />
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Self Pickup</p>
              <p className="font-sm text-sm text-[#666666]">
                {order.self_pickup ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Promos</p>
              <p className="font-sm text-sm text-[#666666]">
                {order.promos?.type || "None"}
              </p>
            </div>
          </div>
          {/* Products Table */}
          <div className="mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Product</th>
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Quantity</th>
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Price</th>
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.brands?.map((brand: Order['brands'][number], idx: number) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100"
                      style={{ backgroundColor: idx % 2 === 0 ? "#F8F8F8" : undefined }}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-[#666666]">{brand.info.name}</p>
                          <p className="text-sm font-light text-[#666666]">{brand.info.category}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-light text-[#333333]">{brand.quantity}</td>
                      <td className="py-3 px-4 font-light text-[#333333]">₦{parseFloat(brand.price).toLocaleString()}</td>
                      <td className="py-3 px-4 font-light text-[#333333]">
                        ₦{(parseFloat(brand.price) * parseInt(brand.quantity)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-3 px-4 font-semibold text-[#333333]">Grand Total</td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4 font-semibold text-[#333333]">
                      ₦{order.total_amount ? parseFloat(order.total_amount).toLocaleString() : '0'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          {/* Documents Section - Show if at least one document is available */}
          <DocumentsSection
            invoice_url={order.invoice_url}
            receipt_url={order.receipt_url}
          />
        </CardContent>
        {/* Chat Section */}
        <div className="mb-8">
          {/* <h2 className="text-lg font-semibold mb-2 text-[#444]">Order Chat</h2> */}
          <div className="bg-[#f7f7f7] rounded-lg p-4 max-h-72 overflow-y-auto flex flex-col gap-2">
            {isMessagesLoading ? (
              <div className="text-gray-400 text-center">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-gray-400 text-center">No messages yet.</div>
            ) : (
              messages.map((msg, idx) => {
                const isCurrentUser = msg.sender.uuid === user?.uuid;
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow text-sm ${isCurrentUser
                        ? "bg-[#FF6600] text-white rounded-br-none"
                        : "bg-[#FFB37C1A] text-[#333] rounded-bl-none border"
                        }`}
                      style={{ wordBreak: "break-word" }}
                    >
                      <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                        <div className={`text-sm ${isCurrentUser ? "text-white" : "text-[#333]"} `}>
                          {isCurrentUser ? "You" : msg.sender.full_name}
                        </div>
                      </div>

                      {msg.content}
                      <div className="text-[10px] text-right mt-1 opacity-70">
                        {msg.created_at}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* Footer Buttons */}
        <div className="flex justify-between gap-2 m-4">
          <div>
            {(orderStatus === "pending" || orderStatus === "update_requested") && (
              <Button
                variant="destructive"
                onClick={() => setIsCancelModalOpen(true)}
                disabled={isSubmitting}
              >
                Cancel Order
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <FooterButtons
              userRole={userRole}
              orderStatus={orderStatus}
              isSubmitting={isSubmitting}
              invoice_url={order.invoice_url}
              receipt_url={order.receipt_url}
              handleRequestUpdate={handleRequestUpdate}
              handleConfirmPayment={handleConfirmPayment}
              handleApproveOrder={handleApproveOrder}
              onUploadDocuments={(type) => {
                setDocumentType(type);
                setIsDocumentsModalOpen(true);
              }}
            />
          </div>
        </div>
      </Card>

      <Modal open={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} size="sm-center" title="Cancel Order">
        <div className="grid gap-4 py-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel this order? This will change the order status to cancelled.
          </p>
        </div>
        <div className="flex justify-center gap-3 mt-4">
          <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} disabled={isSubmitting}>
            No, Keep Order
          </Button>
          <Button variant="destructive" onClick={handleCancelOrder} disabled={isSubmitting}>
            {isSubmitting ? "Cancelling..." : "Yes, Cancel Order"}
          </Button>
        </div>
      </Modal>

      {/* Request Update Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} size="third-right" title="Request Update">
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              placeholder="Enter your update request message..."
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button className="btn-primary" onClick={handleSubmitUpdate} disabled={isSubmitting || !updateMessage.trim()}>
            {isSubmitting ? "Sending..." : "Send Request"}
          </Button>
        </div>
      </Modal>

      {/* Documents Upload Modal */}
      <Modal
        open={isDocumentsModalOpen}
        onClose={() => {
          setIsDocumentsModalOpen(false);
          setDocumentType(null);
          setSelectedInvoiceFile(null);
          setSelectedReceiptFile(null);
        }}
        size="sm-center"
        title={documentType === 'invoice' ? 'Upload Invoice' : 'Upload Receipt'}
      >
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor={documentType === 'invoice' ? 'invoice' : 'receipt'} className="text-sm font-medium">
              {documentType === 'invoice' ? 'Invoice File' : 'Receipt File'}
            </label>
            <input
              id={documentType === 'invoice' ? 'invoice' : 'receipt'}
              type="file"
              accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (documentType === 'invoice') {
                  setSelectedInvoiceFile(file || null);
                } else if (documentType === 'receipt') {
                  setSelectedReceiptFile(file || null);
                }
              }}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-[#FF6600] file:text-white
                hover:file:bg-[#ff6b00]"
            />
            {(documentType === 'invoice' && selectedInvoiceFile) && (
              <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                <p className="text-sm text-green-700">✓ {selectedInvoiceFile.name}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInvoiceFile(null)}
                  className="text-red-600 hover:text-red-700"
                >Remove</Button>
              </div>
            )}
            {(documentType === 'receipt' && selectedReceiptFile) && (
              <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                <p className="text-sm text-green-700">✓ {selectedReceiptFile.name}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReceiptFile(null)}
                  className="text-red-600 hover:text-red-700"
                >Remove</Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsDocumentsModalOpen(false);
              setDocumentType(null);
              setSelectedInvoiceFile(null);
              setSelectedReceiptFile(null);
            }}
            disabled={isUploadingFiles}
          >Cancel</Button>
          <Button
            className="btn-primary"
            onClick={handleUploadDocuments}
            disabled={isUploadingFiles ||
              (documentType === 'invoice' ? !selectedInvoiceFile : !selectedReceiptFile)}
          >
            {isUploadingFiles
              ? 'Uploading...'
              : `Upload ${documentType === 'invoice' ? 'Invoice' : 'Receipt'}`}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
