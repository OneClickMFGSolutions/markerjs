import { SvgHelper } from "./helpers/SvgHelper";
import { Renderer } from "./Renderer";
import { Toolbar } from "./toolbar/Toolbar";
import { ToolbarItem } from "./toolbar/ToolbarItem";

import { MarkerBase } from "./markers/MarkerBase";

import { ArrowMarkerToolbarItem } from "./markers/arrow/ArrowMarkerToolbarItem";
import { CoverMarkerToolbarItem } from "./markers/cover/CoverMarkerToolbarItem";
import { LineMarkerToolbarItem } from "./markers/line/LineMarkerToolbarItem";
import { RectMarkerToolbarItem } from "./markers/rect/RectMarkerToolbarItem";
import { TextMarkerToolbarItem } from "./markers/text/TextMarkerToolbarItem";

import OkIcon from "./assets/core-toolbar-icons/check.svg";
import DeleteIcon from "./assets/core-toolbar-icons/eraser.svg";
import PointerIcon from "./assets/core-toolbar-icons/mouse-pointer.svg";

import Config, { MarkerColors } from './Config';
import { EllipseMarkerToolbarItem } from './markers/ellipse/EllipseMarkerToolbarItem';
import { EllipseFillMarkerToolbarItem } from './markers/ellipse-fill/EllipseFillMarkerToolbarItem';
import { MarkerAreaState } from './MarkerAreaState';
import { MarkerBaseState } from './markers/MarkerBaseState';
import { RectMarker } from './markers/rect/RectMarker';
import { EllipseMarker } from './markers/ellipse/EllipseMarker';
import { CoverMarker } from './markers/cover/CoverMarker';
import { HighlightMarker } from './markers/highlight/HighlightMarker';
import { TextMarker } from './markers/text/TextMarker';
import { LineMarker } from './markers/line/LineMarker';
import { ArrowMarker } from './markers/arrow/ArrowMarker';
import { EllipseFillMarker } from "./markers/ellipse-fill/EllipseFillMarker";
import { TextMarkerState } from "./markers/text/TextMarkerState";

export class MarkerArea {
  private target: HTMLImageElement;

  private targetRoot: HTMLElement;
  private renderAtNaturalSize: boolean;
  private markerColors: MarkerColors;
  private strokeWidth: number;
  private renderImageType?: string;
  private renderImageQuality?: number;
  private renderMarkersOnly?: boolean;

  private previousState?: MarkerAreaState;

  private markerImage: SVGSVGElement;
  private markerImageHolder: HTMLDivElement;
  private defs: SVGDefsElement;

  private targetRect: ClientRect;
  private width: number;
  private height: number;

  private markers: MarkerBase[];
  private activeMarker: MarkerBase;

  private toolbar: Toolbar;
  private toolbarUI: HTMLElement;

  private logoUI: HTMLElement;

  private completeCallback: (dataUrl: string, state?: MarkerAreaState) => void;
  private cancelCallback: () => void;

  private cancelTextShadowCallback: (ev: MouseEvent) => void = () => { }

  private color = "#000000"
  private get toolbars(): ToolbarItem[] {
    const toolbars = [
      {
        icon: PointerIcon,
        name: "pointer",
        tooltipText: "Pointer",
      },
      {
        icon: DeleteIcon,
        name: "delete",
        tooltipText: "Delete",
      },
      {
        name: "separator",
        tooltipText: "",
      },
      new EllipseMarkerToolbarItem(),
      new EllipseFillMarkerToolbarItem(),
      new RectMarkerToolbarItem(),
      new CoverMarkerToolbarItem(),
      // new HighlightMarkerToolbarItem(),
      new LineMarkerToolbarItem(),
      new ArrowMarkerToolbarItem(),
      new TextMarkerToolbarItem(),
      {
        name: "separator",
        tooltipText: "",
      },
      {
        icon: OkIcon,
        name: "ok",
        tooltipText: "OK",
      },
      // {
      //   icon: CloseIcon,
      //   name: "close",
      //   tooltipText: "Close",
      // },
    ];

    toolbars.unshift(
      {
        name: "separator",
        tooltipText: "",
      }
    )

    if (this.activeMarker && this.activeMarker.markerTypeName == "TextMarker") {
      toolbars.unshift({
        icon: `<text x="3px" y="10px" style="text-shadow: 0 5px 5px black; fill:black;">A</text>`,
        name: "shadow",
        tooltipText: "Text Shadow"
      })
    }

    toolbars.unshift(
      {
        icon: `<svg width="15" height="15" >
          <rect width="15" height="15" style="fill:${this.color};" />
        </svg>`,
        name: "color",
        tooltipText: "Color"
      },
    )

    return toolbars;
  }

