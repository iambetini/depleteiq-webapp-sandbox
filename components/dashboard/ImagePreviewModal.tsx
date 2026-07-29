"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ZoomableImageViewer,
  type ZoomableImageViewerHandle,
} from "@/components/ui/zoomable-image-viewer";
import { ChevronLeft, ChevronRight, ExternalLink, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface ImagePreviewItem {
  url: string;
  label?: string;
}

interface ImagePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefer this for multi-image browsing. */
  images?: ImagePreviewItem[];
  /** Single-image fallback (devices, etc.). */
  url?: string | null;
  title: string;
  initialIndex?: number;
}

export default function ImagePreviewModal({
  open,
  onOpenChange,
  images,
  url,
  title,
  initialIndex = 0,
}: ImagePreviewModalProps) {
  const imageViewerRef = useRef<ZoomableImageViewerHandle>(null);
  const items: ImagePreviewItem[] =
    images && images.length > 0
      ? images
      : url
        ? [{ url }]
        : [];
  const [index, setIndex] = useState(initialIndex);
  const hasMultiple = items.length > 1;
  const current = items[Math.min(index, Math.max(items.length - 1, 0))];

  useEffect(() => {
    if (open) {
      setIndex(
        Math.min(Math.max(initialIndex, 0), Math.max(items.length - 1, 0)),
      );
      imageViewerRef.current?.reset();
    }
  }, [open, initialIndex, items.length]);

  useEffect(() => {
    imageViewerRef.current?.reset();
  }, [index]);

  const goPrev = () => {
    setIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
  };

  const goNext = () => {
    setIndex((prev) => (prev >= items.length - 1 ? 0 : prev + 1));
  };

  const displayTitle = current?.label
    ? `${title} — ${current.label}`
    : title || "Image preview";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-5xl sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{displayTitle}</DialogTitle>
          <DialogDescription>
            Double-click to zoom in on a spot, double-click again to zoom out.
            Drag to pan when zoomed in.
            {hasMultiple ? " Use the side arrows to browse all photos." : ""}
          </DialogDescription>
        </DialogHeader>
        {current && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => imageViewerRef.current?.reset()}
              >
                <RotateCcw className="mr-1 h-4 w-4" />
                Reset
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={current.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1 h-4 w-4" />
                  Open original
                </a>
              </Button>
              {hasMultiple && (
                <span className="ml-auto text-sm text-muted-foreground">
                  {index + 1} / {items.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {hasMultiple ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full"
                  onClick={goPrev}
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              ) : (
                <div className="h-10 w-10 shrink-0" aria-hidden />
              )}

              <div className="min-w-0 flex-1">
                <ZoomableImageViewer
                  key={current.url}
                  ref={imageViewerRef}
                  src={current.url}
                  alt={displayTitle}
                />
              </div>

              {hasMultiple ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full"
                  onClick={goNext}
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              ) : (
                <div className="h-10 w-10 shrink-0" aria-hidden />
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
