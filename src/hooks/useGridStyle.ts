// useGridStyle.ts
import { PageConfig } from "@/config";

export const useGridStyle = (config: PageConfig, screenOffset: { x: number; y: number }) => {
    return {
        backgroundImage: `
      linear-gradient(#eee 1px, transparent 1px),
      linear-gradient(90deg, #eee 1px, transparent 1px)
    `,
        backgroundSize: `${config.gridSize.width}px ${config.gridSize.height}px`,
        backgroundPosition: `${screenOffset.x}px ${screenOffset.y}px`,
        transition: "background-position 0.05s",
    };
};