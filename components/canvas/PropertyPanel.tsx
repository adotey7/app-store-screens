"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useAppStore } from "@/lib/store/useAppStore";
import type { LayoutElement } from "@/types";

export function PropertyPanel() {
  const layout = useAppStore((s) => s.currentLayout);
  const selectedElementId = useAppStore((s) => s.selectedElementId);
  const updateElement = useAppStore((s) => s.updateElement);
  const removeElement = useAppStore((s) => s.removeElement);

  const [showColorPicker, setShowColorPicker] = useState<
    "color" | "backgroundColor" | "borderColor" | null
  >(null);

  if (!layout || !selectedElementId) {
    return (
      <div className="w-72 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col h-full">
        <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center mt-8">
          Select an element on the canvas to edit its properties
        </p>
      </div>
    );
  }

  const el = layout.elements.find((e) => e.id === selectedElementId);
  if (!el) return null;

  function update(updates: Partial<LayoutElement>) {
    updateElement(selectedElementId!, updates);
  }

  const textTypes = ["text", "button"];
  const showText = textTypes.includes(el.type);
  const showBg = ["shape", "button", "image", "icon"].includes(el.type);
  const showRadius = ["shape", "button", "image", "icon"].includes(el.type);
  const showBorder = ["shape", "button", "image", "icon"].includes(el.type);

  return (
    <div className="w-72 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Properties
          </h3>
          <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full capitalize">
            {el.type}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Position */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Position
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-400">X</span>
              <input
                type="number"
                value={el.x}
                onChange={(e) => update({ x: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-400">Y</span>
              <input
                type="number"
                value={el.y}
                onChange={(e) => update({ y: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>
        </fieldset>

        {/* Size */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Size
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-400">Width</span>
              <input
                type="number"
                value={el.width}
                onChange={(e) => update({ width: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-400">Height</span>
              <input
                type="number"
                value={el.height}
                onChange={(e) => update({ height: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>
        </fieldset>

        {/* Rotation */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Rotation
          </legend>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={-180}
              max={180}
              value={el.rotation ?? 0}
              onChange={(e) => update({ rotation: Number(e.target.value) })}
              className="flex-1"
            />
            <input
              type="number"
              min={-180}
              max={180}
              value={el.rotation ?? 0}
              onChange={(e) => update({ rotation: Number(e.target.value) })}
              className="w-16 px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100 text-center"
            />
            <span className="text-xs text-zinc-400">&deg;</span>
          </div>
        </fieldset>

        {/* Text (for text & button types) */}
        {showText && (
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Text
            </legend>
            <textarea
              value={el.text || ""}
              onChange={(e) => update({ text: e.target.value })}
              rows={2}
              className="w-full px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100 resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-zinc-400">Font Size</span>
                <input
                  type="number"
                  value={el.fontSize || 16}
                  onChange={(e) => update({ fontSize: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-zinc-400">Weight</span>
                <select
                  value={el.fontWeight || 400}
                  onChange={(e) => update({ fontWeight: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100"
                >
                  <option value={300}>Light (300)</option>
                  <option value={400}>Normal (400)</option>
                  <option value={500}>Medium (500)</option>
                  <option value={600}>Semibold (600)</option>
                  <option value={700}>Bold (700)</option>
                  <option value={900}>Black (900)</option>
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-400">Align</span>
              <select
                value={el.textAlign || "left"}
                onChange={(e) =>
                  update({ textAlign: e.target.value as "left" | "center" | "right" })
                }
                className="w-full px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>
          </fieldset>
        )}

        {/* Colors */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Colors
          </legend>

          {/* Text Color */}
          {showText && (
            <div>
              <button
                onClick={() =>
                  setShowColorPicker(showColorPicker === "color" ? null : "color")
                }
                className="flex items-center gap-2 w-full text-xs"
              >
                <span
                  className="inline-block w-5 h-5 rounded border border-zinc-200 dark:border-zinc-700"
                  style={{ backgroundColor: el.color || "#000" }}
                />
                <span className="text-zinc-500 dark:text-zinc-400">Text Color</span>
              </button>
              {showColorPicker === "color" && (
                <div className="mt-2">
                  <HexColorPicker
                    color={el.color || "#000"}
                    onChange={(c) => update({ color: c })}
                  />
                </div>
              )}
            </div>
          )}

          {/* Background Color */}
          {showBg && (
            <div>
              <button
                onClick={() =>
                  setShowColorPicker(showColorPicker === "backgroundColor" ? null : "backgroundColor")
                }
                className="flex items-center gap-2 w-full text-xs mt-2"
              >
                <span
                  className="inline-block w-5 h-5 rounded border border-zinc-200 dark:border-zinc-700"
                  style={{ backgroundColor: el.backgroundColor || "#3B82F6" }}
                />
                <span className="text-zinc-500 dark:text-zinc-400">Background</span>
              </button>
              {showColorPicker === "backgroundColor" && (
                <div className="mt-2">
                  <HexColorPicker
                    color={el.backgroundColor || "#3B82F6"}
                    onChange={(c) => update({ backgroundColor: c })}
                  />
                </div>
              )}
            </div>
          )}

          {/* Border Color */}
          {showBorder && (
            <div>
              <button
                onClick={() =>
                  setShowColorPicker(showColorPicker === "borderColor" ? null : "borderColor")
                }
                className="flex items-center gap-2 w-full text-xs mt-2"
              >
                <span
                  className="inline-block w-5 h-5 rounded border border-zinc-200 dark:border-zinc-700"
                  style={{ backgroundColor: el.borderColor || "#000" }}
                />
                <span className="text-zinc-500 dark:text-zinc-400">Border Color</span>
              </button>
              {showColorPicker === "borderColor" && (
                <div className="mt-2">
                  <HexColorPicker
                    color={el.borderColor || "#000"}
                    onChange={(c) => update({ borderColor: c })}
                  />
                </div>
              )}
            </div>
          )}
        </fieldset>

        {/* Border */}
        {showBorder && (
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Border
            </legend>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={10}
                value={el.borderWidth || 0}
                onChange={(e) => update({ borderWidth: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-xs text-zinc-400 w-8 text-right">
                {el.borderWidth || 0}px
              </span>
            </div>
          </fieldset>
        )}

        {/* Border Radius */}
        {showRadius && (
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Border Radius
            </legend>
            <input
              type="range"
              min={0}
              max={48}
              value={el.borderRadius || 0}
              onChange={(e) => update({ borderRadius: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-zinc-400">{el.borderRadius || 0}px</span>
          </fieldset>
        )}

        {/* Opacity */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Opacity
          </legend>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={el.opacity ?? 1}
            onChange={(e) => update({ opacity: Number(e.target.value) })}
            className="w-full"
          />
          <span className="text-xs text-zinc-400">
            {Math.round((el.opacity ?? 1) * 100)}%
          </span>
        </fieldset>

        {/* Z-Index */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Z-Index
          </legend>
          <input
            type="number"
            value={el.zIndex ?? 0}
            onChange={(e) => update({ zIndex: Number(e.target.value) })}
            className="w-full px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100"
          />
        </fieldset>

        {/* Delete */}
        <button
          onClick={() => removeElement(el.id)}
          className="w-full py-2 text-xs font-medium text-red-500 hover:text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
        >
          Delete Element
        </button>
      </div>
    </div>
  );
}
