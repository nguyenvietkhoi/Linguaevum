var geocoder;
var mymap;
var retromap = [
          { elementType: 'geometry', stylers: [{ color: '#ebe3cd' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#523735' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f1e6' }] },
          {
              featureType: 'administrative',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#c9b2a6' }]
          },
          {
              featureType: 'administrative.land_parcel',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#dcd2be' }]
          },
          {
              featureType: 'administrative.land_parcel',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#ae9e90' }]
          },
          {
              featureType: 'administrative.locality',
              elementType: 'labels.text.stroke',
              stylers: [{ visibility: 'off' }]
          },
          {
              featureType: 'landscape.natural',
              elementType: 'geometry',
              stylers: [{ color: '#dfd2ae' }]
          },
          {
              featureType: 'poi',
              elementType: 'geometry',
              stylers: [{ color: '#dfd2ae' }]
          },
          {
              featureType: 'poi',
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#dfd2ae' }]
          },
          {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#191616' }]
          },
          {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }]
          },
          {
              featureType: 'poi.medical',
              stylers: [{ visibility: 'off' }]
          },
          {
              featureType: 'poi.park',
              elementType: 'geometry.fill',
              stylers: [{ color: '#a5b076' }]
          },
          {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#223a18' }]
          },
          {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#f5f1e6' }]
          },
          {
              featureType: 'road.arterial',
              elementType: 'geometry',
              stylers: [{ color: '#fdfcf8' }]
          },
          {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ color: '#f8c967' }]
          },
          {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#e9bc62' }]
          },
          {
              featureType: 'road.highway.controlled_access',
              elementType: 'geometry',
              stylers: [{ color: '#e98d58' }]
          },
          {
              featureType: 'road.highway.controlled_access',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#db8555' }]
          },
          {
              featureType: 'road.local',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#806b63' }]
          },
          {
              featureType: 'transit',
              stylers: [{ visibility: 'off' }]
          },
          {
              featureType: 'transit.line',
              elementType: 'geometry',
              stylers: [{ color: '#dfd2ae' }]
          },
          {
              featureType: 'transit.line',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#8f7d77' }]
          },
          {
              featureType: 'transit.line',
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#ebe3cd' }]
          },
          {
              featureType: 'transit.station',
              elementType: 'geometry',
              stylers: [{ color: '#dfd2ae' }]
          },
          {
              featureType: 'water',
              elementType: 'geometry.fill',
              stylers: [{ color: '#a0b7ca' }]
          },
          {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#42554d' }]
          }
];
function initMap() {
    var mapProp = {
        center: new google.maps.LatLng(21.01, 105.84),
        zoom: 14,
        styles: retromap,
    };
    mymap = new google.maps.Map(document.getElementById("googleMap"), mapProp);

    var clickHandler = new ClickEventHandler(mymap);
    geocoder = new google.maps.Geocoder();
}

var ClickEventHandler = function (map) {
    this.map = map;
    this.placesService = new google.maps.places.PlacesService(map);
    this.infowindow = new google.maps.InfoWindow;
    this.infowindowContent = document.getElementById('infowindow-content');
    this.infowindow.setContent(this.infowindowContent);

    this.map.addListener('click', this.handleClick.bind(this));
};

ClickEventHandler.prototype.handleClick = function (event) {
    console.log('You clicked on: ' + event.latLng);
    new google.maps.Geocoder().geocode({ 'latLng': event.latLng }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                var country = null, countryCode = null, city = null, cityAlt = null;
                var c, lc, component;
                for (var r = 0, rl = results.length; r < rl; r += 1) {
                    var result = results[r];

                    if (!city && result.types[0] === 'locality') {
                        for (c = 0, lc = result.address_components.length; c < lc; c += 1) {
                            component = result.address_components[c];

                            if (component.types[0] === 'locality') {
                                city = component.long_name;
                                break;
                            }
                        }
                    }
                    else if (!city && !cityAlt && result.types[0] === 'administrative_area_level_1') {
                        for (c = 0, lc = result.address_components.length; c < lc; c += 1) {
                            component = result.address_components[c];

                            if (component.types[0] === 'administrative_area_level_1') {
                                cityAlt = component.long_name;
                                break;
                            }
                        }
                    } else if (!country && result.types[0] === 'country') {
                        country = result.address_components[0].long_name;
                        countryCode = result.address_components[0].short_name;
                    }

                    if (city && country) {
                        break;
                    }
                }

                console.log("City: " + city + ", City2: " + cityAlt + ", Country: " + country + ", Country Code: " + countryCode);
            }
        }
    });
    if (event.placeId) {
        event.stop();
        this.getPlaceInformation(event.placeId);
    }
};

ClickEventHandler.prototype.getPlaceInformation = function (placeId) {
    var me = this;
    this.placesService.getDetails({ placeId: placeId }, function (place, status) {
        if (status === 'OK') {
            me.infowindow.close();
            me.infowindow.setPosition(place.geometry.location);
            me.infowindowContent.children['place-icon'].src = place.icon;
            me.infowindowContent.children['place-name'].textContent = place.name;
            me.infowindowContent.children['place-id'].textContent = place.place_id;
            me.infowindowContent.children['place-address'].textContent =
                place.formatted_address;
            me.infowindow.open(me.map);
        }
    });
};
