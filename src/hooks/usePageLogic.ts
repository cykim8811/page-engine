// usePageLogic.ts
import { useState, useCallback, useEffect } from "react";
import { useScroll } from "@/hooks/useScroll";
import { PageConfig } from "@/config";
import { CellData } from "../components/Cell";

export const usePageLogic = (config: PageConfig) => {
    const { offset: rawScreenOffset, ref } = useScroll();
    const screenOffset = {
        x: Math.round(rawScreenOffset.x / config.gridSize.width) * config.gridSize.width,
        y: Math.round(rawScreenOffset.y / config.gridSize.height) * config.gridSize.height,
    };

    const [selectionStart, setSelectionStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [mode, setMode] = useState<"select" | "insert">("select");
    const [insertValue, setInsertValue] = useState<string>("");

    const cellData: { [key: string]: CellData } = {
        "10928": {
            pos: { x: 1, y: 1 },
            size: { width: 4, height: 4 },
        },
    };
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const x = Math.floor((e.clientX + screenOffset.x) / config.gridSize.width);
        const y = Math.floor((e.clientY + screenOffset.y) / config.gridSize.height);
        if (mode === "insert" && x >= selectionStart.x && x <= selectionEnd.x && y >= selectionStart.y && y <= selectionEnd.y) {
            return;
        }
        setMode("select");
        setSelectionStart({ x, y });
        setSelectionEnd({ x, y });
        setIsDragging(true);
    }, [screenOffset, config.gridSize]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;

        const x = Math.floor((e.clientX + screenOffset.x) / config.gridSize.width);
        const y = Math.floor((e.clientY + screenOffset.y) / config.gridSize.height);
        setSelectionEnd({ x, y });
    }, [isDragging, screenOffset, config.gridSize]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (mode === "select") {
            const moveSelection = (dx: number, dy: number) => {
                const originalPos = e.shiftKey ? selectionEnd : selectionStart;
                const newPos = { x: originalPos.x + dx, y: originalPos.y + dy };
                if (e.shiftKey) {
                    setSelectionEnd(newPos);
                } else {
                    setSelectionStart(newPos);
                    setSelectionEnd(newPos);
                }
            };

            const keyActions: { [key: string]: () => void } = {
                'i': () => {
                    setMode("insert");
                    setSelectionEnd(selectionStart);
                },
                'ArrowLeft': () => moveSelection(-1, 0),
                'h': () => moveSelection(-1, 0),
                'ArrowRight': () => moveSelection(1, 0),
                'l': () => moveSelection(1, 0),
                'ArrowUp': () => moveSelection(0, -1),
                'k': () => moveSelection(0, -1),
                'ArrowDown': () => moveSelection(0, 1),
                'j': () => moveSelection(0, 1),
            };

            const action = keyActions[e.key];
            if (action) action();
        } else if (mode === "insert" && e.key === "Escape") {
            setMode("select");
        }
    }, [mode, selectionStart, setSelectionStart, setSelectionEnd, setMode, selectionEnd]);

    useEffect(() => {
        if (mode === "insert") {
            setSelectionEnd({
                x: selectionStart.x + insertValue.length - 1,
                y: selectionStart.y
            });
        }
    }, [mode, selectionStart, insertValue]);

    useEffect(() => {
        if (mode === "insert") {
            setSelectionEnd({
                x: selectionStart.x + insertValue.length - 1,
                y: selectionStart.y
            });
        }
    }, [mode, selectionStart, insertValue]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    return {
        ref,
        screenOffset,
        selectionStart,
        selectionEnd,
        mode,
        insertValue,
        cellData,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        setInsertValue,
    };
};