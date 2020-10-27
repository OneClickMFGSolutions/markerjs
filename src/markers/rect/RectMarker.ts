import { SvgHelper } from "../../helpers/SvgHelper";
import { MarkerBaseState } from "../MarkerBaseState";
import { RectMarkerBase } from "../RectMarkerBase";

export class RectMarker extends RectMarkerBase {
    public static createMarker = (color?: string): RectMarkerBase => {
        const marker = new RectMarker(color);
        marker.setup();
        return marker;
    }

    constructor(color?: string) {
        super(color);
        this.markerTypeName = 'RectMarker';
    }

    protected setup() {
        super.setup();
        SvgHelper.setAttributes(this.visual, [["class", "rect-marker"]]);
        this.markerRect.style.setProperty("stroke", this.color);
    }

    public restoreState(state: MarkerBaseState) {
        super.restoreState(state);
        this.markerRect.style.setProperty("stroke", this.color);
    }


}
