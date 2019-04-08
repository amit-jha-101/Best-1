import { Component, OnInit } from '@angular/core';
import {
  ToastController,
  Platform,
  LoadingController
} from '@ionic/angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker,
  Polyline,
  GoogleMapsAnimation,
  MyLocation
} from '@ionic-native/google-maps';
import { HTTP } from '@ionic-native/http/ngx';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  map: GoogleMap;
  loading: any;

  constructor(
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private platform: Platform,
    private http: HTTP) { }

  async ngOnInit() {
    // Since ngOnInit() is executed before `deviceready` event,
    // you have to wait the event.
    await this.platform.ready();
    await this.loadMap();
  }

  loadMap() {
    this.map = GoogleMaps.create('map_canvas', {
      camera: {
        target: {
          lat: 43.0741704,
          lng: -89.3809802
        },
        zoom: 18,
        tilt: 30
      }
    });

  }

  async onButtonClick() {
    this.map.clear();

    this.loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    await this.loading.present();

    // Get the location of you
    this.map.getMyLocation().then((location: MyLocation) => {
      this.loading.dismiss();
      console.log(JSON.stringify(location, null ,2));

      // Move the map camera to the location with animation
      this.map.animateCamera({
        target: location.latLng,
        zoom: 17,
        tilt: 30
      });

      // add a marker
      let marker: Marker = this.map.addMarkerSync({
        title: 'Your Location',
        snippet: '',
        position: location.latLng,
        animation: GoogleMapsAnimation.BOUNCE
      });
      let pos = {
        "lat": 19.2032130,
        "lng": 72.8262532
      };
      let marker2: Marker = this.map.addMarkerSync({
        title: 'Supply Bus Location',
        snippet: '',
        position: {
          "lat": 19.2035130,
          "lng": 72.8264532,
        },
        animation: GoogleMapsAnimation.BOUNCE
      });
      let point;
      let url = 'https://maps.googleapis.com/maps/api/directions/json?key=AIzaSyAylgT27dZKQLOOFCoLfM1HsvIBac8sHQg&origin='+location.latLng.lat+','+location.latLng.lng+'&destination='+pos.lat+','+pos.lng;
      this.http.get(url,{},{}).then(response =>{
        point = response;
        console.log(response);
      }).catch(error =>{
        console.log(error);
      });
      let decodedPoints = GoogleMaps.getPlugin().geometry.encoding.decodePath(
        point.routes[0].overview_polyline.points );
        console.log('decode points', decodedPoints);

        this.map.addPolyline({
          points : decodedPoints,
          color : '#AA00FF',
          width: 2,
          geodesic : false
          })
      // show the infoWindow
      marker.showInfoWindow();
      marker2.showInfoWindow();

      // If clicked it, display the alert
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        this.showToast('don\'t click' );
      });
    })
    .catch(err => {
      this.loading.dismiss();
      this.showToast(err.error_message);
    });
  }

  async showToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'middle'
    });

    toast.present();
  }
}