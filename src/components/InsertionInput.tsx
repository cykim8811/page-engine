// InsertionInput.tsx
import React, { useCallback, useRef, useEffect } from 'react';
import { PageConfig } from "@/config";

interface InsertionInputProps {
    config: PageConfig;
    screenOffset: { x: number; y: number };
    selectionStart: { x: number; y: number };
    selectionEnd: { x: number; y: number };
    insertValue: string;
    setInsertValue: (value: string) => void;
}

export const InsertionInput: React.FC<InsertionInputProps> = ({
    config,
    screenOffset,
    selectionStart,
    selectionEnd,
    insertValue,
    setInsertValue,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const insertionStyle = useCallback(() => {
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
            backgroundColor: "#00000000",
            borderColor: "#9ca3af",
            borderWidth: 3,
            transition: "background-color 0.05s, border-color 0.05s, left 0.05s, top 0.05s, width 0.05s, height 0.05s",
            outline: "none",
            fontSize: config.gridSize.height - 2,
            fontFamily: "monospace",
        };
    }, [selectionStart, selectionEnd, config.gridSize, screenOffset]);

    return (
        <input
            type="text"
            style={insertionStyle()}
            ref={inputRef}
            value={insertValue}
            onChange={(e) => setInsertValue(e.target.value)}
        />
    );
};