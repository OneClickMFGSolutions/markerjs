import { SvgHelper } from "../../helpers/SvgHelper";
import { MarkerBaseState } from "../MarkerBaseState";
import { RectMarkerBase } from "../RectMarkerBase";

export class CoverMarker extends RectMarkerBase {
    public static createMarker = (color?: string): RectMarkerBase => {
        const marker = new CoverMarker(color);
        marker.setup();
        return marker;
    }

    constructor(color?: string) {
        super(color);
        this.markerTypeName = 'CoverMarker';
    }

    protected setup() {
        super.setup();
        SvgHelper.setAttributes(this.visual, [["class", "cover-marker"]]);
        this.markerRect.style.setProperty("fill", this.color);
    }

    public restoreState(state: MarkerBaseState) {
        super.restoreState(state);
        this.markerRect.style.setProperty("fill", this.color);
    }


}
