import { Subscription } from 'rxjs';

import {
  Input,
  Component,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  QueryList,
  ContentChildren,
} from '@angular/core';

import { NgMapsInfoWindowComponent, MapsApiWrapper, MarkerManager } from '@ng-maps/core';

declare var google: any;

export interface latLng {
  latitude: number;
  longitude: number;
}

export interface bounds {
  x: latLng; //relative adjustment mathematics
  y: latLng; //relative adjustment mathematics
}

export interface latLngPlus {
  latitude: number;
  longitude: number;
  bounds?: bounds;
}

@Component({
  selector: 'ng-maps-overlay',
  template: '<div #content><div style="position:absolute"><ng-content></ng-content></div></div>',
})
export class NgMapsOverlay {
  @Input() latitude!: number;
  @Input() longitude!: number;

  @Input() visible: boolean = true;
  @Input() zIndex: number = 1;
  @Input() bounds!: bounds;

  //TIP: Do NOT use this... Just put (click) on your html overlay element
  @Output() markerClick: EventEmitter<void> = new EventEmitter<void>();

  @Input() openInfoWindow: boolean = true;
  @ContentChildren(NgMapsInfoWindowComponent) infoWindow: QueryList<NgMapsInfoWindowComponent> =
    new QueryList<NgMapsInfoWindowComponent>();

  //TODO, implement this
  @Input('markerDraggable') draggable: boolean = false;

  @ViewChild('content', {
    read: ElementRef,
  })
  template!: ElementRef;

  destroyed!: boolean;
  overlayView!: any;
  //elmGuts:any
  private _observableSubscriptions: Subscription[] = [];

  constructor(
    protected _mapsWrapper: MapsApiWrapper,
    private _markerManager: MarkerManager //rename to fight the private declaration of parent
  ) {}

  async ngAfterViewInit() {
    //remove reference of info windows
    const iWins = await this.template.nativeElement.getElementsByTagName('map-info-window');
    for (let x = iWins.length - 1; x >= 0; --x) {
      iWins[x].parentNode.removeChild(iWins[x]);
    }

    await this.load().then(() => {
      this.onChanges = this.onChangesOverride;
    });
  }

  ngAfterContentInit() {
    this.infoWindow.changes.subscribe(() => this.handleInfoWindowUpdate());
  }

  ngOnChanges(changes: any) {
    this.onChanges(changes);
  }

  onChanges(changes: any) {}

  onChangesOverride(changes: any) {
    if (changes.latitude || changes.longitude || changes.zIndex) {
      this.overlayView.latitude = this.latitude;
      this.overlayView.longitude = this.longitude;
      this.overlayView.zIndex = this.zIndex;
      this.destroy().then(() => this.load());
    }
  }

  ngOnDestroy() {
    this.destroy();
  }

  destroy(): any {
    this.destroyed = true;

    this._markerManager.deleteMarker(this.overlayView);

    if (this.overlayView) {
      if (this.overlayView.div) {
        this.overlayView.remove();
      }
      this.overlayView.setMap(null);
    }

    this._observableSubscriptions.forEach((s) => s.unsubscribe());

    delete this.overlayView;
    //delete this.elmGuts
  }

  private handleInfoWindowUpdate() {
    if (this.infoWindow.length > 1) {
      throw new Error('Expected no more than one info window.');
    }

    this.infoWindow.forEach((iWin) => {
      iWin.hostMarker = <any>this.overlayView;
    });
  }

  async load(): Promise<any> {
    return await this._mapsWrapper
      .getNativeMap()
      .then(async (map) => {
        const overlay = this.getOverlay(map);
        await this._markerManager.addMarker(overlay);
        this._addEventListeners();
        return this._markerManager.getNativeMarker(overlay);
      })
      .then(async (nativeMarker) => {
        const setMap = nativeMarker.setMap;
        if (nativeMarker['map']) {
          this.overlayView.setMap(nativeMarker['map']);
        }

        nativeMarker.setMap = (map: any) => {
          setMap.call(nativeMarker, map);

          if (this.overlayView) {
            this.overlayView.setMap(map);
          }
        };
      });
  }

  getOverlay(map: any) {
    this.overlayView = this.overlayView || new google.maps.OverlayView();

    this.overlayView.iconUrl = ' ';
    this.overlayView.latitude = this.latitude;
    this.overlayView.longitude = this.longitude;
    this.overlayView.visible = false; //hide 40x40 transparent placeholder that prevents hover events

    if (this.bounds) {
      this.overlayView.bounds_ = new google.maps.LatLngBounds(
        new google.maps.LatLng(this.latitude + this.bounds.x.latitude, this.longitude + this.bounds.x.longitude),
        new google.maps.LatLng(this.latitude + this.bounds.y.latitude, this.longitude + this.bounds.y.longitude)
      );
    }

    // js-marker-clusterer does not support updating positions. We are forced to delete/add and compensate for .removeChild calls
    const elm = this.template.nativeElement.children[0];
    //const elm =  this.elmGuts || this.template.nativeElement.children[0]

    //we must always be sure to steal our stolen element back incase we are just in middle of changes and will redraw
    const restore = (div: any) => {
      this.template.nativeElement.appendChild(div);
    };

    this.overlayView.remove = function () {
      if (!this.div) return;
      this.div.parentNode.removeChild(this.div);
      restore(this.div);
      delete this.div;
    };

    this.overlayView.getDiv = function () {
      return this.div;
    };

    this.overlayView.draw = function () {
      if (!this.div) {
        this.div = elm;
        const panes = this.getPanes();
        // if no panes then assumed not on map
        if (!panes || !panes.overlayImage) return;

        panes.overlayImage.appendChild(elm);
      }

      const latlng = new google.maps.LatLng(this.latitude, this.longitude);

      const proj = this.getProjection();
      if (!proj) return;

      const point = proj.fromLatLngToDivPixel(latlng);

      if (point) {
        elm.style.left = point.x - 10 + 'px';
        elm.style.top = point.y - 20 + 'px';
      }

      if (this.bounds_) {
        // stretch content between two points leftbottom and righttop and resize
        const proj = this.getProjection();
        const sw = proj.fromLatLngToDivPixel(this.bounds_.getSouthWest());
        const ne = proj.fromLatLngToDivPixel(this.bounds_.getNorthEast());

        this.div.style.left = sw.x + 'px';
        this.div.style.top = ne.y + 'px';
        this.div.children[0].style.width = ne.x - sw.x + 'px';
        this.div.children[0].style.height = sw.y - ne.y + 'px';
      }
    };

    elm.addEventListener('click', (event: any) => {
      this.handleTap();
      event.stopPropagation();
    });

    this.handleInfoWindowUpdate();

    return this.overlayView;
  }

  handleTap() {
    if (this.openInfoWindow) {
      this.infoWindow.forEach((infoWindow) => {
        infoWindow.open();
      });
    }
    this.markerClick.emit();
  }

  _addEventListeners() {
    const eo = this._markerManager.createEventObservable('click', <any>this.overlayView);
    const cs = eo.subscribe(() => this.handleTap());
    this._observableSubscriptions.push(cs);
  }
}
