var arrLabelLocality = [];
var arrLocality;

self.addEventListener('install', function (event) {
    event.waitUntil(
      caches.open('v1').then(function (cache) {
          return cache.addAll([
            '/Resources/sinomap.jpg',
            '/Resources/tho.png',
            '/Scripts/sql.js'
          ]);
      })
    );
});

initMap();

// Connect to sqlite db file
var xhr = new XMLHttpRequest();
xhr.open('GET', '/Resources/sinomap.jpg', true);
xhr.responseType = 'arraybuffer';
xhr.onload = function (e) {
    var uInt8Array = new Uint8Array(this.response);
    condb = new SQL.Database(uInt8Array);
    contents = condb.exec("SELECT * FROM Locality ");
    console.log(contents[0].values[0]);

    arrLocality = contents[0].values;
    initLabel();
};
xhr.send();

mymap.addListener('zoom_changed', function () {
    var mapzoom = mymap.getZoom();
    for (var i = 0; i != arrLocality.length; i++) {
        if ((mapzoom > arrLocality[i][5]) && (mapzoom < arrLocality[i][6]))
            arrLabelLocality[i].show();
        else
            arrLabelLocality[i].hide();
    }
});

function initLabel() {
    for (var i = 0; i != arrLocality.length; i++) {
        var poiLabel = new ELabel({
            latlng: new google.maps.LatLng(arrLocality[i][3], arrLocality[i][4]),
            label: "<center>" + arrLocality[i][1] + "</center>",
            classname: "label_" + arrLocality[i][7],
            clicktarget: true,
            offset: new google.maps.Size(0, -2),
            centre: true
        });
        poiLabel.setMap(mymap);

        var mapzoom = mymap.getZoom();
        if ((mapzoom > arrLocality[i][5]) && (mapzoom < arrLocality[i][6]))
            poiLabel.show();
        else
            poiLabel.hide();

        arrLabelLocality.push(poiLabel);
    }
    hideLocality();
}

function updateLabel() {
    var labelscript = "";    
    switch ($('#labelscripttype').val()) {
        case '0':
            labelscript = arrLocality[i][1];
            break;
        case '1':
            labelscript = arrLocality[i][2];
            break;
        default:
            labelscript = "";
            break;
    }
    var mapzoom = mymap.getZoom();
    for (var i = 0; i != arrLocality.length; i++) {
        arrLabelLocality[i] = new ELabel({
            latlng: new google.maps.LatLng(arrLocality[i][3], arrLocality[i][4]),
            label: "<center>" + labelscript + "</center>",
            classname: "label_" + arrLocality[i].level,
            clicktarget: true,
            offset: new google.maps.Size(0, -2),
            centre: true
        });
        var mapzoom = mymap.getZoom();
        for (var i = 0; i != arrLocality.length; i++) {
            if ((mapzoom > arrLocality[i][5]) && (mapzoom < arrLocality[i][6]))
                arrLabelLocality[i].show();
            else
                arrLabelLocality[i].hide();
        }
    }
}

function scriptChange() {
    switch ($('#labelscripttype').val()) {
        case '0':
            for (var i = 0; i != arrLocality.length; i++) {
                arrLabelLocality[i].setContents('<center>' + arrLocality[i][1] + '</center>');
            }
            hideLocality();
            break;
        case '1':
            for (var i = 0; i != arrLocality.length; i++) {
                arrLabelLocality[i].setContents('<center>' + arrLocality[i][2] + '</center>');
            }
            hideLocality();
            break;
        case '2':
            for (var i = 0; i != arrLocality.length; i++) {
                arrLabelLocality[i].setContents('');
            }
            showLocality();
            break;
        default: break;
    }
}

function showLocality() {
    mymap.setOptions({
        styles: retromap.concat([{
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#624d7e',
                visibility: 'on',
            }]
        },
          {
              featureType: 'administrative.neighborhood',
              elementType: 'labels.text.fill',
              stylers: [{
                  color: '#74412e',
                  visibility: 'on'
              }]
          }
        ])
    });
}
function hideLocality() {
    mymap.setOptions({
        styles: retromap.concat([{
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{
                //visibility: 'off',
                color: '#baaedf',
            }]
        },
          {
              featureType: 'administrative.neighborhood',
              elementType: 'labels.text.fill',
              stylers: [{
                  //visibility: 'off',
                  color: '#d7a588',
              }]
          }
        ])
    });
}

var txttmp = "";

function codeAddress(ind, huyen) {
    geocoder.geocode({ 'address': arrLocality[ind][2]+" " + huyen }, function (results, status) {
        if (status == 'OK') {
            txttmp += "INSERT INTO \"Locality\" VALUES (NULL,\'" + arrLocality[ind][1] + "\',\'" + arrLocality[ind][2] + "\'," + results[0].geometry.location.lat() + "," + results[0].geometry.location.lng() + ","+ arrLocality[ind][5]+ ","+ arrLocality[ind][6]+ ","+ arrLocality[ind][7] + ");\n";
        } else if (status == 'OVER_QUERY_LIMIT') {
            setTimeout(codeAddress(ind, huyen), 2000);
            //txttmp += "INSERT INTO \"Locality\" VALUES (NULL,\'" + arrLocality[ind][1] + "\',\'" + arrLocality[ind][2] + "\', 21.022,105.832 ," + arrLocality[ind][5] + "," + arrLocality[ind][6] + "," + arrLocality[ind][7] + ");\n";
        } else {
            console.log(ind);
        }
    });
}

