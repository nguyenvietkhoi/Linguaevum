
var ajax_url = "http://www.chunom.org/service/score.cgi";
	
(function($){
    var $handwriting;
    function Handwriting(canvas, options) {
        var opt = $.extend({
            size: 400,
            update: null,
            backColor: '#eeeeee',
            gridColor: '#000000',
            strokeColor: '#000000',
            strokeWidth: 5,
            drawColor: '#ff0000',
            drawSmooth: true,
            surface: null
        }, options);
        var t = this;
        $handwriting = t;
        canvas.handwriting = t;
        t.surface = canvas;
        if (opt.surface && $(opt.surface).length) {
            if (window.G_vmlCanvasManager) { // IE with VML must use a proxy surface
                t.surface = $(opt.surface).css({background:'transparent', cursor: 'default'});
                t.surface[0].handwriting = t;
            } else {
                $(opt.surface).hide();
            }
        }
        t.canvas = canvas;
        t.ctx = canvas.getContext('2d');
        t.size = opt.size;
        t.update = opt.update;
        t.backColor = opt.backColor;
        t.gridColor = opt.gridColor;
        t.diagonalsColor = opt.diagonalsColor || opt.gridColor;
        t.strokeColor = opt.strokeColor;
        t.strokeWidth = opt.strokeWidth;
        t.drawColor = opt.drawColor;
        t.drawSmooth = opt.drawSmooth;
        t.precision = 10;
        if (t.size <= 300) t.precision = 8;
        if (t.size <= 200) t.precision = 7;
        if (t.size <= 100) t.precision = 5;
        if (opt.precision > t.precision) t.precision = opt.precision
        initCanvas(t);
    };
    function moveTo(x,y){ this._moveTo(x,y); return this }
    function lineTo(x,y){ this._lineTo(x,y); return this }
    function initCanvas(t) {
        var s = t.size, ca = t.canvas, c = t.ctx, surface = t.surface;
        ca.setAttribute('width', s);
        ca.setAttribute('height', s);
        $(ca).css({width: s, height: s, background: 'silver'})
        var p = $(ca).offset();
        t.x = 0; //p.left;
        t.y = 0 // p.top;
        t.paintCanvas = _paintCanvas;
        t.paintStrokes = _paintStrokes;
        t.revertStroke = _revertStroke;
        t.clearStrokes = _clearStrokes;
        t.getStrokes = _getStrokes;
        t.getString = _getString;
        t.replay = _replay;
        t.stop = _stop;
        t.setStrokes = _setStrokes;
        t.do_mousedown = t.do_touchstart = _doMousedown;
        t.do_mouseup = t.do_touchend = _doMouseup;
        t.do_mouseout = _doMouseout;
        t.do_mousemove = t.do_touchmove = _doMousemove;
        c._moveTo = c.moveTo;
        c._lineTo = c.lineTo;
        c.M = c.moveTo = moveTo;
        c.L = c.lineTo = lineTo;
        t.strokes = [];
        t.startStroke = false;
        t.mouseLeft = false;
        ca.ontouchstart = mouseEvent;
        ca.ontouchmove = mouseEvent;
        ca.ontouchend = mouseEvent;
        if (window.G_vmlCanvasManager) {
            $(surface).bind('mousedown', mouseEvent);
            $(surface).bind('mousemove', mouseEvent);
            $(surface).bind('mouseup', mouseEvent);
            $(surface).bind('mouseout', mouseEvent);
        } else {
            ca.addEventListener('mousedown', mouseEvent, false);
            ca.addEventListener('mousemove', mouseEvent, false);
            ca.addEventListener('mouseup',   mouseEvent, false);
            ca.addEventListener('mouseout',   mouseEvent, false);
        }
        ca.onselectstart = function() { return false };
        t.paintCanvas();
        t.paintStrokes();
    }
    function _paintCanvas() {
        var c = this.ctx, s = this.size+0.5, s2 = parseInt(this.size/2)+0.5;
        this.canvas.style.backgroundColor = this.backColor;
        c.clearRect(0,0,s,s);
        c.strokeStyle = this.gridColor;
        c.lineWidth = 1;
        c.beginPath();
        c.M(0,s2).L(s,s2)
         .M(s2,0).L(s2,s)
         .stroke();
        c.closePath();
        c.strokeStyle = this.diagonalsColor;
        c.beginPath();
        c.M(0,0).L(s,s)
         .M(s,0).L(0,s)
         .stroke();
        c.closePath();
        c.strokeStyle = this.drawColor;
        c.lineWidth = this.strokeWidth;
    }
    function _paintStrokes() {
        var c = this.ctx, s = this.strokes, x = this.x, y = this.y;
        if (s.length == 0) return;
        c.save();
        c.strokeStyle = this.strokeColor;
        c.beginPath();
        for (var i = 0, slen = s.length; i < slen; i++) {
            var point = s[i];
            var type = point[0];
            (c[type])(point[1] - x, point[2] - y)
        }
        c.stroke();
        c.restore();
    }
    function _stop() {
        var t = this;
        if (t._replay_timer) {
            window.clearInterval(t._replay_timer);
            t._replay_timer = null;
            t.strokes = t._replay_strokes;
            t.paintCanvas();
            t.paintStrokes();
            $("#replay").html("Replay");
        }
        return t;
    }
    function _replay() {
        var t = this, c = t.ctx, s = t.strokes, x = t.x, y = t.y;
        if (t._replay_timer) return t.stop();
        else if (s.length > 0) $("#replay").html("<span style='color:red'>Stop</span>");
        if (s.length == 0) return;
        t._replay_strokes = t.strokes;
        t.clearStrokes();
        c.beginPath();
        var i = 0, slen = s.length;
        t._replay_timer = window.setInterval(function() {
            if (i >= slen) {
                t.stop();
                return;
            }
            var point = s[i++];
            var type = point[0];
            if (type == "M") {
                t.paintCanvas();
                t.paintStrokes();
                c.beginPath()
            }
            (c[type])(point[1] - x, point[2] - y)
            c.stroke();
            t.strokes.push(point);
        }, 50);
    }
    function _setStrokes(s) {
        var t = this;
        var chunks = s.split(/;/);
        var size = chunks[0];
        var strokes = []
        for (var i = 1, clen = chunks.length; i < clen; i++) {
            var st = chunks[i].split(",");
            for (var j = 0, slen = st.length; j < slen; j += 2) {
                strokes.push([j == 0 ? "M" : "L", st[j], st[j+1]]);
            }
        }
        t.strokes = strokes;
        t.paintStrokes();
    }
    function _revertStroke() {
        this.stop();
        var e = 0, s = this.strokes;
        for (var i = s.length - 1; i > 0; i--) {
            if (s[i][0] == "M") {
                e = i;
                break;
            }
        }
        if (e < 0) e = 0;
        this.strokes = s.slice(0, e);
        if (this.update) this.update( this.strokes.slice(0) )
        this.paintCanvas();
        this.paintStrokes();
    }
    function _clearStrokes() {
        this.strokes = [];
        this.paintCanvas();
    }
    function _getStrokes() {
        var s = this.strokes;
        if (s.length == 0) return "";
        var str = "(" + s.join(")(").toString().replace(/,/g, "+") + "))";
        str = str.replace(/\(M\+/g, ")((");
        str = str.replace(/L\+/g, "").replace(/^\)/, "");
        return str;
    }
    function _getString() {
        var s = this.strokes;
        if (s.length == 0) return "";
        var str = "," + s.join(",").toString();
        str = str.replace(/,M,/g, ";");
        str = this.size+str.replace(/L,/g, "");
        return str;
    }
    function _doMousedown(ev) {
        if (!ev) ev = event;
        var t = this;
        t.startStroke = true;
        t.ctx.beginPath();
        t.ctx.M(ev._x - t.x, ev._y - t.y);
        t.strokes.push(['M', ev._x, ev._y]);
        return false;
    }
    function _doMousemove(ev) {
        if (!ev) ev = event;
        var t = this;
        if (!t.startStroke) return;
        var s = t.strokes;
        var last = s[s.length - 1];
        var xx = last[1] - ev._x
        var yy = last[2] - ev._y
        var dist = Math.sqrt(xx*xx + yy*yy)
        if (dist > t.precision) {
            t.strokes.push(['L', ev._x, ev._y]);
        }
        if (dist > t.precision || t.drawSmooth) t.ctx.L(ev._x - t.x, ev._y - t.y).stroke();
        return false;
    }
    function _doMouseout(ev) {
        if (!ev) ev = event;
        var t = this;
        if (!t.startStroke) return;
        this.startStroke = false;
        t.paintCanvas();
        t.revertStroke();
        return false;
    }
    function _doMouseup(ev) {
        if (!ev) ev = event;
        var t = this;
        if (!t.startStroke) return;
        t.startStroke = false;
        var s = t.strokes;
        var last = s[s.length - 1];
        if (last[0] == "M" && last[1] == ev._x && last[2] == ev._y) {
            t.strokes = s.slice(0, s.length - 1);
        } else {
            t.ctx.L(ev._x - t.x, ev._y - t.y).stroke();
            t.strokes.push(['L', ev._x, ev._y]);
        }
        if (t.update) t.update( t.strokes.slice(0) )
        t.paintCanvas();
        t.paintStrokes();
        return false;
    }
    function mouseEvent(ev) {
        if (!ev) ev = event;
        if (ev.type == "touchend") {
            //var touch = ev.touches[0];
            if (ev.changedTouches) {
                var touch = ev.changedTouches[0];
                if (touch) {
                    var pos = $(ev.target).offset();
                    ev._x = parseInt((touch.pageX||touch.clientX) - pos.left) // + (ev.offsetX||ev.layerX));
                    ev._y = parseInt((touch.pageY||touch.clientY) - pos.top) // + (ev.offsetY||ev.layerY));
                }
            }
        } else if (ev.touches && ev.touches.length) {
            var touch = ev.touches[0];
            if (touch) {
                if (ev.offsetX||ev.layerX) {
                    // IOS
                    ev._x = parseInt(ev.offsetX||ev.layerX);
                    ev._y = parseInt(ev.offsetY||ev.layerY);
                } else {
                    // Android, Windows
                    var pos = $(ev.target).offset();
                    ev._x = parseInt((touch.pageX||touch.clientX) - pos.left);
                    ev._y = parseInt((touch.pageY||touch.clientY) - pos.top);
                }
            }
        } else if (ev.offsetX || ev.offsetX == 0) {
            ev._x = ev.offsetX;
            ev._y = ev.offsetY;
        } else if (ev.originalEvent && (ev.originalEvent.layerX || ev.originalEvent.layerX == 0)) { // older Firefox, older Webkit
            ev._x = ev.originalEvent.layerX;
            ev._y = ev.originalEvent.layerY;
        } else if (ev.clientX || ev.clientX == 0) {
            ev._x = ev.pageX - document.getElementById("editor_container").offsetLeft;
            ev._y = ev.pageY - document.getElementById("editor_container").offsetTop;
        }
        var h = gethw(ev);
        if (h == null) return;
			
        var f = h['do_' + ev.type];
        if (f != null) f.call(h, ev);
        ev.preventDefault()
    }
    // IE has to use the global $handwriting object
    function gethw(ev) {
        return ev.target && ev.target.handwriting ? ev.target.handwriting : $handwriting;
    }
    $.fn.handwriting = function(opt) {
        var t = this[0];
        if (t.handwriting) return t.handwriting;
        return new Handwriting(t, opt);
    }
})(jQuery)
	