  private scale = 1.0;

  constructor(target: HTMLImageElement, config?: Config) {
    this.target = target;
    this.targetRoot = config && config.targetRoot ? config.targetRoot : document.body;
    this.renderAtNaturalSize = config && config.renderAtNaturalSize !== undefined ? config.renderAtNaturalSize : false;
    this.markerColors = {
      mainColor: config && config.markerColors && config.markerColors.mainColor ? config.markerColors.mainColor : '#ff0000',
      highlightColor: config && config.markerColors && config.markerColors.highlightColor ? config.markerColors.highlightColor : '#ffff00',
      coverColor: config && config.markerColors && config.markerColors.coverColor ? config.markerColors.coverColor : '#000000'
    };
    this.strokeWidth = config && config.strokeWidth ? config.strokeWidth : 3;
    if (config && config.renderImageType) {
      this.renderImageType = config.renderImageType;
    }
    if (config && config.renderImageQuality) {
      this.renderImageQuality = config.renderImageQuality;
    }
    if (config && config.renderMarkersOnly) {
      this.renderMarkersOnly = config.renderMarkersOnly;
    }
    if (config && config.previousState) {
      this.previousState = config.previousState;
    }
    this.width = target.clientWidth;
    this.height = target.clientHeight;

    this.markers = [];
    this.activeMarker = null;
  }

  public show = (completeCallback: (dataUrl: string, state?: MarkerAreaState) => void, cancelCallback?: () => void) => {
    this.completeCallback = completeCallback;
    this.cancelCallback = cancelCallback;

    this.open();

    this.showUI();
  }

  public open = () => {
    this.setTargetRect();
    this.initMarkerCanvas();
    this.attachEvents();
    this.setStyles();
    if (this.previousState) {
      this.restoreState();
    }

    window.addEventListener("resize", this.adjustUI);
  }

  private restoreState = () => {
    if (this.previousState) {
      this.previousState.markers.forEach(markerState => {
        switch (markerState.markerType) {
          case 'RectMarker': {
            this.addMarker(RectMarker, markerState);
            break;
          }
          case 'EllipseMarker': {
            this.addMarker(EllipseMarker, markerState);
            break;
          }
          case 'EllipseFillMarker': {
            this.addMarker(EllipseFillMarker, markerState);
            break;
          }
          case 'CoverMarker': {
            this.addMarker(CoverMarker, markerState);
            break;
          }
          case 'HighlightMarker': {
            this.addMarker(HighlightMarker, markerState);
            break;
          }
          case 'TextMarker': {
            this.addMarker(TextMarker, markerState);
            break;
          }
          case 'LineMarker': {
            this.addMarker(LineMarker, markerState);
            break;
          }
          case 'ArrowMarker': {
            this.addMarker(ArrowMarker, markerState);
            break;
          }
          default: {
            console.log(`missing marker type state handler: ${markerState.markerType}`);
          }
        }
      })
    }
  }

  public render = (completeCallback: (dataUrl: string, state?: MarkerAreaState) => void, cancelCallback?: () => void) => {
    this.completeCallback = completeCallback;
    this.cancelCallback = cancelCallback;

    this.selectMarker(null);
    this.startRender(this.renderFinished);
  }

  public close = () => {
    if (this.toolbarUI) {
      this.targetRoot.removeChild(this.toolbarUI);
    }
    if (this.markerImage) {
      this.targetRoot.removeChild(this.markerImageHolder);
    }
    if (this.logoUI) {
      this.targetRoot.removeChild(this.logoUI);
    }
  }

  public addMarker = (
    markerType: typeof MarkerBase,
    previousState?: MarkerBaseState
  ) => {
    const marker = markerType.createMarker(this.color);
    marker.onSelected = this.selectMarker;

    if (marker.defs && marker.defs.length > 0) {
      for (const d of marker.defs) {
        if (d.id && !this.markerImage.getElementById(d.id)) {
          this.defs.appendChild(d);
        }
      }
    }

    this.markers.push(marker);
    this.selectMarker(marker);

    this.markerImage.appendChild(marker.visual);

    const bbox = marker.visual.getBBox();
    const x = this.width / 2 / this.scale - bbox.width / 2;
    const y = this.height / 2 / this.scale - bbox.height / 2;

    const translate = marker.visual.transform.baseVal.getItem(0);
    translate.setMatrix(translate.matrix.translate(x, y));
    marker.visual.transform.baseVal.replaceItem(translate, 0);

    if (previousState) {
      marker.restoreState(previousState);
    }
  }

