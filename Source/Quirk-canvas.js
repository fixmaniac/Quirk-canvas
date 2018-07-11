var quirk;
var ShapeType = {
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
var StateType = {draw: 1, text : 2};
var color = "#cc4499";
var eraser = false;

// @ begining
//

;(function() {

var canvas;
var statusbar;
var statusbar_width = 164;
var statusbar_height = 122;
var context, tempcontext;
var container;
var shape;
var size = 4;
var width, height;
var state;
var editable; 
var windowX, windowY;
var layers = [];

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


init : function(){
       /// UI elements
       canvas = document.createElement("canvas");
       statusbar = document.createElement("span");

       /// Stylize
       canvas.setAttribute('width', container.width);
       canvas.setAttribute('height', container.height);
       canvas.setAttribute('id','tempCanvas');
       canvas.setAttribute('border','2px');

       statusbar.style.border = "2px solid #c9c9c9";
       statusbar.style.width = statusbar_width + "px";
       statusbar.style.height = statusbar_height + "px";
       statusbar.style.position = 'absolute';
       statusbar.style.left= container.width - statusbar_width - 10 + 'px';
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
       }


       quirk = this;
       this.state = StateType.draw;
       this.shape = this.setShape(ShapeType.CHALK);
       Object.defineProperty(this, 'isEditable', { get: function() 
           { return (this.state == 'undefined' || this.state != StateType.draw) ? false : true; } });
       
},

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
        x = args.layerX;
        y = args.layerY;
    }
    else if (args.offsetX || args.offsetX == 0) {
        x = args.offsetX;
        y = args.offsetY;
    }

   windowX = args.pageX;
   windowY = args.pageY;
   statusbar.innerHTML = "<center><p style='color:blue; font-weight: bold;'>x: " + windowX + ", y: " + windowY + "</p></center>";
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

/**
 *
 * @param html html text value
 */

insertHTML : function(html){
    if (html && typeof html === "string"){

    var data_arg = html.split(/\r?\n/);
     if (data_arg.length == 0) {
        throw "Empty data";
     }

    var data_on  = '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute; left:{0}px; top:{1}px">'.format(windowX, windowY) +
                    '<foreignObject width="100%" height="100%">' +
                    '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:18px">';            
    var data_off = '</div>' +
                '</foreignObject>' +
                '</svg>';

    var data = data_on;
    for (i = 0; i < data_arg.length; i++){
        data += data_arg[i];
    }
    data += data_off;
    
    var DOMURL = window.URL || window.webkitURL || window;
    var img = new Image();
    var svg = new Blob([data], {type: 'image/svg+xml'});
    var url = DOMURL.createObjectURL(svg);

    img.onload = function() {
    tempcontext.drawImage(img, 0, 0);
    DOMURL.revokeObjectURL(url);

    
    }
     img.src = url;
    }
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

  insertText : function(){
      var editor = document.getElementById('editor');
      var toolbar = document.getElementById('editorbar');
      
      if (shape == null && editor == null){
          console.log(shape);
   
      var editor  = document.createElement("iframe");
      editor.id = "editor";
      quirk.setSize(editor, windowX, windowY, '50px');
      var toolbar = document.createElement("div"); 
      toolbar.id = "editorbar";
      quirk.setSize(toolbar, windowX, windowY - 25 , '25px');
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
      var doc  = editor.contentWindow.document;
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
           editor.contentWindow.addEventListener("paste", quirk.onPaste, false);
      }
  }
  else if (editor != null){
      quirk.insertHTML(editor.contentWindow.document.body.innerHTML);
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
 },
 mousemove : function(){
     if (type && (type == ShapeType.RECTANGLE || type == ShapeType.LINE)){
         if (!this.active)
            return;
     }
 },
 mouseup : function() {
      if (this.active) {
        context.closePath();
        tempcontext.drawImage(canvas, 0, 0); 
        context.clearRect(0, 0, canvas.width, canvas.height);  
        this.active = false;
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
