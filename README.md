# ng-maps-overlays
Custom marker overlay for the @ng-maps/core package

<details>
  <summary>Table of Contents</summary>

- [Dependencies](#dependencies)
- [Install](#install)
- [Import](#import)
- [Usage](#usage)
  - [Zoom Sizing](#zoom-sizing)
- [Clustering Demo](#clustering-demo)
- [Resources](#resources)
- [Inspired By](#thanks-to--inspired-by-the-original-package---agm-overlays)
- [Credits and Collaborators](#credits-and-collaborators)
- [Also Try](#also-try)

</details>

# Dependencies

Please be sure you have installed:
- [@ng-maps/core](https://www.npmjs.com/package/@ng-maps/core)
- [@angular/core](https://www.npmjs.com/package/@angular/core)
- [@angular/platform-browser](https://www.npmjs.com/package/@angular/platform-browser)

# Install
Open a command terminal and type the following
```bash
npm i @deliverysolutions/ng-maps-overlays
```

# Import
```typescript
import { NgMapOverlay } from "@deliverysolutions/ng-maps-overlays"
import { NgModule } from "@angular/core"
import { BrowserModule } from '@angular/platform-browser'

@NgModule({
  imports:[
    BrowserModule,
    NgMapsOverlays,
    NgMapsCoreModule,
  ],
  providers: [
    {
      provide: GOOGLE_MAPS_API_CONFIG,
      useValue: {
        apiKey: 'YOUR_API_KEY'
      }
    }
  ]
}) export class AppModule {}
```

# Usage
**Multiple Custom Overlays**
```html
<map-view style="height:300px;display:block;">
  <ng-maps-overlay
    *ngFor      = "let item of latLngArray"
    [latitude]  = "item.latitude"
    [longitude] = "item.longitude"
  >
    <!-- blue html square -->
    <div style="width:15px;height:15px;background-color:blue;"></div>
  </ng-maps-overlay>
</map-view>
```
> With multiple custom overlays, the zoom is auto set by the bounds calculated amongst all custom overlays

**Single Custom Overlay**
```html
<map-view
  [zoom] = "12"
  style  = "height:300px;display:block;"
  [latitude]  = "item.latitude"
  [longitude] = "item.longitude"
>
  <ng-maps-overlay
    [latitude]  = "item.latitude"
    [longitude] = "item.longitude"
  >
    <!-- blue html square -->
    <div style="width:15px;height:15px;background-color:blue;"></div>
  </ng-maps-overlay>
</map-view>
```

### Zoom Sizing
By default, markers are always the same size regardless of zoom. Change that!

> The following example expands the latitude(0.003) and the longitude(0.0052) in both directions

```html
<map-view
  [zoom] = "12"
  style  = "height:300px;display:block;"
  [latitude]  = "item.latitude"
  [longitude] = "item.longitude"
>
  <ng-maps-overlay
    [latitude]  = "item.latitude"
    [longitude] = "item.longitude"
    [bounds] = "{x:{latitude:-0.003,longitude:-0.0052},y:{latitude:0.003,longitude:0.0052}}"
  >
    <!-- blue html square -->
    <div style="width:15px;height:15px;background-color:blue;"></div>
  </ng-maps-overlay>
</map-view>
```


# Clustering Demo
Clustering is NOT a responsibility of this package, however it can be done

```html
<map-view
  [latitude]  = "latLngArray[0].latitude"
  [longitude] = "latLngArray[1].latitude"
>
  <map-marker-cluster imagePath="https://raw.githubusercontent.com/googlemaps/v3-utility-library/master/markerclustererplus/images/m">
    <ng-maps-overlay
      *ngFor      = "let item of latLngArray;let i=index"
      [latitude]  = "item.latitude"
      [longitude] = "item.longitude"
    >
      <!-- blue html square -->
      <div class="block">
        <strong style="color:white;">{{i}}</strong>
      </div>
    </ng-maps-overlay>
  </map-marker-cluster>
</map-view>
```


# Resources
- [@ng-maps/core](https://www.npmjs.com/package/@ng-maps/core) installed

# Thanks to & Inspired by the original package - [agm-overlays](https://github.com/AckerApple/agm-overlays)
- [Acker Apple](https://github.com/AckerApple)
- [Todd Greenberg](https://github.com/tsgreenberg1217)

# Credits and Collaborators
- [Arbaaz Din](https://github.com/ArbaazDin)
- [Rushabh Vora](https://github.com/rushvora)
