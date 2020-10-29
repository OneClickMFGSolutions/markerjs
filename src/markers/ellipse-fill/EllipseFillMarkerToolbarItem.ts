import { ToolbarItem } from "../../toolbar/ToolbarItem";
import { EllipseFillMarker } from "./EllipseFillMarker";

import Icon from "./ellipse-marker-toolbar-icon.svg";

export class EllipseFillMarkerToolbarItem implements ToolbarItem {
    public name = "ellipse-fill-marker";
    public tooltipText = "Ellipse Filled";

    public icon = Icon;
    public markerType = EllipseFillMarker;
}
