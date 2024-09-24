import { PageConfig } from "@/config";

export interface CellData {
  pos: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  value: string;
  children?: string[];
}

export interface CellProps {
  cellData: CellData;
  config: PageConfig;
  screenOffset: { x: number; y: number };
  showTip?: boolean;
  name: string;
}

const Cell: React.FC<CellProps> = (props) => {
  const cellStyle: React.CSSProperties = {
    position: "absolute",
    left: `${
      props.cellData.pos.x * props.config.gridSize.width + props.screenOffset.x
    }px`,
    top: `${
      props.cellData.pos.y * props.config.gridSize.height + props.screenOffset.y
    }px`,
    width: `${props.cellData.size.width * props.config.gridSize.width + 1}px`,
    height: `${
      props.cellData.size.height * props.config.gridSize.height + 1
    }px`,
    transition: "left 0.05s, top 0.05s",
    fontSize: props.config.gridSize.height * 0.7,
    paddingLeft: 2,
  };
  return (
    <div
      className="bg-white border border-gray-400 select-none"
      style={cellStyle}
    >
      <div
        className={`absolute ${
          props.showTip ? "-top-4 h-4" : "top-0 h-0"
        } left-0 bg-white/50 text-xs text-gray-500 overflow-hidden whitespace-nowrap transition-all pointer-events-none`}
      >
        {props.name}
      </div>
      {props.cellData.value}
    </div>
  );
};

export default Cell;
