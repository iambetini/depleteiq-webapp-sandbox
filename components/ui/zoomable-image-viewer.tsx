"use client";

import { cn } from "@/lib/utils";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const ZOOM_SCALE = 2.5;

export type ZoomableImageViewerHandle = {
  reset: () => void;
};

interface ZoomableImageViewerProps {
  src: string;
  alt: string;
  className?: string;
}

export const ZoomableImageViewer = forwardRef<
  ZoomableImageViewerHandle,
  ZoomableImageViewerProps
>(function ZoomableImageViewer({ src, alt, className }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, translateX: 0, translateY: 0 });

  const reset = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      setTranslate({
        x: dragStart.current.translateX + (e.clientX - dragStart.current.x),
        y: dragStart.current.translateY + (e.clientY - dragStart.current.y),
      });
    };

    const onMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const content = contentRef.current;
    if (!content) return;

    if (scale > 1) {
      reset();
      return;
    }

    const rect = content.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const contentX = (px - translate.x) / scale;
    const contentY = (py - translate.y) / scale;

    setScale(ZOOM_SCALE);
    setTranslate({
      x: px - contentX * ZOOM_SCALE,
      y: py - contentY * ZOOM_SCALE,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1 || e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      translateX: translate.x,
      translateY: translate.y,
    };
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex min-h-[12rem] max-h-[75vh] items-center justify-center overflow-auto rounded-md border bg-muted/20 p-4 select-none",
        scale > 1
          ? isDragging
            ? "cursor-grabbing"
            : "cursor-grab"
          : "cursor-zoom-in",
        className,
      )}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <div
        ref={contentRef}
        className="flex items-center justify-center"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 150ms ease-out",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="pointer-events-none mx-auto block h-auto max-h-[70vh] w-auto max-w-full select-none object-contain"
        />
      </div>
    </div>
  );
});
