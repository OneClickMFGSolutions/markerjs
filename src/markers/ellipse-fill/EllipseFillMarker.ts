import { SvgHelper } from "../../helpers/SvgHelper";
import { MarkerBaseState } from "../MarkerBaseState";
import { RectangularMarkerBase } from "../RectangularMarkerBase";

export class EllipseFillMarker extends RectangularMarkerBase {
    public static createMarker = (color?: string): RectangularMarkerBase => {
        const marker = new EllipseFillMarker(color);
        marker.setup();
        return marker;
    }

    constructor(color?: string) {
        super(color);
        this.markerTypeName = 'EllipseFillMarker';
    }

    private markerEllipse: SVGEllipseElement;

    protected setup() {
        this.height = this.width; // circle by default
        super.setup();

        this.markerEllipse = SvgHelper.createEllipse(this.width, this.height);
        this.addToRenderVisual(this.markerEllipse);

        this.markerEllipse.style.setProperty("stroke", "");
        this.markerEllipse.style.setProperty("fill", this.color);

        SvgHelper.setAttributes(this.visual, [["class", "ellipse-marker"]]);
    }

    protected resize(x: number, y: number) {
        super.resize(x, y);
        this.markerEllipse.setAttribute("cx", (this.width / 2).toString());
        this.markerEllipse.setAttribute("cy", (this.height / 2).toString());
        this.markerEllipse.setAttribute("rx", (this.width / 2).toString());
        this.markerEllipse.setAttribute("ry", (this.height / 2).toString());
    }

    public restoreState(state: MarkerBaseState) {
        super.restoreState(state);
        this.markerEllipse.style.setProperty("fill", this.color);
    }

}