  public deleteActiveMarker = () => {
    if (this.activeMarker) {
      this.deleteMarker(this.activeMarker);
    }
  }

  public setActiveMarkerColor = (event: MouseEvent) => {
    const input = document.createElement("input");
    input.type = "color";
    input.value = this.color;

    input.style.position = "fixed";
    input.style.top = event.clientY + "px";
    input.style.left = event.clientX + "px";
    input.style.opacity = "0";

    document.body.appendChild(input);
    setTimeout(() => input.click(), 50)

    input.oninput = (e) => {
      const newColor = input.value;

      if (this.activeMarker) {
        const state = this.activeMarker.getState();
        state.color = newColor;
        this.activeMarker.restoreState(state);
      }

      this.color = newColor;
      this.showUI();
    }

    input.onblur = (e) => {
      document.body.removeChild(input);
      input.oninput = null;
      input.onblur = null;
    }
  }

  public setTextShadow = (event: MouseEvent) => {
    const m = this.activeMarker;
    if (!m || m.markerTypeName != "TextMarker") return;

    const dialog = document.createElement("div");
    dialog.classList.add("md-card");
    dialog.classList.add("mdt-bg");

    dialog.style.position = "fixed";
    dialog.style.top = event.clientY + "px";
    dialog.style.left = event.clientX + "px";

    const input = document.createElement("input")
    input.classList.add("md-input")
    input.classList.add("md-input-filled")
    input.style.marginBottom = "1em"
    input.style.flex = "1"
    input.type = "number";

    const offsetX = input.cloneNode() as HTMLInputElement
    const offsetY = input.cloneNode() as HTMLInputElement
    const blurRad = input.cloneNode() as HTMLInputElement

    const color = document.createElement("input")
    color.type = "color";
    color.style.flex = "1"

    const field = document.createElement("span")
    field.style.display = "flex"
    field.style.alignItems = "center"
    field.style.justifyContent = "space-between"

    const label = document.createElement("div")
    label.style.marginRight = "1em"
    label.style.width = "20ch"
    // label.style.fontSize = "1.25em"

    const XField = field.cloneNode()
    const XLabel = label.cloneNode() as HTMLDivElement;
    XLabel.innerText = "Shadow's X Position";
    XField.appendChild(XLabel)
    XField.appendChild(offsetX)

    const YField = field.cloneNode()
    const YLabel = label.cloneNode() as HTMLDivElement;
    YLabel.innerText = "Shadow's Y Position";
    YField.appendChild(YLabel)
    YField.appendChild(offsetY)

    const BField = field.cloneNode()
    const BLabel = label.cloneNode() as HTMLDivElement;
    BLabel.innerText = "Shadow's Blur Radius";
    BField.appendChild(BLabel)
    BField.appendChild(blurRad)

    const CField = field.cloneNode()
    const CLabel = label.cloneNode() as HTMLDivElement;
    CLabel.innerText = "Shadow's Color";
    CField.appendChild(CLabel)
    CField.appendChild(color)

    dialog.appendChild(XField)
    dialog.appendChild(YField)
    dialog.appendChild(BField)
    dialog.appendChild(CField)

    document.body.appendChild(dialog);

    this.cancelTextShadowCallback = (e: MouseEvent) => {
      if (e.target == event.target) return;

      if (!dialog.contains(e.target as Node)) {
        document.body.removeChild(dialog)
        window.removeEventListener("click", this.cancelTextShadowCallback)
      }
    }

    window.addEventListener("click", this.cancelTextShadowCallback)

    const inputHandler = () => {
      const state = m.getState() as TextMarkerState;
      state.shadowX = Number(offsetX.value || 0);
      state.shadowY = Number(offsetY.value || 0);
      state.shadowBlur = Number(blurRad.value || 0);
      state.shadowColor = color.value || "#000000";
      console.log("Got some input", state, m)
      m.restoreState(state);
    }

    const state = m.getState() as TextMarkerState;
    if (state.shadowX) offsetX.value = String(state.shadowX)
    if (state.shadowY) offsetY.value = String(state.shadowY)
    if (state.shadowBlur) blurRad.value = String(state.shadowBlur)
    if (state.color) color.value = String(state.color)

    offsetX.addEventListener("input", inputHandler)
    offsetY.addEventListener("input", inputHandler)
    blurRad.addEventListener("input", inputHandler)
    color.addEventListener("input", inputHandler)

    // setTimeout(() => input.click(), 50)

    // input.oninput = (e) => {
    //   const newColor = input.value;

    //   if (this.activeMarker) {
    //     const state = this.activeMarker.getState();
    //     state.color = newColor;
    //     this.activeMarker.restoreState(state);
    //   }

    //   this.color = newColor;
    //   this.showUI();
    // }

    // input.onblur = (e) => {
    //   document.body.removeChild(input);
    //   input.oninput = null;
    //   input.onblur = null;
    // }
  }

