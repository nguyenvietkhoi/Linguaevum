﻿/*
* ELabel.js - v4 - 27/03/2020
* https://github.com/erunyon/ELabel
* 
* Copyright (c) 2010 Erik Runyon
* Modified by Nguyen Viet Khoi
* Dual licensed under the MIT and GPL licenses.
* http://weedygarden.net
*/

function ELabel(data) {
    /*
    data is an object in the following format:
    new ELabel({
    latlng: new google.maps.LatLng(41.700346,-86.238899), 
    label: "Foo", 
    classname: "label", 
    offset: new google.maps.Size(-18, -12), 
    opacity: 100, 
    overlap: true,
    clicktarget: false
    });
    */

    var data = data;

    // Mandatory parameters
    this.point = data.latlng;
    this.html = data.label;

    // Optional parameters
    this.classname = data.classname || "";
    this.pixelOffset = data.offset || new google.maps.Size(0, 0);
    if (data.opacity) {
        if (data.opacity < 0) { data.opacity = 0; }
        if (data.opacity > 100) { data.opacity = 100; }
    }
    this.percentOpacity = data.opacity;
    this.overlap = data.overlap || false;
    this.hidden = false;
    this.clicktarget = (data.clicktarget) ? data.clicktarget : false;
    this.centre = data.centre || false;
}

ELabel.prototype = new google.maps.OverlayView;

ELabel.prototype.onAdd = function (map) {
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.innerHTML = '<div class="' + this.classname + '">' + this.html + '</div>';
    this.getPanes().floatShadow.appendChild(div);
    this.map_ = map;
    this.div_ = div;
    if (this.percentOpacity) {
        if (typeof (div.style.filter) == 'string') { div.style.filter = 'alpha(opacity:' + this.percentOpacity + ')'; }
        if (typeof (div.style.KHTMLOpacity) == 'string') { div.style.KHTMLOpacity = this.percentOpacity / 100; }
        if (typeof (div.style.MozOpacity) == 'string') { div.style.MozOpacity = this.percentOpacity / 100; }
        if (typeof (div.style.opacity) == 'string') { div.style.opacity = this.percentOpacity / 100; }
    }
    if (this.overlap) {
        //This is a work in progress
        //var z = google.maps.Overlay.getZIndex(this.point.lat());
        // this.div_.style.zIndex = z;
        var z = 1000 * (90 - this.point.lat());
        this.div_.style.zIndex = parseInt(z);
    }
    if (this.hidden) {
        this.hide();
    }
    if (this.clicktarget) {
        var target = this.clicktarget;

        // Can't get this to work, which would be ideal
        // google.maps.event.addListener(this.div_, 'click', function() {
        // 	google.maps.event.trigger(target, "click");
        // });

        if (typeof jQuery != 'undefined') {
            jQuery(this.div_).click(function () {
                google.maps.event.trigger(target, "click");
            });
        }
    }
};

ELabel.prototype.onRemove = function () {
    this.div_.parentNode.removeChild(this.div_);
};

ELabel.prototype.copy = function () {
    return new ELabel({
        latlng: this.point,
        label: this.html,
        classname: "label",
        offset: new google.maps.Size(-18, -12),
        opacity: 100,
        overlap: true,
        clicktarget: false
    });
};

ELabel.prototype.draw = function () {
    var proj = this.getProjection(),
  		pos = proj.fromLatLngToDivPixel(this.point);

    var centreWidthOffset = 0;
    var centreHeightOffset = 0;
    if (this.centre) {
        centreWidthOffset = -this.div_.offsetWidth / 2;
        centreHeightOffset = -this.div_.offsetHeight / 2;
    }

    this.div_.style.left = (pos.x + this.pixelOffset.width + centreWidthOffset) + "px";
    this.div_.style.top = (pos.y + this.pixelOffset.height + centreHeightOffset) + "px";
};

ELabel.prototype.show = function () {
    if (this.div_) {
        this.div_.style.display = "";
        this.draw();
    }
    this.hidden = false;
};

ELabel.prototype.hide = function () {
    if (this.div_) {
        this.div_.style.display = "none";
    }
    this.hidden = true;
};

ELabel.prototype.isHidden = function () {
    return this.hidden;
};

ELabel.prototype.supportsHide = function () {
    return true;
};

ELabel.prototype.setContents = function (html) {
    this.html = html;
    this.div_.innerHTML = '<div class="' + this.classname + '">' + this.html + '</div>';
    this.draw();
};

ELabel.prototype.setPoint = function (point) {
    this.point = point;
    if (this.overlap) {
        var z = google.maps.Overlay.getZIndex(this.point.lat());
        this.div_.style.zIndex = z;
    }
    this.draw();
};

ELabel.prototype.setOpacity = function (percentOpacity) {
    if (percentOpacity) {
        if (percentOpacity < 0) { percentOpacity = 0; }
        if (percentOpacity > 100) { percentOpacity = 100; }
    }
    this.percentOpacity = percentOpacity;
    if (this.percentOpacity) {
        if (typeof (this.div_.style.filter) == 'string') { this.div_.style.filter = 'alpha(opacity:' + this.percentOpacity + ')'; }
        if (typeof (this.div_.style.KHTMLOpacity) == 'string') { this.div_.style.KHTMLOpacity = this.percentOpacity / 100; }
        if (typeof (this.div_.style.MozOpacity) == 'string') { this.div_.style.MozOpacity = this.percentOpacity / 100; }
        if (typeof (this.div_.style.opacity) == 'string') { this.div_.style.opacity = this.percentOpacity / 100; }
    }
};

ELabel.prototype.getPoint = function () {
    return this.point;
};