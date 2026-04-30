"use client";

import { useRef, useCallback } from "react";
import type { ScreenLayout, LayoutElement } from "@/types";
import { useAppStore } from "@/lib/store/useAppStore";

interface ScreenRendererProps {
  layout: ScreenLayout;
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function ElementRenderer({
  el,
  isSelected,
  onSelect,
}: {
  el: LayoutElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: el.x,
    top: el.y,
    width: el.width,
    height: el.height,
    zIndex: el.zIndex ?? 0,
    opacity: el.opacity ?? 1,
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
    cursor: "pointer",
  };

  const selectedRing = isSelected
    ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-transparent"
    : "";

  switch (el.type) {
    case "text":
      return (
        <div
          data-el-id={el.id}
          style={baseStyle}
          className={`${selectedRing}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(el.id);
          }}
        >
          <p
            style={{
              fontSize: el.fontSize ?? 16,
              fontWeight: el.fontWeight ?? 400,
              textAlign: el.textAlign ?? "left",
              color: el.color ?? "#000",
              fontFamily: el.fontFamily,
              lineHeight: 1.3,
              margin: 0,
              wordBreak: "break-word",
            }}
          >
            {el.text}
          </p>
        </div>
      );

    case "button":
      return (
        <div
          data-el-id={el.id}
          style={baseStyle}
          className={`flex items-center justify-center rounded-lg ${selectedRing} transition-shadow`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(el.id);
          }}
        >
          <div
            style={{
              backgroundColor: el.backgroundColor ?? "#3B82F6",
              borderRadius: el.borderRadius ?? 12,
              borderWidth: el.borderWidth,
              borderColor: el.borderColor,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: el.fontSize ?? 15,
              fontWeight: el.fontWeight ?? 600,
              color: el.color ?? "#fff",
              fontFamily: el.fontFamily,
            }}
          >
            {el.text}
          </div>
        </div>
      );

    case "image":
    case "icon":
      return (
        <div
          data-el-id={el.id}
          style={baseStyle}
          className={`${selectedRing} overflow-hidden`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(el.id);
          }}
        >
          {el.src ? (
            <img
              src={el.src}
              alt={el.text || ""}
              style={{
                width: "100%",
                height: "100%",
                objectFit: el.objectFit ?? "cover",
                borderRadius: el.borderRadius ?? 0,
              }}
              draggable={false}
            />
          ) : el.placeholder ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: el.backgroundColor ?? "#e5e7eb",
                borderRadius: el.borderRadius ?? 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: el.fontSize ?? 24,
              }}
            >
              {el.placeholder}
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: el.backgroundColor ?? "#e5e7eb",
                borderRadius: el.borderRadius ?? 8,
                backgroundImage:
                  "repeating-linear-gradient(45deg, #d1d5db 0, #d1d5db 2px, transparent 0, transparent 10px)",
              }}
            />
          )}
        </div>
      );

    case "shape":
      return (
        <div
          data-el-id={el.id}
          style={{
            ...baseStyle,
            backgroundColor: el.backgroundColor ?? "transparent",
            borderRadius: el.borderRadius ?? 0,
            borderWidth: el.borderWidth,
            borderColor: el.borderColor,
            borderStyle: el.borderWidth ? "solid" : "none",
          }}
          className={selectedRing}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(el.id);
          }}
        />
      );

    default:
      return null;
  }
}

export function ScreenRenderer({
  layout,
  interactive = true,
  className = "",
  children,
}: ScreenRendererProps) {
  const selectedElementId = useAppStore((s) => s.selectedElementId);
  const selectElement = useAppStore((s) => s.selectElement);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = useCallback(() => {
    if (interactive) {
      selectElement(null);
    }
  }, [interactive, selectElement]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: layout.width,
        height: layout.height,
        backgroundColor: layout.background || "#ffffff",
      }}
      onClick={handleCanvasClick}
    >
      {layout.elements.map((el) => (
        <ElementRenderer
          key={el.id}
          el={el}
          isSelected={interactive && selectedElementId === el.id}
          onSelect={selectElement}
        />
      ))}
      {children}
    </div>
  );
}