  public getState = (): MarkerAreaState => {
    let config = new MarkerAreaState(this.markers);
    return config;
  }

  private setTargetRect = () => {
    const targetRect = this.target.getBoundingClientRect() as DOMRect;
    const bodyRect = this.targetRoot.parentElement.getBoundingClientRect();
    this.targetRect = {
      left: (targetRect.left - bodyRect.left),
      top: (targetRect.top - bodyRect.top)
    } as ClientRect;

  }

  private startRender = (done: (dataUrl: string) => void) => {
    const renderer = new Renderer();
    renderer.rasterize(this.target, this.markerImage, done,
      this.renderAtNaturalSize, this.renderImageType, this.renderImageQuality, this.renderMarkersOnly);
  }

  private attachEvents = () => {
    this.markerImage.addEventListener("mousedown", this.mouseDown);
    this.markerImage.addEventListener("mousemove", this.mouseMove);
    this.markerImage.addEventListener("mouseup", this.mouseUp);
  }

  private mouseDown = (ev: MouseEvent) => {
    /* tslint:disable:no-bitwise */
    if (this.activeMarker && (ev.buttons & 1) > 0) {
      this.activeMarker.deselect();
      this.activeMarker = null;
      this.showUI()
    }
  }

  private mouseMove = (ev: MouseEvent) => {
    /* tslint:disable:no-bitwise */
    if (this.activeMarker && (ev.buttons & 1) > 0) {
      this.activeMarker.manipulate(ev);
    }
  }

  private mouseUp = (ev: MouseEvent) => {
    if (this.activeMarker) {
      this.activeMarker.endManipulation();
    }
  }

  private initMarkerCanvas = () => {
    this.markerImageHolder = document.createElement("div");
    // fix for Edge's touch behavior
    this.markerImageHolder.style.setProperty("touch-action", "none");
    this.markerImageHolder.style.setProperty("-ms-touch-action", "none");

    this.markerImage = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.markerImage.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    this.markerImage.setAttribute("width", this.width.toString());
    this.markerImage.setAttribute("height", this.height.toString());
    this.markerImage.setAttribute("viewBox", "0 0 " + this.width.toString() + " " + this.height.toString());

    this.markerImageHolder.style.position = "absolute";
    this.markerImageHolder.style.width = `${this.width}px`;
    this.markerImageHolder.style.height = `${this.height}px`;
    this.markerImageHolder.style.transformOrigin = "top left";
    this.positionMarkerImage();

    this.defs = SvgHelper.createDefs();
    this.markerImage.appendChild(this.defs);

    this.markerImageHolder.appendChild(this.markerImage);

    this.targetRoot.appendChild(this.markerImageHolder);
  }

  private adjustUI = (ev: UIEvent) => {
    this.adjustSize();
    this.positionUI();
  }

  private adjustSize = () => {
    this.width = this.target.clientWidth;
    this.height = this.target.clientHeight;

    const scale = this.target.clientWidth / this.markerImageHolder.clientWidth;
    if (scale !== 1.0) {
      this.scale *= scale;
      this.markerImageHolder.style.width = `${this.width}px`;
      this.markerImageHolder.style.height = `${this.height}px`;

      this.markerImageHolder.style.transform = `scale(${this.scale})`;
    }

  }

  private positionUI = () => {
    this.setTargetRect();
    this.positionMarkerImage();
    this.positionToolbar();
    if (this.logoUI) {
      this.positionLogo();
    }
  }

  private positionMarkerImage = () => {
    this.markerImageHolder.style.top = this.targetRect.top + "px";
    this.markerImageHolder.style.left = this.targetRect.left + "px";
  }

