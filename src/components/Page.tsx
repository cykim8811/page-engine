import React from 'react';
import { PageConfig } from "@/config";
import Cell from "./Cell";
import { usePageLogic } from '../hooks/usePageLogic';
import { Selection } from '../components/Selection';
import { InsertionInput } from '../components/InsertionInput';
import { useGridStyle } from '../hooks/useGridStyle';

export interface PageProps {
  config: PageConfig;
}

export const Page: React.FC<PageProps> = ({ config }) => {
  const {
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
  } = usePageLogic(config);

  const gridStyle = useGridStyle(config, screenOffset);

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
      {Object.entries(cellData).map(([key, data]) => (
        <Cell key={key} cellData={data} config={config} screenOffset={screenOffset} />
      ))}

      <Selection
        mode={mode}
        config={config}
        screenOffset={screenOffset}
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
      />

      {mode === "insert" && (
        <InsertionInput
          config={config}
          screenOffset={screenOffset}
          selectionStart={selectionStart}
          selectionEnd={selectionEnd}
          insertValue={insertValue}
          setInsertValue={setInsertValue}
        />
      )}
    </div>
  );
};

export default Page;