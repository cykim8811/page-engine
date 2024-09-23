// Selection.tsx
import React, { useCallback } from 'react';
import { PageConfig } from "@/config";

interface SelectionProps {
    mode: "select" | "insert";
    config: PageConfig;
    screenOffset: { x: number; y: number };
    selectionStart: { x: number; y: number };
    selectionEnd: { x: number; y: number };
    cursorPos: { x: number; y: number };
}

export const Selection: React.FC<SelectionProps> = ({ mode, config, screenOffset, selectionStart, selectionEnd, cursorPos }) => {
    const selectionStyle = useCallback(() => {
        const left = Math.min(selectionStart.x, selectionEnd.x);
        const top = Math.min(selectionStart.y, selectionEnd.y);
        const right = Math.max(selectionStart.x, selectionEnd.x);
        const bottom = Math.max(selectionStart.y, selectionEnd.y);

        return {
            position: "absolute" as const,
            left: left * config.gridSize.width + screenOffset.x - 1,
            top: top * config.gridSize.height + screenOffset.y - 1,
            width: (right - left + 1) * config.gridSize.width + 3,
            height: (bottom - top + 1) * config.gridSize.height + 3,
            backgroundColor: mode === "select" ? "#bfdbfe30" : "#00000000",
            borderColor: mode === "select" ? "#60a5fa" : "#9ca3af",
            borderWidth: 3,
            transition: "background-color 0.05s, border-color 0.05s, left 0.05s, top 0.05s, width 0.05s, height 0.05s",
            pointerEvents: "none" as const,
        };
    }, [selectionStart, selectionEnd, config.gridSize, screenOffset, mode]);

    const selectionCursorStyle = useCallback(() => {
        return {
            position: "absolute" as const,
            left: cursorPos.x * config.gridSize.width + screenOffset.x + 1,
            top: cursorPos.y * config.gridSize.height + screenOffset.y + 1,
            width: config.gridSize.width - 1,
            height: config.gridSize.height - 1,
            backgroundColor: "#547bee30",
            transition: "background-color 0.05s, border-color 0.05s, left 0.05s, top 0.05s, width 0.05s, height 0.05s",
        };
    }, [cursorPos, config.gridSize, screenOffset]);

    return (
        <>
            <div style={selectionStyle()} />
            {mode === "select" && <div style={selectionCursorStyle()} />}
        </>
    );
};