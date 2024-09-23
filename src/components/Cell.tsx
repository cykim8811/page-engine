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
};

export interface CellProps {
    cellData: CellData;
    config: PageConfig;
    screenOffset: { x: number, y: number };
};


const Cell: React.FC<CellProps> = (props) => {
    const cellStyle: React.CSSProperties = {
        position: "absolute",
        left: `${props.cellData.pos.x * props.config.gridSize.width + props.screenOffset.x}px`,
        top: `${props.cellData.pos.y * props.config.gridSize.height + props.screenOffset.y}px`,
        width: `${props.cellData.size.width * props.config.gridSize.width + 1}px`,
        height: `${props.cellData.size.height * props.config.gridSize.height + 1}px`,
        transition: "left 0.05s, top 0.05s",
        fontSize: props.config.gridSize.height * 0.7,
        paddingLeft: 2,
    };
    return (
        <div className="bg-white border border-gray-500 select-none" style={cellStyle}>
            {props.cellData.value}
        </div>
    );
}

export default Cell;
