import { SvgHelper } from "../../helpers/SvgHelper";
import { LineMarkerBase } from "../LineMarkerBase";
import { LineMarkerBaseState } from "../LineMarkerBaseState";

export class ArrowMarker extends LineMarkerBase {
    public static createMarker = (color?: string): LineMarkerBase => {
        const marker = new ArrowMarker(color);
        marker.setup();
        return marker;
    }

    private tip: SVGPolygonElement

    constructor(color?: string) {
        super(color);
        this.markerTypeName = 'ArrowMarker';
    }

    public restoreState(state: LineMarkerBaseState) {
        super.restoreState(state);
        this.tip.style.setProperty("fill", this.color);
    }

    private readonly ARROW_SIZE = 6;

    protected setup() {
        super.setup();
        SvgHelper.setAttributes(this.visual, [["class", "arrow-marker"]]);

        this.tip = SvgHelper.createPolygon(`0,0 ${this.ARROW_SIZE},${this.ARROW_SIZE / 2} 0,${this.ARROW_SIZE}`,
            [["class", "arrow-marker-tip"]]);
        this.tip.style.setProperty("fill", this.color);

        this.defs.push(SvgHelper.createMarker("arrow-marker-head", "auto",
            this.ARROW_SIZE, this.ARROW_SIZE, this.ARROW_SIZE - 1, this.ARROW_SIZE / 2, this.tip));

        this.markerLine.setAttribute("marker-end", "url(#arrow-marker-head)");
    }

}
