"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import type { DeviceType } from "@/types";

const DEVICES: { type: DeviceType; label: string; icon: string }[] = [
  { type: "phone", label: "Phone", icon: "📱" },
  { type: "tablet7", label: "7\" Tablet", icon: "📋" },
  { type: "tablet10", label: "10\" Tablet", icon: "📟" },
  { type: "none", label: "No Frame", icon: "⬛" },
];

export function DeviceSelector() {
  const deviceType = useAppStore((s) => s.deviceType);
  const setDeviceType = useAppStore((s) => s.setDeviceType);

  return (
    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
      {DEVICES.map((d) => (
        <button
          key={d.type}
          onClick={() => setDeviceType(d.type)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            deviceType === d.type
              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <span>{d.icon}</span>
          <span className="hidden sm:inline">{d.label}</span>
        </button>
      ))}
    </div>
  );
}
