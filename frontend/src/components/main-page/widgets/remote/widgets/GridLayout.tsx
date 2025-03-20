import { Component } from "react";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
} from "../BaseTypes";

export class GridLayoutData {
    row: number;
    col: number;
    span_row: number;
    span_col: number;

    constructor(row: number, col: number, span_row: number, span_col: number) {
        this.row = row;
        this.col = col;
        this.span_row = span_row;
        this.span_col = span_col;
    }
}

export default class GridLayout extends Component<GridLayoutProps, {}> {
    numRows: number;
    numCols: number;
    colsPerRow: number[];
    layoutData: GridLayoutData[][];
    // Store the index of the child corresponding to the layoutData at the position
    childIndexes: number[][];

    constructor(props: GridLayoutProps) {
        super(props);

        // Count total number of rows and columns
        let numRows = 0,
            numCols = 0;
        this.colsPerRow = [];
        for (let child of props.children_layout_info) {
            if (child.row > numRows) numRows = child.row;
            if (child.col > numCols) numCols = child.col;

            for (let row = child.row; row < child.row + child.span_row; row++) {
                while (this.colsPerRow.length <= row) this.colsPerRow.push(0);
                this.colsPerRow[row] -= child.span_col - 1;
            }
        }
        this.numRows = numRows + 1;
        this.numCols = numCols + 1;
        this.colsPerRow = this.colsPerRow.map((el) =>
            Math.max(1, el + this.numCols)
        );
        // Collect layoutdata from array to 2d matrix for easier access
        this.layoutData = [];
        this.childIndexes = [];
        for (let row = 0; row < this.numRows; row++) {
            this.layoutData[row] = [];
            this.childIndexes[row] = [];
        }
        for (let i = 0; i < props.children_layout_info.length; i++) {
            let child = props.children_layout_info[i];
            this.layoutData[child.row][child.col] = child;
            this.childIndexes[child.row][child.col] = i;
        }
    }

    render() {
        let rows: JSX.Element[] = [];
        for (let row = 0; row < this.numRows; row++) {
            let tds: JSX.Element[] = [];
            for (let col = 0; col < this.colsPerRow[row]; col++) {
                let childLayout = this.layoutData[row][col];
                if (childLayout) {
                    let child =
                        this.props.children[this.childIndexes[row][col]];
                    tds.push(
                        <td
                            key={col}
                            colSpan={childLayout.span_col}
                            rowSpan={childLayout.span_row}
                        >
                            {this.props.propsToComponent(child)}
                        </td>
                    );
                } else {
                    tds.push(<td key={col}>{/* Grid may be sparse */}</td>);
                }
            }
            rows.push(<tr key={row}>{tds}</tr>);
        }
        return (
            <table>
                <tbody>{rows}</tbody>
            </table>
        );
    }
}

export class GridLayoutProps extends WidgetProps {
    children_layout_info: GridLayoutData[];
    constructor(
        name: string,
        value: ValueVariant,
        state: WidgetState,
        children: WidgetProps[],
        propsToComponent: ComponentSupplier,
        updateNotificationAccepter: UpdateNotificationAccepter,
        children_layout_info: GridLayoutData[]
    ) {
        super(
            name,
            value,
            state,
            children,
            propsToComponent,
            updateNotificationAccepter
        );
        this.children_layout_info = children_layout_info;
    }
}