  private positionToolbar = () => {
    if (this.toolbarUI) {
      this.toolbarUI.style.left = `${(this.targetRect.left
        + this.target.offsetWidth - this.toolbarUI.clientWidth)}px`;
      this.toolbarUI.style.top = `${this.targetRect.top - this.toolbarUI.clientHeight}px`;
    }
  }

  private showUI = () => {

    if (this.toolbarUI) {
      this.targetRoot.removeChild(this.toolbarUI);
    }

    this.toolbar = new Toolbar(this.toolbars, this.toolbarClick);
    this.toolbarUI = this.toolbar.getUI();
    this.targetRoot.appendChild(this.toolbarUI);
    this.toolbarUI.style.position = "absolute";
    this.positionToolbar();
  }

  private setStyles = () => {
    const editorStyleSheet = document.createElementNS("http://www.w3.org/2000/svg", "style");
    editorStyleSheet.innerHTML = `
            .rect-marker .render-visual {
                stroke: ${this.markerColors.mainColor};
                stroke-width: ${this.strokeWidth};
                fill: transparent;
            }
            .cover-marker .render-visual {
                stroke-width: 0;
                fill: ${this.markerColors.coverColor};
            }
            .highlight-marker .render-visual {
                stroke: transparent;
                stroke-width: 0;
                fill: ${this.markerColors.highlightColor};
                fill-opacity: 0.4;
            }
            .line-marker .render-visual {
                stroke-width: ${this.strokeWidth};
                fill: transparent;
            }
            .arrow-marker .render-visual {
                stroke: ${this.markerColors.mainColor};
                stroke-width: ${this.strokeWidth};
                fill: transparent;
            }
            .arrow-marker-tip {
                stroke-width: 0;
            }
            .text-marker text {
                fill: ${this.markerColors.mainColor};
                font-family: sans-serif;
            }
            .ellipse-marker .render-visual {
                stroke-width: ${this.strokeWidth};
            }
            .markerjs-rect-control-box .markerjs-rect-control-rect {
                stroke: black;
                stroke-width: 1;
                stroke-opacity: 0.5;
                stroke-dasharray: 3, 2;
                fill: transparent;
            }
            .markerjs-control-grip {
                fill: #cccccc;
                stroke: #333333;
                stroke-width: 2;
            }
        `;

    this.markerImage.appendChild(editorStyleSheet);
  }

  private toolbarClick = (ev: MouseEvent, toolbarItem: ToolbarItem) => {
    if (toolbarItem.markerType) {
      this.addMarker(toolbarItem.markerType);
    } else {
      // command button
      switch (toolbarItem.name) {
        case "color": {
          this.setActiveMarkerColor(ev);
          break;
        }
        case "shadow": {
          this.setTextShadow(ev);
          break;
        }
        case "delete": {
          this.deleteActiveMarker();
          break;
        }
        case "pointer": {
          if (this.activeMarker) {
            this.selectMarker(null);
          }
          break;
        }
        case "close": {
          this.cancel();
          break;
        }
        case "ok": {
          this.complete();
          break;
        }
      }
    }
  }

  private selectMarker = (marker: MarkerBase | null) => {
    if (this.activeMarker && this.activeMarker !== marker) {
      this.activeMarker.deselect();
    }

    this.activeMarker = marker;

    if (marker) {
      this.color = marker.color || "#000000"
    }
    this.showUI();
  }

  private deleteMarker = (marker: MarkerBase) => {
    this.markerImage.removeChild(marker.visual);
    if (this.activeMarker === marker) {
      this.activeMarker = null;
    }
    this.markers.splice(this.markers.indexOf(marker), 1);
  }

  private complete = () => {
    this.selectMarker(null);
    this.startRender(this.renderFinishedClose);
  }

  private cancel = () => {
    this.close();
    if (this.cancelCallback) {
      this.cancelCallback();
    }
  }

  private renderFinished = (dataUrl: string) => {
    this.completeCallback(dataUrl, this.getState());
  }

  private renderFinishedClose = (dataUrl: string) => {
    this.close();
    this.completeCallback(dataUrl, this.getState());
  }

  private positionLogo = () => {
    if (this.logoUI) {
      this.logoUI.style.left = `${(this.targetRect.left + 10)}px`;
      this.logoUI.style.top = `${this.targetRect.top + this.target.offsetHeight
        - this.logoUI.clientHeight - 10}px`;
    }
  }
}