function moveCaretToEnd(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}
function select_char(span) {
    var s = $("#selection")[0];
    s.value += $(span).html();
    s.focus();
    $("#clear").trigger("click")
    moveCaretToEnd(s);
}
function json_results(d) {
    var list = $("#candidates");
    var html = "";
    for (var i = 0, rlen = d.results.length; i < rlen; i++) {
        var code = d.results[i].t;
        var label = Viqr2Unicode(d.results[i].l);
        var score = (d.results[i].s * 100 + 50).toFixed(0);
        html += "<div class='handwriting-result handwriting-score-" + (score > 0 ? 'positive' : 'negative') + "'>"
            + "<span  title='score " + score + "%' class='handwriting-label" + (score > 0 ? ' score-positive' : '') + "'>" + label + "</span><span class='handwriting-candidate' title='" + code + "'>&#x" + code + ";</span><a class='handwriting-code' target='unicode_detail' href='http://www.chunom.org/pages/" + code + "/'>U+" + code + "</a></div>";
    }
    list.html(html);
    $("#loading").stop().hide();
}

var Viqr2Unicode = (function() {
    var VIQR_MAP = {
        'a': ["a", "&aacute;", "&agrave;", 0x1EA3, "&atilde;", 0x1EA1],
        'a^': ["&acirc;", 0x1EA5, 0x1EA7, 0x1EA9, 0x1EAB, 0x1EAD],
        'a+': [0x103, 0x1EAF, 0x1EB1, 0x1EB3, 0x1EB5, 0x1EB7],
        'e': ["e", "&eacute;", "&egrave;", 0x1EBB, 0x1EBD, 0x1EB9],
        'e^': ["&ecirc;", 0x1EBF, 0x1EC1, 0x1EC3, 0x1EC5, 0x1EC7],
        'i': ["i", "&iacute;", "&igrave;", 0x1EC9, 0x129, 0x1ECB],
        'o': ["o", "&oacute;", "&ograve;", 0x1ECF, "&otilde;", 0x1ECD],
        'o^': ["&ocirc;", 0x1ED1, 0x1ED3, 0x1ED5, 0x1ED7, 0x1ED9],
        'o+': [0x1A1, 0x1EDB, 0x1EDD, 0x1EDF, 0x1EE1, 0x1EE3],
        'u': ["u", "&uacute;", "&ugrave;", 0x1EE7, 0x169, 0x1EE5],
        'u+': [0x1B0, 0x1EE9, 0x1EEB, 0x1EED, 0x1EEF, 0x1EF1],
        'y': ["y", "&yacute;", 0x1EF3, 0x1EF7, 0x1EF9, 0x1EF5]
    };
    var VIQR_RE = /([aeiouy])([\^\+]?)([\'\`\?\~\.]?)[a-z]*$/;
    var VIQR_DD = String.fromCharCode(0x111);
    var VIQR_UW = String.fromCharCode(0x1B0);
    for (var i in VIQR_MAP) {
        var map = VIQR_MAP[i];
        for (var j = 0; j < map.length; j++) {
            if (map[j] > 0) map[j] = String.fromCharCode(map[j]);
        }
    }
    return function(s) {
        var match = VIQR_RE.exec(s);
        if (match) {
            var vowel = match[1];
            var modifier = match[2];
            var tone = match[3];
            if (modifier == tone) return s.replace("dd", VIQR_DD);
            else {
                var re = VIQR_MAP[vowel+modifier][" '`?~.".indexOf(tone)];
                s = s.replace(vowel+modifier+tone, re);
                s = s.replace("u+", VIQR_UW); // for u+o+ only
                return s.replace("dd", VIQR_DD);
            }
        }
        return s.replace("dd", VIQR_DD) + "NN";
        /*if (s.match(RE_tone)) {
            //return s.replace(/a[]/, String.fromCharCode(0x103)).replace(/a\^/, "â").replace(/o\^/, "ô").replace(/e\^/, "ê");
        } else if (s.match(RE_vmods)) {
            return s.replace(/a\+/, String.fromCharCode(0x103))
                .replace(/a\^/, "â")
                .replace(/e\^/, "ê")
                .replace(/o\^/, "ô")
                .replace(/o\+/, String.fromCharCode(0x1A1))
                .replace(/u\+/, String.fromCharCode(0x1B0))
        }*/
        return s;
    }
})();
	
function check_service(v) {
    var img = $("#loading img")[0];
    img.src = "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
    img.src = "data:image/gif;base64,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";
    $("#loading").stop().css({opacity: 0}).show().animate({opacity: 1}, 200);
    $.ajax({
        url: ajax_url + "?"+v,
        cache: true,
        type: 'GET',
        contentType: "application/json", 
        dataType: "jsonp",
        //jsonpCallback: "json_results", // jsonCallback causes parseerror at times
        success: json_results,
        error: _error
    });
}
function _error(e) { console.log(e); console.log("ERROR") }
var language = 1; // default 0=vn, 1=en
function change_language(ln) {
    language = (ln ? ln : (language+1)%2);
    var w = {}, font="11pt candara,arial,sans-serif", h = $("#handwriting");
    if (language == 0) {
        font = "11pt tahoma,arial,sans-serif";
        w.Link = "Chia";
        w.Replay = "L&#x1EB7;p-l&#x1EA1;i";
        w.Clear = "Xo&aacute;";
        w.Revert = "S&#x1EED;a-l&#x1EA1;i";
    } else if (language == 1) {
        w.Link = "Share";
        w.Replay = "Replay";
        w.Clear = "Clear";
        w.Revert = "Revert";
    } else if (language == 2) {
        font = "10pt candara, arial,sans-serif";
        w.Link = "Teilen";
        w.Replay = "Wiederholen";
        w.Clear = "L&ouml;schen";
        w.Revert = "R&uuml;ckg&auml;ngig";
    }
    h.find("#link").html(w.Link).css("font", font);
    h.find("#replay").html(w.Replay).css("font", font);
    h.find("#clear").html(w.Clear).css("font", font);
    h.find("#revert").html(w.Revert).css("font", font);
}
$(function() {
    var LC = 'en';
    var L = navigator.browserLanguage || navigator.userLanguage || navigator.language;
    if (LC.indexOf('vi') > -1) L = 'vn';
    else if (LC.indexOf('en') > -1) L = 'en';
    else if (LC.indexOf('de') > -1) L = 'de';
		
    change_language(L.indexOf("vn") >= 0 ? 0 : (L.indexOf("de") >= 0 ? 2 : 1));
    var ed = $("#editor");
    ed.handwriting({
        size: 380,
        backColor: 'whitesmoke',
        gridColor: '#ddd',
        diagonalsColor: '#eee',
        strokeColor: '#555',
        drawColor: 'mediumblue',
        surface: '#editor_surface_vml', // use surface proxy for ie-vml
        strokeWidth: 5,
        update: function() {
            var h = ed.handwriting(), sz = h.size, s = h.getString();
            if (s && s.length < 1024 * 5) {
                check_service(s)
            }
            $("#link-content").hide();
        }
    });
    $("#revert").click(function(){ $("#candidates, #log").html(""); ed.handwriting().revertStroke() })
    $("#clear").click(function(){ ed.handwriting().stop().clearStrokes(); $("#link-content").hide() })
    $("#replay").click(function(){ ed.handwriting().replay() })
    $("#smooth").click(function(){ var h = ed.handwriting(); if (h.precision == 15) { h.precision = 7; h.drawSmooth = true } else { h.precision = 15; h.drawSmooth = false} })
    $("#show_code").click(function(){
        var s = ed.handwriting().getString();
        var s2 = ed.handwriting().getStrokes();
        $("#log").html(s + " " + s.length + "<br>" + s2 + " " + s2.length)
    })
    $("#link, #link-animation").click(function(){
        if (this.id == "link" && $("#link-content").css("display") == "block") return $("#link-content").slideUp();
        var link = window.location.href.replace(/\?.*/, "");
        if (top && top.location && top.location.href) {
            link = top.location.href;
            link = link.replace(/\?.*/, "");
        }
        var anim = $("#link-animation").get(0).checked ? 'anim;' : '';
        $("#link-content").slideDown()
        link = link+'?'+anim+ed.handwriting().stop().getString();
        $("#link-content").find(".link-url").val(link);
    })
    $("#candidates").click(function(e){
        var t = e.target;
        if (t.className == 'handwriting-candidate') select_char(t);
    });

    var s = window.location.hash;
    if (s.indexOf("#?") < 0) s = (top && top.location && top.location.href) ? top.location.hash : window.location.hash;
    if (s.indexOf("#?anim;380;") == 0 || s.indexOf("#?380;") == 0) {
        var hw = ed.handwriting();
        var anim = s.indexOf("#?anim;380;") == 0 ? true : false;
        var st = s.replace("#?", "").replace(/^anim;/,"");
        hw.setStrokes(st);
        check_service(hw.getString());
        if (anim) {
            ed.css({opacity: 0});
            ed.animate({opacity: 1}, 2000, function(){
                hw.replay();
            })
        }
    }
});
