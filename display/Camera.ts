/*********************************************/
/* Teng - Responsible for rendering the game */
/*********************************************/

import { colors, unused } from "svcorelib";

import { TengObject } from "../base/TengObject";
import { Area, ColorType, isColor, objectsEqual, Position, resolveColor, Size } from "../base/Base";
import { Cell, ICellColors } from "../components/Cell";
import { Grid } from "../components/Grid";
import { diff } from "deep-diff";
import { tengSettings } from "../settings";


// TODO: make changeable in game settings menu
// const legacyCursorEnabled = true;

/**
 * Describes how to render a single cell
 */
declare interface ICellRenderInfo
{
    [index: string]: ICellColors | string;

    colors: ICellColors;
    char: string;
}

/**
 * Describes a renderable representation of a grid
 */
declare type RenderableGrid = ICellRenderInfo[][];

/**
 * A camera is responsible for rendering a specified area of a grid
 */
export class Camera extends TengObject
{
    /** The size of the camera's viewport / frustum / whatever tf it's called */
    private viewportSize: Size;
    /** The area of a parent Grid this camera is rendering */
    private area: Area;

    /** The stream to write the rendered data to */
    private outStream: NodeJS.WriteStream;

    /** Buffers a frame until it is rendered, then it's overwritten with a newly calculated frame */
    private renderBuffer: Cell[][];
    /** Is set to true only while a new frame is currently being rendered */
    private isRenderingFrame: boolean;


    /**
     * Creates an instance of the Camera class
     * @param initialArea The initial area the camera starts at
     * @param outStream The stream to write the rendered stuff to - defaults to `process.stdout`
     */
    constructor(initialArea: Area, outStream: NodeJS.WriteStream = process.stdout)
    {
        const viewportSize = Size.fromArea(initialArea);

        super("Camera", `${viewportSize}x${viewportSize.height}`);

        this.area = initialArea;
        this.viewportSize = viewportSize;

        this.renderBuffer = [];
        this.isRenderingFrame = false;

        this.outStream = outStream;
    }

    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        return `Camera with viewport size ${this.viewportSize.toString()} - UID: ${this.uid.toString()}`;
    }

    /**
     * Draws the previously calculated frame and simultaneously starts calculating the next frame
     * @param grid The grid to render to the screen
     */
    draw(grid: Grid): Promise<void>
    {
        return new Promise<void>((res, rej) => {
            const tryDraw = async () => {
                if(this.renderBuffer.length === 0)
                {
                    if(!this.isRenderingFrame)
                    {
                        // this is the first call to draw() since instantiation of the camera, so the frame has to be rendered
                        let renderGrid = await this.renderFrame(grid);

                        await this.drawFrame(renderGrid);

                        return res();
                    }
                    else
                    {
                        // a frame is currently being rendered
                    }
                }
                else
                {
                    // previous frame has been rendered, so it just has to be drawn
                }
            };

            tryDraw();
        });
    }

    /**
     * Takes a renderable grid and actually renders it to the set output stream
     * @param frame The frame to render
     */
    private drawFrame(frame: RenderableGrid): Promise<void>
    {
        return new Promise(async (res, rej) => {
            let first = true;
            let lastColors: ICellColors = frame[0][0].colors;

            const drawRows: string[] = [];

            frame.forEach((row, y) => {
                const drawChars: string[] = [];

                first = true;

                row.forEach((cell, x) => {
                    unused(x, y);

                    const { char, colors } = cell;

                    // only print color control characters to the out stream if the colors have changed, to massively improve performance
                    const diffRes = diff(lastColors, colors);

                    if(first)
                    {
                        // first cell doesn't have a comparand so its color should always be printed
                        first = false;

                        drawChars.push(resolveColor(ColorType.Foreground, colors.fg, colors.fgDim));
                        drawChars.push(resolveColor(ColorType.Background, colors.bg, colors.bgDim));
                    }
                    else if(diffRes != undefined)
                    {
                        // go over each change
                        diffRes.forEach((change, i) => {
                            // get the key of the changes ("fg", "bg", "fgDim", "bgDim")
                            const key: string = change.path?.[0];
                            // get the actual changed value
                            const changedVal = colors[key];

                            // I'm positive this should work? but I didn't test it at all
                            switch(key)
                            {
                                case "fg":
                                    drawChars.push(resolveColor(ColorType.Foreground, isColor(changedVal) ? changedVal : lastColors[key], colors.fgDim));
                                break;
                                case "bg":
                                    drawChars.push(resolveColor(ColorType.Background, isColor(changedVal) ? changedVal : lastColors[key], colors.bgDim));
                                break;
                                default: break;
                            }


                            lastColors = colors;
                        });
                    }

                    drawChars.push(char);
                });

                drawRows.push(`${drawChars.join("")}${colors.rst}`);
            });

            console.clear();
            process.stdout.write(`${drawRows.join("\n")}${colors.rst}`);

            return res();
        });
    }

    /**
     * Renders a frame of a passed grid  
     * TODO: consider position and viewport of camera (only render visible part of grid)
     * @param grid
     */
    private renderFrame(grid: Grid): Promise<RenderableGrid>
    {
        return new Promise<RenderableGrid>(async (res, rej) => {
            this.isRenderingFrame = true;

            const renderedCells: ICellRenderInfo[][] = [];

            const maxChunkIdx = grid.getMaxChunkIdx();
            const chunkSize = grid.getChunkSize();

            // iterate over all chunks
            for(let chy = 0; chy < maxChunkIdx.y; chy++)
            {
                for(let chx = 0; chx < maxChunkIdx.x; chx++)
                {
                    const chunkIndex = new Position(chx, chy);
                    // console.log(`---\nDEBUG/RenderFrame: Chunk @ ${chunkIndex.toString()}\n---`);

                    const chunk = grid.getChunk(chunkIndex);

                    // iterate over chunk's cells
                    chunk.getCells().forEach((row, celly) => {
                        const yOffset = (chunkIndex.y * chunkSize.height + celly);

                        if(renderedCells.length == yOffset)
                            renderedCells.push([]);

                        row.forEach((cell, cellx) => {
                            const xOffset = (chunkIndex.x * chunkSize.width + cellx);

                            const offsetPos = new Position(xOffset, yOffset);

                            // console.log(`DEBUG/RenderFrame: Cell @ ${offsetPos.toString()}`);

                            renderedCells[offsetPos.y][offsetPos.x] = {
                                char: cell.getChar(),
                                colors: cell.getColors()
                            };
                        });
                    });
                }
            }

            this.isRenderingFrame = false;
            return res(renderedCells);
        });
    }

    //#MARKER static

    /**
     * Checks if the passed value is a Camera
     */
    static isCamera(value: any): value is Camera
    {
        value = (value as Camera);

        if(!(value.position instanceof Position))
            return false;

        if(!(value.viewportSize instanceof Size))
            return false;

        if(typeof value.isRenderingFrame !== "boolean")
            return false;

        return true;
    }
}
