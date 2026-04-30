"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import type { DeviceType } from "@/types";

interface FrameStyle {
  outerWidth: number;
  outerHeight: number;
  bezel: number;
  borderRadius: number;
  screenRadius: number;
  islandWidth: number;
  islandHeight: number;
  islandTop: number;
  sideButtons: boolean;
  frameColor: string;
  frameHighlight: string;
}

export const FRAMES: Record<DeviceType, FrameStyle> = {
  phone: {
    outerWidth: 392,
    outerHeight: 840,
    bezel: 8,
    borderRadius: 52,
    screenRadius: 44,
    islandWidth: 88,
    islandHeight: 26,
    islandTop: 12,
    sideButtons: true,
    frameColor: "#1a1a1c",
    frameHighlight: "#2d2d30",
  },
  tablet7: {
    outerWidth: 556,
    outerHeight: 780,
    bezel: 10,
    borderRadius: 34,
    screenRadius: 24,
    islandWidth: 0,
    islandHeight: 0,
    islandTop: 0,
    sideButtons: false,
    frameColor: "#1a1a1c",
    frameHighlight: "#2d2d30",
  },
  tablet10: {
    outerWidth: 636,
    outerHeight: 900,
    bezel: 12,
    borderRadius: 38,
    screenRadius: 28,
    islandWidth: 0,
    islandHeight: 0,
    islandTop: 0,
    sideButtons: false,
    frameColor: "#1a1a1c",
    frameHighlight: "#2d2d30",
  },
  none: {
    outerWidth: 0,
    outerHeight: 0,
    bezel: 0,
    borderRadius: 0,
    screenRadius: 0,
    islandWidth: 0,
    islandHeight: 0,
    islandTop: 0,
    sideButtons: false,
    frameColor: "transparent",
    frameHighlight: "transparent",
  },
};

export function DeviceFrame({ children }: { children: React.ReactNode }) {
  const deviceType = useAppStore((s) => s.deviceType);

  if (deviceType === "none") {
    return (
      <div data-export-target className="relative">
        {children}
      </div>
    );
  }

  const f = FRAMES[deviceType];
  const screenW = f.outerWidth - f.bezel * 2;
  const screenH = f.outerHeight - f.bezel * 2;

  return (
    <div className="flex items-center justify-center">
      <div
        data-export-target
        className="relative flex items-center justify-center"
        style={{
          width: f.outerWidth,
          height: f.outerHeight,
          borderRadius: f.borderRadius,
          background: `linear-gradient(145deg, ${f.frameColor} 0%, ${f.frameHighlight} 40%, #222226 70%, ${f.frameColor} 100%)`,
          boxShadow: `
            0 0 0 2.5px ${f.frameHighlight},
            0 0 0 3.5px rgba(0,0,0,0.4),
            0 35px 70px -15px rgba(0,0,0,0.6),
            0 0 0 1px rgba(255,255,255,0.06) inset,
            0 2px 4px rgba(255,255,255,0.03) inset
          `,
        }}
      >
        {/* Frame inner bevel */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: f.borderRadius,
            border: "1.5px solid rgba(255,255,255,0.08)",
            boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.04)",
          }}
        />

        {/* Side buttons (phone only) */}
        {f.sideButtons && (
          <>
            <div
              className="absolute -right-[1.5px] bg-[#2c2c30] border border-[#3a3a3e]"
              style={{
                top: "26%",
                width: 2.5,
                height: 58,
                borderRadius: "0 2px 2px 0",
                boxShadow: "-1px 0 2px rgba(0,0,0,0.2)",
              }}
            />
            <div
              className="absolute -left-[1.5px] bg-[#2c2c30] border border-[#3a3a3e]"
              style={{
                top: "25%",
                width: 2.5,
                height: 24,
                borderRadius: "2px 0 0 2px",
              }}
            />
            <div
              className="absolute -left-[1.5px] bg-[#2c2c30] border border-[#3a3a3e]"
              style={{
                top: "34%",
                width: 2.5,
                height: 36,
                borderRadius: "2px 0 0 2px",
              }}
            />
            <div
              className="absolute -left-[1.5px] bg-[#2c2c30] border border-[#3a3a3e]"
              style={{
                top: "42%",
                width: 2.5,
                height: 36,
                borderRadius: "2px 0 0 2px",
              }}
            />
          </>
        )}

        {/* Dynamic Island */}
        {f.islandWidth > 0 && (
          <div
            className="absolute bg-[#080808] z-10"
            style={{
              top: f.islandTop,
              left: "50%",
              transform: "translateX(-50%)",
              width: f.islandWidth,
              height: f.islandHeight,
              borderRadius: f.islandHeight / 2,
              boxShadow: "0 0 0 0.5px rgba(255,255,255,0.05) inset",
            }}
          />
        )}

        {/* Screen */}
        <div
          className="overflow-hidden bg-white"
          style={{
            width: screenW,
            height: screenH,
            borderRadius: f.screenRadius,
            boxShadow: "0 0 0 0.5px rgba(0,0,0,0.15) inset",
          }}
        >
          {children}
        </div>

        {/* Home indicator */}
        {f.sideButtons && (
          <div
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-black/20 rounded-full z-10"
            style={{ width: 100, height: 4.5 }}
          />
        )}
      </div>
    </div>
  );
}
