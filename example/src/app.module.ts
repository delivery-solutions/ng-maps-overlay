import { NgModule } from "@angular/core"
import { BrowserModule } from '@angular/platform-browser'
import { NgMapsCoreModule } from "@ng-maps/core"
import { NgMapsGoogleModule, GOOGLE_MAPS_API_CONFIG } from "@ng-maps/google"
import { AppComponent } from "./app.component"
import { NgMapsMarkerClustererModule } from '@ng-maps/marker-clusterer';
import { NgMapsOverlays } from "../../src"

@NgModule({
  imports:[
    BrowserModule,
    NgMapsOverlays,
    NgMapsCoreModule,
    NgMapsGoogleModule,
    NgMapsMarkerClustererModule,
  ],
  providers: [
    {
      provide: GOOGLE_MAPS_API_CONFIG,
      useValue: {
        apiKey: 'YOUR_API_KEY'
      }
    }
  ],
  bootstrap: [ AppComponent ],
  declarations: [ AppComponent ]
}) export class AppModule{}