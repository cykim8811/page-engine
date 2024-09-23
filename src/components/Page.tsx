import { PageConfig } from "@/config";
import Cell, { CellData } from "./Cell";
import { useScroll } from "@/hooks/useScroll";
import { useState, useCallback, useEffect } from "react";

export interface PageProps {
  config: PageConfig;
}

export const Page: React.FC<PageProps> = (props) => {
  const { offset: rawScreenOffset, ref } = useScroll();
  const screenOffset = {
    x: Math.round(rawScreenOffset.x / props.config.gridSize.width) * props.config.gridSize.width,
    y: Math.round(rawScreenOffset.y / props.config.gridSize.height) * props.config.gridSize.height,
  };

  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const [mode, setMode] = useState<"select" | "insert">("select");

  const gridStyle = {
    backgroundImage: `
      linear-gradient(#ddd 1px, transparent 1px),
      linear-gradient(90deg, #ddd 1px, transparent 1px)
    `,
    backgroundSize: `${props.config.gridSize.width}px ${props.config.gridSize.height}px`,
    backgroundPosition: `${screenOffset.x}px ${screenOffset.y}px`,
    transition: "background-position 0.05s",
  };

  const cellData: { [key: string]: CellData } = {
    "10928": {
      pos: { x: 1, y: 1 },
      size: { width: 4, height: 4 },
    },
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const x = Math.floor((e.clientX + screenOffset.x) / props.config.gridSize.width);
    const y = Math.floor((e.clientY + screenOffset.y) / props.config.gridSize.height);
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
    setIsDragging(true);
  }, [screenOffset, props.config.gridSize]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const x = Math.floor((e.clientX + screenOffset.x) / props.config.gridSize.width);
    const y = Math.floor((e.clientY + screenOffset.y) / props.config.gridSize.height);
    setSelectionEnd({ x, y });
  }, [isDragging, screenOffset, props.config.gridSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const selectionStyle: () => React.CSSProperties = useCallback(() => {
    const left = Math.min(selectionStart.x, selectionEnd.x);
    const top = Math.min(selectionStart.y, selectionEnd.y);
    const right = Math.max(selectionStart.x, selectionEnd.x);
    const bottom = Math.max(selectionStart.y, selectionEnd.y);

    const posStyle: React.CSSProperties = {
      position: "absolute",
      left: left * props.config.gridSize.width + screenOffset.x - 1,
      top: top * props.config.gridSize.height + screenOffset.y - 1,
      width: (right - left + 1) * props.config.gridSize.width + 3,
      height: (bottom - top + 1) * props.config.gridSize.height + 3,
    };

    const colorStyle: React.CSSProperties = {
      backgroundColor: mode === "select" ? "#bfdbfe80" : "#00000000",
      borderColor: mode === "select" ? "#60a5fa" : "#9ca3af",
      borderWidth: 3,
    };

    return {
      ...posStyle,
      ...colorStyle,
      transition: "background-color 0.05s, border-color 0.05s, left 0.05s, top 0.05s, width 0.05s, height 0.05s",
    };
  }, [selectionStart, selectionEnd, props.config.gridSize, screenOffset, mode]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (mode === "select") {
      if (e.key === "i") {
        setMode("insert");
      } else if (e.key === "ArrowLeft" || e.key === "h") {
        if (e.shiftKey) {
          setSelectionEnd((prev) => ({ x: prev.x - 1, y: prev.y }));
        } else {
          setSelectionStart((prev) => ({ x: prev.x - 1, y: prev.y }));
          setSelectionEnd((prev) => ({ x: prev.x - 1, y: prev.y }));
        }
      } else if (e.key === "ArrowRight" || e.key === "l") {
        if (e.shiftKey) {
          setSelectionEnd((prev) => ({ x: prev.x + 1, y: prev.y }));
        } else {
          setSelectionStart((prev) => ({ x: prev.x + 1, y: prev.y }));
          setSelectionEnd((prev) => ({ x: prev.x + 1, y: prev.y }));
        }
      } else if (e.key === "ArrowUp" || e.key === "k") {
        if (e.shiftKey) {
          setSelectionEnd((prev) => ({ x: prev.x, y: prev.y - 1 }));
        } else {
          setSelectionStart((prev) => ({ x: prev.x, y: prev.y - 1 }));
          setSelectionEnd((prev) => ({ x: prev.x, y: prev.y - 1 }));
        }
      } else if (e.key === "ArrowDown" || e.key === "j") {
        if (e.shiftKey) {
          setSelectionEnd((prev) => ({ x: prev.x, y: prev.y + 1 }));
        } else {
          setSelectionStart((prev) => ({ x: prev.x, y: prev.y + 1 }));
          setSelectionEnd((prev) => ({ x: prev.x, y: prev.y + 1 }));
        }
      }
    } else if (mode === "insert") {
      if (e.key === "Escape") {
        setMode("select");
      }
    }
  }, [mode]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div
      className="w-full h-full bg-white cursor-cell"
      style={gridStyle}
      ref={ref}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {Object.keys(cellData).map((key) => (
        <Cell key={key} cellData={cellData[key]} config={props.config} screenOffset={screenOffset} />
      ))}
      <div style={selectionStyle()} />
    </div>
  );
};

export default Page;