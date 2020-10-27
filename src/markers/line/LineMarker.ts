import { SvgHelper } from "../../helpers/SvgHelper";
import { LineMarkerBase } from "../LineMarkerBase";

export class LineMarker extends LineMarkerBase {
    public static createMarker = (color?: string): LineMarkerBase => {
        const marker = new LineMarker(color);
        marker.setup();
        return marker;
    }

    constructor(color?: string) {
        super(color);
        this.markerTypeName = 'LineMarker';
    }

    protected setup() {
        super.setup();
        SvgHelper.setAttributes(this.visual, [["class", "line-marker"]]);
    }

}
