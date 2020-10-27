import { SvgHelper } from "../helpers/SvgHelper";
import { RectangularMarkerBase } from "./RectangularMarkerBase";

export class RectMarkerBase extends RectangularMarkerBase {
    public static createMarker = (color?: string): RectMarkerBase => {
        const marker = new RectMarkerBase(color);
        marker.setup();
        return marker;
    }

    protected markerRect: SVGRectElement;

    protected setup() {
        super.setup();
        this.markerRect = SvgHelper.createRect(this.width, this.height);
        this.addToRenderVisual(this.markerRect);
    }

    protected resize(x: number, y: number) {
        super.resize(x, y);
        this.markerRect.setAttribute("width", this.width.toString());
        this.markerRect.setAttribute("height", this.height.toString());
    }
}
