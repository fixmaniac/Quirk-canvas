       /**
 * Copyright (c) 2018, Łukasz Ligocki.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @@flow
 */

"use strict";
var Quirk;
const ShapeType = {
  EMPTY: 0,
  CHALK: 1,
  LINE: 2,
  RECTANGLE: 3,
  properties: {
    0: {name: "Empty", value: 0},
    1: {name: "Chalk", value: 1},
    2: {name: "Line",  value: 2},
    3: {name: "Rectangle", value: 3}
  }
};
const methods = ['POST', 'GET'];
const directions = ['Prev', 'Next'];

var StateType = {draw: 1, text : 2};
var color = "#000000";
var eraser = false;

// @@ begining
//

;(function() {

var canvas;
var statusbar;
var statusbar_width = 164;
var statusbar_height = 122;
var context, tempcontext;
var container;
//var eventSerialized;
var shape;
var size = 4;
var width, height;
var state;
var editable;
var windowX, windowY;
    var layers = [];

     var strokesHistory = {
            Strokes: []
        };

        var currentStroke = {
            Points: []
        };

// ext

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

// (...ctor)

Quirk = function(id){
    if (id && typeof id=== "string"){
       container = document.getElementById(id);
    }
    else
    {
        throw "Unknown identifier"
    }
}
Quirk.prototype = {

/**
 * Initialize new instance of object, DOM, event etc.
 * @@public
 */

init : function(){
       /// UI elements
       canvas = document.createElement("canvas");
       statusbar = document.createElement("span");

       /// Stylize
       canvas.setAttribute('width', container.width);
       canvas.setAttribute('height', container.height);
       canvas.setAttribute('id','tempCanvas');
        canvas.setAttribute('border', '2px');
        canvas.setAttribute('display', 'inline - block');

       statusbar.style.border = "2px solid #c9c9c9";
       statusbar.style.width = statusbar_width + "px";
       statusbar.style.height = statusbar_height + "px";
       statusbar.style.position = 'absolute';
       statusbar.style.right= container.width - statusbar_width - 10 + 'px';
       statusbar.style.top= container.height - statusbar_height + 70 + 'px';
       container.innerHTML = '';

       /// DOM attach
       container.parentNode.appendChild(canvas);
       canvas.parentNode.appendChild(statusbar);

       /// Extra
       if (typeof G_vmlCanvasManager != 'undefined') {
		     canvas = G_vmlCanvasManager.initElement(canvas);
	     }

       /// Canvas impl.
       context = canvas.getContext("2d");
       tempcontext = container.getContext("2d");
       context.fillRect(0,0,width,height);

       /// Events impl
       if (canvas.addEventListener){
            canvas.addEventListener('mousedown', this.move, false);
            canvas.addEventListener('mousemove', this.move, false);
            canvas.addEventListener('mouseup', this.move, false);
            canvas.addEventListener('click', this.insertText, false);
            container.addEventListener("contextmenu", function (e) {
                e.preventDefault();
            });
       }


       //quirk = this;
       this.state = StateType.draw;
       this.shape = this.setShape(ShapeType.CHALK);
       Object.defineProperty(this, 'isEditable', { get: function()
           { return (this.state == 'undefined' || this.state != StateType.draw) ? false : true; } });

},
/**
 * Change a tool.
 *
 * @@param {ShapeType} kind of tool.
 * @@public
 */
setShape: function(type){

    if (!this.isEditable){
        this.state = StateType.draw;
    }
    eraser = false;
    switch(type){
        case ShapeType.CHALK : shape = new Quirk.shapes.chalk();
                                break;
        case ShapeType.LINE : shape = new Quirk.shapes.line();
                                break;
        case ShapeType.RECTANGLE : shape = new Quirk.shapes.rectangle();
                                break;
        default : return;
    }
},

setWrite: function(){
    shape = null;
},

setColor: function(val){
    color = val;
},

setEraser: function(){

   eraser = true;
    shape = new Quirk.shapes.chalk();


},

move : function(args){

    if (args.layerX || args.layerX == 0) {
       var x = args.layerX;
       var y = args.layerY;
    }
    else if (args.offsetX || args.offsetX == 0) {
      var  x = args.offsetX;
      var  y = args.offsetY;
    }

   windowX = args.pageX;
   windowY = args.pageY;
   

        statusbar.innerHTML = "<center><p style='color:blue; font-weight: bold;'>x: " + windowX + ", y: " + windowY + "</p><br/><p style='color:blue; font-weight: bold;'>font-size: " + size + "</p></center>";

    if (shape == null){
        return;
    }

    context.strokeStyle = eraser == true ? "#ffffff" : color;
	context.lineWidth = size;
	context.lineCap = "round"

    switch(event.type)
    {
        case "mousedown" :  {
            shape.mousedown (x,y);
           };
            break;
        case "mousemove" :  {
            shape.mousemove (x, y);
          };
            break;
        case "mouseup"   : {
            shape.mouseup (x, y);
          };
            break;

        default:  return;
    }
 },
        
        deserialize: async function (data) {
            
            let response = await new Promise(resolve => {
                try
                {
                    const img = new Image();
                    img.onload = function () {
                        tempcontext.clearRect(0, 0, canvas.width, canvas.height);
                        tempcontext.drawImage(img, 0, 0);
                 }
                    img.src = decodeURIComponent(data).replace(/["']/g, "");
                }
                catch (err) {
                    reject(err);
                }
                resolve(true);
            })
            return await response;
        },

        serialize: function () {
            var  eventSerialized = new CustomEvent("OnCanvasSerialized", {
                detail:
                {
                    source: container.toDataURL()
                }
            });
            document.dispatchEvent(eventSerialized);
        },



/**
 * Inject html straight into a canvas.
 *
 * @@param html html text value
 */

insertHTML : function(html){
    if (html && typeof html === "string"){

    var data_arg = html.split(/\r?\n/);
     if (data_arg.length == 0) {
        throw "Empty data";
     }

    var data_on  = '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute; left:{0}px; top:{1}px">'.format(windowX, windowY) +
                    '<foreignObject width="100%" height="100%">' +
                    '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:' + 4 + size + 'px; color:' + color + '">';
    var data_off = '</div>' +
                '</foreignObject>' +
                '</svg>';

    var data = data_on;
    for (let i = 0; i < data_arg.length; i++){
        data += data_arg[i];
    }
    data += data_off;

    var DOMURL = window.URL || window.webkitURL || window;
    var img = new Image();
    var svg = new Blob([data], { type: 'image/svg+xml' });
    /// Obsolete CROSS
    var url = DOMURL.createObjectURL(svg);

        if (/^([\w]+\:)?\/\//.test(url) && url.indexOf(location.host) === -1) {

            img.crossOrigin = "Anonymous"; 
        }
        img.onload = function() {
        tempcontext.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);
    }
     
        img.src = quirk.buildSvgImageUrl(data);
 }

  
        console.log(container.toDataURL());
        let eventChanged = new CustomEvent("OnDataChanged", {
            detail:
            {
                data: container.toDataURL()
            }
        });
        quirk.dispatchEvent(eventChanged);
  },

 buildSvgImageUrl: function(svg) {
            var b64 = window.btoa(unescape(encodeURIComponent(svg)));
            return "data:image/svg+xml;base64," + b64;
  },

  setPlus : function(){
      size++;
  },
  setMinus : function(){
      size--;
  },

  setSize : function(obj, left, top, height){
      obj.style.position = "absolute";
      obj.style.left = left +'px';
      obj.style.top =  top +'px';
      obj.style.height = height;
 },

setFullScreen: function () {
            if (
                document.fullscreenEnabled ||
                document.webkitFullscreenEnabled ||
                document.mozFullScreenEnabled ||
                document.msFullscreenEnabled
            ) {
                const area = document.documentElement;
                if (area.requestFullscreen) {
                    area.requestFullscreen();
                } else if (area.webkitRequestFullscreen) {
                    area.webkitRequestFullscreen();
                } else if (area.mozRequestFullScreen) {
                    area.mozRequestFullScreen();
                } else if (area.msRequestFullscreen) {
                    area.msRequestFullscreen();
                }
            } 

        },
createEvent: function(name, obj) {
        var event = new CustomEvent(name, obj);
            quirk.dispatchEvent(event);
        },
 applyNetworkRequest: async function(url, type, pars) {

     if (typeof type !== "string" || methods.filter(x => x == type).length == 0) {
         throw new Error("Following method was not implemented");
      }
       if ('Promise' in window) {
            let response = await new Promise(resolve => {
                const xhr = new XMLHttpRequest();
                xhr.open(type, url, true);
                xhr.onload = function (e) {
                    resolve(xhr.responseText);
                };
                xhr.onerror = function () {
                    reject(xhr.responseText);
                    console.log("An error occured during the XMLHttpRequest");
                };
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                type == 'POST' ? xhr.send(pars) : xhr.send();
            })
            return await response;//.json();
           }
        },

        applyHistoryResponse: async function (data) {
            let response = await new Promise(resolve => {
                console.log(data);
                if (data.startsWith("data:image/png;base64")) {
                    resolve(data);
                }
                else {
                    throw data;
                }
            })
            return await response;
        },

        getHistory: function (token, direction) {
            if (typeof direction !== "string" || directions.filter(x => x == direction).length == 0) {
                throw new Error("Wrong parameter");
            }
            quirk.applyNetworkRequest('/api/History?token=' + token + '&direction=' + direction, 'GET', null)
                .then(res => this.applyHistoryResponse(res.replace(/["']/g, "")))
                .then(res => this.deserialize(res))
                .then(res => this.createEvent("OnDeserialized", { detail: true }))
                .catch(res => alert(res));
        },

        unDo: function(token,index) {
            let idx = parseInt(index);
            if (idx < 2) {
                alert('No forward history');
            }
            else {
                idx = idx - 1;
                quirk.applyNetworkRequest('/api/History?token=' + token + '&index=' + idx, 'GET', null)
                    .then(res => this.deserialize(res.replace(/["']/g, "")))
                    .then(this.createEvent("OnDeserialized", { detail: idx }))
                    .catch(res => alert(res));
            }

        },
        reDo: function(token, index) {

            let idx = parseInt(index);
            idx = idx+1;
            quirk.applyNetworkRequest('/api/History?token=' + token + '&index=' + idx, 'GET', null)
                    .then(res => this.deserialize(res.replace(/["']/g, "")))
                    .then(this.createEvent("OnDeserialized", { detail: idx }))
                    .catch(res => alert(res));
            
        },
        dispatchEvent: function (event) {
            return document.dispatchEvent(event);
        },
        on: function (name, handler) {
            return document.addEventListener(name, handler);
        },
/**
 * Invoke a tint WYSIWYG editor to attach a text.
 *
 * @@public
 */

  insertText : function(){
      var editor = document.getElementById('editor');
      var toolbar = document.getElementById('editorbar');

      if (shape == null && editor == null){
          console.log(shape);

      var editor  = document.createElement("iframe");
      editor.id = "editor";
      Quirk.prototype.setSize(editor, windowX, windowY, '50px');
      var toolbar = document.createElement("div");
      toolbar.id = "editorbar";
      Quirk.prototype.setSize(toolbar, windowX, windowY - 25 , '25px');
      toolbar.innerHTML = "<table><tr><td><button class='fa fa-bold' aria-hidden='true' data-command='bold' onClick=\"javascript:quirk.execCommand('bold');\">" +
                                "</button></td>" +
                          "<td><button class='fa fa-italic' aria-hidden='true' data-command='italic' onClick=\"javascript:quirk.execCommand('italic');\">"+
                                "</button></td>" +
                          "<td><button class='fa fa-underline' aria-hidden='true' data-command='underline' onClick=\"javascript:quirk.execCommand('underline');\">" +
                                "</button></td></tr></table>";

      document.body.appendChild(editor);
      editor.style.border = '1px dotted';
      editor.style.resize = 'both';
      editor.parentNode.insertBefore(toolbar, editor);
      toolbar.setAttribute("display", "inline");
        var doc = editor.contentWindow.document;
        doc.body.innerHTML = '<div style="font-size:' + 4 + size + 'px; color:' + color + '">';
        var body = doc.body;

      if ('spellcheck' in body){
          body.spellcheck = false;
      }
      if ('contentEditable' in body){
          body.contentEditable = true;
      }
      else {
          if ('designMode' in doc){
              doc.designMode = "on";
          }
      }

       if (editor.addEventListener){
           editor.contentWindow.addEventListener("paste", Quirk.prototype.onPaste, false);
      }
  }
  else if (editor != null){
      Quirk.prototype.insertHTML(editor.contentWindow.document.body.innerHTML);
      editor.parentNode.removeChild(editor);
      toolbar.parentNode.removeChild(toolbar);
  }
},

onPaste : function(e){
    var clipboardData, pastedData;

    e.stopPropagation();
    e.preventDefault();

    clipboardData = e.clipboardData || window.clipboardData;
    pastedData = clipboardData.getData('Text');

    var data = prompt("Please enter data", "");
    document.getElementById('editor').contentWindow.document.body.innerHTML = data;
  },

  execCommand : function(command){
    document.getElementById('editor').contentWindow.document.execCommand(command, false, null);
  }
};

var type;


Quirk.Shape = function(type){
    this.type = type;
};
Quirk.Shape.prototype = {
 mousedown : function(){
     this.active = true;
     currentStroke.Points.push({ X: windowX, Y: windowY });
 },
 mousemove : function(){
     if (type && (type == ShapeType.RECTANGLE || type == ShapeType.LINE)){
         if (!this.active)
             return;
         currentStroke.Points.push({ X: windowX, Y: windowY });
     }
 },
 mouseup : function() {
      if (this.active) {
        context.closePath();
        tempcontext.drawImage(canvas, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.active = false;
        strokesHistory.Strokes.push(currentStroke);
          currentStroke = { Points: [] };
          console.log(JSON.stringify(strokesHistory));
        let eventChanged = new CustomEvent("OnDataChanged", {
            detail:
            {
                data: container.toDataURL()
            }
        });
        quirk.dispatchEvent(eventChanged);
    }
 },
};


Quirk.shapes = {};

Quirk.shapes.chalk = function(){
    Quirk.Shape.call(this, ShapeType.CHALK);
};

Quirk.shapes.line = function(){
    Quirk.Shape.call(this, ShapeType.LINE);
};

Quirk.shapes.rectangle = function(){
    Quirk.Shape.call(this, ShapeType.RECTANGLE);
};

Quirk.shapes.chalk.prototype = Object.create(Quirk.Shape.prototype);
Quirk.shapes.line.prototype = Object.create(Quirk.Shape.prototype);
Quirk.shapes.rectangle.prototype = Object.create(Quirk.Shape.prototype);

Quirk.shapes.chalk.prototype.mousedown = function(x,y){
    Quirk.Shape.prototype.mousedown.call(this);
    context.beginPath();
    context.moveTo(x, y);
};

Quirk.shapes.chalk.prototype.mousemove = function(x,y){
    Quirk.Shape.prototype.mousemove.call(this);
    if (this.active){
            context.lineTo(x, y);
	        context.stroke();
    }
};
var _x, _y;
Quirk.shapes.chalk.prototype.mouseup = function(x,y){
    Quirk.Shape.prototype.mouseup.call(this);
};
///
Quirk.shapes.line.prototype.mousedown = function(x,y){
    Quirk.Shape.prototype.mousedown.call(this);
    _x = x;
    _y = y;
};

Quirk.shapes.line.prototype.mousemove = function(x,y){
    Quirk.Shape.prototype.mousemove.call(this);
    if (this.active){
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.moveTo(_x, _y);
        context.lineTo(x,  y);
        context.stroke();
        context.closePath();
    }
};

Quirk.shapes.line.prototype.mouseup = function(x,y){
    Quirk.Shape.prototype.mouseup.call(this);
};
///
Quirk.shapes.rectangle.prototype.mousedown = function(x,y){
    Quirk.Shape.prototype.mousedown.call(this);
    _x = x;
    _y = y;
};

Quirk.shapes.rectangle.prototype.mousemove = function(x,y){
    Quirk.Shape.prototype.mousemove.call(this);
    if (this.active){
        var cords_x = Math.min(x,  _x),
            cords_y = Math.min(y,  _y),
            cords_w = Math.abs(x - _x),
            cords_h = Math.abs(y - _y);

       context.clearRect(0, 0, canvas.width, canvas.height);
       if (!cords_w || !cords_h) {
        return;
   }
    context.strokeRect(cords_x, cords_y, cords_w, cords_h);
    }
};

Quirk.shapes.rectangle.prototype.mouseup = function(x,y){
    Quirk.Shape.prototype.mouseup.call(this);
};

})();
