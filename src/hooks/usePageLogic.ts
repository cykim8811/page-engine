import { useState, useCallback, useEffect, useRef } from "react";
import { useScroll } from "@/hooks/useScroll";
import { PageConfig } from "@/config";
import { CellData } from "../components/Cell";

function getTextWidth(text: string, element: HTMLElement | null): number {
    // canvas 요소 생성
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
        console.error('Canvas 2D context를 생성할 수 없습니다.');
        return 0;
    }

    const style = window.getComputedStyle(element || document.body);
    context.font = style.font;

    const metrics = context.measureText(text);
    return metrics.width;
}

const name_db = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit', 'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];
function createNewCellKeyName(excludeKeys: string[] = []): string {
    let postfix = 0;
    while (true) {
        for (const name of name_db) {
            const key = name + (postfix === 0 ? '' : postfix);
            if (!excludeKeys.includes(key)) {
                return key;
            }
        }
    }
}

export const usePageLogic = (config: PageConfig) => {
    const { offset: rawScreenOffset, ref } = useScroll();
    const insertRef = useRef<HTMLInputElement>(null);
    const screenOffset = {
        x: Math.round(rawScreenOffset.x / config.gridSize.width) * config.gridSize.width,
        y: Math.round(rawScreenOffset.y / config.gridSize.height) * config.gridSize.height,
    };

    const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [selectionStart, setSelectionStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isSelectingDragging, setIsSelectingDragging] = useState(false);
    const [isMovingDragging, setIsMovingDragging] = useState(false);
    const [movingDraggingTarget, setMovingDraggingTarget] = useState<string>("");
    const [movingDraggingOffset, setMovingDraggingOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [mode, setMode] = useState<"select" | "insert">("select");
    const [insertValue, setInsertValue] = useState<string>("");
    const [lastClickTime, setLastClickTime] = useState<number>(0);

    const [hoveringCell, setHoveringCell] = useState<string | null>(null);
    const [cursorHoveringCell, setCursorHoveringCell] = useState<string | null>(null);

    const [cellData, setCellData] = useState<{ [key: string]: CellData }>({
        "10928": {
            pos: { x: 8, y: 5 },
            size: { width: 5, height: 3 },
            value: "Hello, World!",
            children: ["10929"],
        },
        "10929": {
            pos: { x: 9, y: 6 },
            size: { width: 3, height: 1 },
            value: "Hello!",
        },
    });

    function getCellAt(x: number, y: number): string | undefined {
        // Find the smallest cell that contains the point (x, y)
        let cellKey = "";
        let smallestCellSize = Infinity;
        for (const key in cellData) {
            const cell = cellData[key];
            if (x >= cell.pos.x && x < cell.pos.x + cell.size.width && y >= cell.pos.y && y < cell.pos.y + cell.size.height) {
                const cellSize = cell.size.width * cell.size.height;
                if (cellSize < smallestCellSize) {
                    cellKey = key;
                    smallestCellSize = cellSize;
                }
            }
        }
        return cellKey;
    }

    function getLargestCellAt(x: number, y: number): string | undefined {
        // Find the largest cell that contains the point (x, y)
        let cellKey = "";
        let largestCellSize = 0;
        for (const key in cellData) {
            const cell = cellData[key];
            if (x >= cell.pos.x && x < cell.pos.x + cell.size.width && y >= cell.pos.y && y < cell.pos.y + cell.size.height) {
                const cellSize = cell.size.width * cell.size.height;
                if (cellSize > largestCellSize) {
                    cellKey = key;
                    largestCellSize = cellSize;
                }
            }
        }
        return cellKey;
    }


    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const x = Math.floor((e.clientX - screenOffset.x) / config.gridSize.width);
        const y = Math.floor((e.clientY - screenOffset.y) / config.gridSize.height);
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastClickTime;

        const cellKey = getCellAt(x, y);

        if (timeDiff < 300 && x === cursorPos.x && y === cursorPos.y && !cellKey) {
            setCursorPos({ x, y });
            setSelectionStart({ x, y });
            setSelectionEnd({ x, y });
            setInsertValue("");
            setMode("insert");
        } else if (mode === "insert" && x >= selectionStart.x && x <= selectionEnd.x && y >= selectionStart.y && y <= selectionEnd.y) {
            return;
        } else if (mode === "insert") {
            if (insertValue !== "") {
                const newCellKey = createNewCellKeyName(Object.keys(cellData));
                setCellData({
                    ...cellData,
                    [newCellKey]: {
                        pos: selectionStart,
                        size: {
                            width: selectionEnd.x - selectionStart.x + 1,
                            height: selectionEnd.y - selectionStart.y + 1,
                        },
                        value: insertValue,
                    },
                });
            }
            setCursorPos({ x, y });
            setSelectionStart({ x, y });
            setSelectionEnd({ x, y });
            setInsertValue("");
            setMode("select");
        } else {
            if (cellKey) {
                const cell = cellData[cellKey];
                setMode("select");
                setCursorPos({ x, y });
                setSelectionStart(cell.pos);
                setSelectionEnd({ x: cell.pos.x + cell.size.width - 1, y: cell.pos.y + cell.size.height - 1 });
                setIsMovingDragging(true);
                const moveTarget = getLargestCellAt(x, y) || cellKey;
                setMovingDraggingTarget(moveTarget);
                setMovingDraggingOffset({ x: x - cellData[moveTarget].pos.x, y: y - cellData[moveTarget].pos.y });
            } else {
                setMode("select");
                setCursorPos({ x, y });
                setSelectionStart({ x, y });
                setSelectionEnd({ x, y });
                setIsSelectingDragging(true);
            }
        }

        setLastClickTime(currentTime);
    }, [screenOffset, config.gridSize, lastClickTime, selectionStart, mode, selectionEnd]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const x = Math.floor((e.clientX - screenOffset.x) / config.gridSize.width);
        const y = Math.floor((e.clientY - screenOffset.y) / config.gridSize.height);

        const hoveringCellKey = getLargestCellAt(x, y);
        if (hoveringCellKey !== hoveringCell) {
            setHoveringCell(hoveringCellKey || null);
        }

        if (isSelectingDragging) {
            setCursorPos({ x, y });
            setSelectionEnd({ x, y });
        } else if (isMovingDragging) {
            if (movingDraggingTarget) {
                const cell = cellData[movingDraggingTarget];
                const newCellData = { ...cellData };
                newCellData[movingDraggingTarget] = {
                    ...cell,
                    pos: { x: x - movingDraggingOffset.x, y: y - movingDraggingOffset.y },
                };
                for (const childKey of cell.children || []) {
                    const child = cellData[childKey];
                    newCellData[childKey] = {
                        ...child,
                        pos: {
                            x: child.pos.x + x - cell.pos.x - movingDraggingOffset.x,
                            y: child.pos.y + y - cell.pos.y - movingDraggingOffset.y,
                        },
                    };
                }
                setCellData(newCellData);
                setCursorPos({ x, y });
                setSelectionStart({ x: x - movingDraggingOffset.x, y: y - movingDraggingOffset.y });
                setSelectionEnd({ x: x - movingDraggingOffset.x + cell.size.width - 1, y: y - movingDraggingOffset.y + cell.size.height - 1 });
            }
        }
    }, [isSelectingDragging, screenOffset, config.gridSize, cellData, movingDraggingOffset]);

    useEffect(() => {
        const x = cursorPos.x;
        const y = cursorPos.y;
        const cursorHoveringCellKey = getLargestCellAt(x, y);
        if (cursorHoveringCellKey !== cursorHoveringCell) {
            setCursorHoveringCell(cursorHoveringCellKey || null);
        }
    }, [cursorPos, cellData]);

    const handleMouseUp = useCallback(() => {
        setIsSelectingDragging(false);
        setIsMovingDragging(false);
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (mode === "select") {
            const moveSelection = (dx: number, dy: number) => {
                const sourceCellKey = getLargestCellAt(cursorPos.x, cursorPos.y);
                const destCellKey = getCellAt(cursorPos.x + dx, cursorPos.y + dy);
                const originalPos = e.shiftKey ? selectionEnd : cursorPos;
                const newPos = { x: originalPos.x + dx, y: originalPos.y + dy };
                if (e.shiftKey) {
                    setCursorPos(newPos);
                    setSelectionEnd(newPos);
                } else if (e.ctrlKey && sourceCellKey && !e.shiftKey) {
                    // move cell
                    const cell = cellData[sourceCellKey];
                    const newCellData = { ...cellData };
                    newCellData[sourceCellKey] = {
                        ...cell,
                        pos: {
                            x: cell.pos.x + dx,
                            y: cell.pos.y + dy,
                        }
                    };
                    for (const childKey of cell.children || []) {
                        const child = cellData[childKey];
                        newCellData[childKey] = {
                            ...child,
                            pos: {
                                x: child.pos.x + dx,
                                y: child.pos.y + dy,
                            }
                        };
                    }
                    setCellData(newCellData);
                    setCursorPos(newPos);
                    setSelectionStart((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
                    setSelectionEnd((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
                } else {
                    if (destCellKey) {
                        if (!e.ctrlKey) {
                            setCursorPos(newPos);
                            const cell = cellData[destCellKey];
                            setSelectionStart(cell.pos);
                            setSelectionEnd({ x: cell.pos.x + cell.size.width - 1, y: cell.pos.y + cell.size.height - 1 });
                        }
                    } else {
                        setCursorPos(newPos);
                        setSelectionStart(newPos);
                        setSelectionEnd(newPos);
                    }
                }
            };

            const deleteSelection = () => {
                const newCellData = { ...cellData };
                const left = Math.min(selectionStart.x, selectionEnd.x);
                const right = Math.max(selectionStart.x, selectionEnd.x);
                const top = Math.min(selectionStart.y, selectionEnd.y);
                const bottom = Math.max(selectionStart.y, selectionEnd.y);

                for (const key in cellData) {
                    const cell = cellData[key];
                    if (cell.pos.x >= left && cell.pos.x + cell.size.width - 1 <= right && cell.pos.y >= top && cell.pos.y + cell.size.height - 1 <= bottom) {
                        delete newCellData[key];
                    }
                }

                setCellData(newCellData);
            }

            const keyActions: { [key: string]: () => void } = {
                'i': () => {
                    setMode("insert");
                    setSelectionEnd(selectionStart);
                },
                'arrowleft': () => moveSelection(-1, 0),
                'h': () => moveSelection(-1, 0),
                'arrowright': () => moveSelection(1, 0),
                'l': () => moveSelection(1, 0),
                'arrowup': () => moveSelection(0, -1),
                'k': () => moveSelection(0, -1),
                'arrowdown': () => moveSelection(0, 1),
                'j': () => moveSelection(0, 1),
                'backspace': deleteSelection,
                'delete': deleteSelection,
            };

            const action = keyActions[e.key.toLowerCase()];
            if (action) action();
        } else if (mode === "insert") {
            if (e.key === "Escape") {
                setMode("select");
            } else if (e.key === "Enter") {
                if (insertValue !== "") {
                    const newCellKey = createNewCellKeyName(Object.keys(cellData));
                    setCellData({
                        ...cellData,
                        [newCellKey]: {
                            pos: selectionStart,
                            size: {
                                width: selectionEnd.x - selectionStart.x + 1,
                                height: selectionEnd.y - selectionStart.y + 1,
                            },
                            value: insertValue,
                        },
                    });
                }
                setCursorPos({ x: selectionStart.x, y: selectionStart.y });
                setSelectionStart({ x: selectionStart.x, y: selectionStart.y });
                setInsertValue("");
                setMode("select");
            }
        }
    }, [mode, selectionStart, setSelectionStart, setSelectionEnd, setMode, selectionEnd]);

    useEffect(() => {
        if (mode === "insert") {
            setSelectionEnd({
                x: selectionStart.x + Math.max(0, Math.floor((getTextWidth(insertValue, insertRef.current) + 4) / config.gridSize.width)),
                y: selectionStart.y,
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
        insertRef,
        screenOffset,
        hoveringCell,
        cursorHoveringCell,
        selectionStart,
        selectionEnd,
        cursorPos,
        mode,
        insertValue,
        cellData,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        setInsertValue,
    };
};