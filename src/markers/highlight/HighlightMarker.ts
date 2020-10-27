import { SvgHelper } from "../../helpers/SvgHelper";
import { MarkerBaseState } from "../MarkerBaseState";
import { RectMarkerBase } from "../RectMarkerBase";

export class HighlightMarker extends RectMarkerBase {
    public static createMarker = (color?: string): RectMarkerBase => {
        const marker = new HighlightMarker(color);
        marker.setup();
        return marker;
    }

    constructor(color?: string) {
        super(color);
        this.markerTypeName = 'HighlightMarker';
    }

    protected setup() {
        super.setup();
        SvgHelper.setAttributes(this.visual, [["class", "highlight-marker"]]);
        this.markerRect.style.setProperty("fill", this.color)
    }

    public restoreState(state: MarkerBaseState) {
        super.restoreState(state);
        this.markerRect.style.setProperty("fill", this.color);
    }


}
