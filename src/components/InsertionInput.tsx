// InsertionInput.tsx
import React, { useCallback, useEffect } from 'react';
import { PageConfig } from "@/config";

interface InsertionInputProps {
    insertRef: React.RefObject<HTMLInputElement>;
    config: PageConfig;
    screenOffset: { x: number; y: number };
    selectionStart: { x: number; y: number };
    selectionEnd: { x: number; y: number };
    insertValue: string;
    setInsertValue: (value: string) => void;
}

export const InsertionInput: React.FC<InsertionInputProps> = ({
    insertRef,
    config,
    screenOffset,
    selectionStart,
    selectionEnd,
    insertValue,
    setInsertValue,
}) => {

    useEffect(() => {
        if (insertRef.current) {
            setTimeout(() => {
                insertRef.current?.focus();
            }, 0);
        }
    }, []);

    const insertionStyle: () => React.CSSProperties = useCallback(() => {
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
            backgroundColor: "#ffffff",
            borderColor: "#9ca3af",
            borderWidth: 3,
            transition: "background-color 0.05s, border-color 0.05s, left 0.05s, top 0.05s, width 0.05s, height 0.05s",
            outline: "none",
            fontSize: config.gridSize.height * 0.7,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
        };
    }, [selectionStart, selectionEnd, config.gridSize, screenOffset]);

    return (
        <div
            style={insertionStyle()}
        >
            <input
                type="text"
                className="outline-none w-[calc(100%+32px)] h-full bg-transparent"
                ref={insertRef}
                value={insertValue}
                onChange={(e) => setInsertValue(e.target.value)}
            />
        </div>
    );
};