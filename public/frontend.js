const canvas = new fabric.Canvas(document.getElementById('canvasId'));
const as = document.querySelector('.scale__value');


const socket = io();

canvas.isDrawingMode = false;
//canvas.freeDrawingBrush.width = 5;
//canvas.freeDrawingBrush.color = '#00aeff';

const MAX_ZOOM_IN  = 4;
const MAX_ZOOM_OUT = 0.05;
const SCALE_STEP = 0.05;

let currentValueZoom = 1;

fabric.Canvas.prototype.toggleDragMode = function () 
{
    const STATE_IDLE = "idle";
    const STATE_PANNING = "panning";
    // Remember the previous X and Y coordinates for delta calculations
    let lastClientX;
    let lastClientY;
    // Keep track of the state
    let state = STATE_IDLE;
    // We're entering dragmode
    if (canvas.isDrawingMode) {
        // Discard any active object
        canvas.discardActiveObject();
        // Set the cursor to 'move'
        this.defaultCursor = "move";
        // Loop over all objects and disable events / selectable. We remember its value in a temp variable stored on each object
        this.forEachObject(function (object) {
            object.prevEvented = object.evented;
            object.prevSelectable = object.selectable;
            object.evented = false;
            object.selectable = false;
        });
        // Remove selection ability on the canvas
        this.selection = false;
        // // When MouseUp fires, we set the state to idle
        this.on("mouse:up", function (e) {
            state = STATE_IDLE;
        });
        // // When MouseDown fires, we set the state to panning
        this.on("mouse:down", (e) => {
            state = STATE_PANNING;
            lastClientX = e.e.clientX;
            lastClientY = e.e.clientY;
        });
        // When the mouse moves, and we're panning (mouse down), we continue
        this.on("mouse:move", (e) => {
            if (state === STATE_PANNING && e && e.e) {
                // let delta = new fabric.Point(e.e.movementX, e.e.movementY); // No Safari support for movementX and movementY
                // For cross-browser compatibility, I had to manually keep track of the delta
  
                // Calculate deltas
                let deltaX = 0;
                let deltaY = 0;
                if (lastClientX) {
                    deltaX = e.e.clientX - lastClientX;
                }
                if (lastClientY) {
                    deltaY = e.e.clientY - lastClientY;
                }
                // Update the last X and Y values
                lastClientX = e.e.clientX;
                lastClientY = e.e.clientY;
  
                let delta = new fabric.Point(deltaX, deltaY);
                this.relativePan(delta);
                // this.trigger("moved");
            }
        });
    } else {
        // When we exit dragmode, we restore the previous values on all objects
        this.forEachObject(function (object) {
            object.evented =
                object.prevEvented !== undefined ? object.prevEvented : object.evented;
            object.selectable =
                object.prevSelectable !== undefined
                    ? object.prevSelectable
                    : object.selectable;
        });
        // Reset the cursor
        this.defaultCursor = "default";
        // Remove the event listeners
        this.off("mouse:up");
        this.off("mouse:down");
        this.off("mouse:move");
        // Restore selection ability on the canvas
        this.selection = true;
    }
  };


function handleScale (delta)
{
    if (delta<0)
    {
        if(currentValueZoom<=MAX_ZOOM_OUT)
        {
            return;
        }
        else
        {
            currentValueZoom = (parseFloat(currentValueZoom)-SCALE_STEP).toFixed(2);

        }
    }
    else
    {
        if(currentValueZoom>=MAX_ZOOM_IN)
        {
            return;
        }
        else
        {
            currentValueZoom = (parseFloat(currentValueZoom)+SCALE_STEP).toFixed(2);

        }
    }
}


canvas.on('mouse:wheel',function(opt){
    const delta =opt.e.deltaY;
    handleScale(delta);
    as.textContent = (currentValueZoom * 100).toFixed(0)+'%';
    canvas.zoomToPoint({x:opt.e.offsetX, y: opt.e.offsetY},currentValueZoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
})

document.body.addEventListener('keydown',e =>
{
    if(e.code ==='Space' && !e.repeat)
    {
        e.preventDefault();
        canvas.toggleDragMode();
        canvas.isDrawingMode = false;
    }
});

document.body.addEventListener('keyup',e =>
{
    if(e.code ==='Space' && !e.repeat)
    {
        e.preventDefault();
        canvas.toggleDragMode();
        canvas.isDrawingMode = true;
    }
});






socket.on( 'connect', function()
{
  /*
  canvas.on('object:moving', e =>
  {
    console.log(e,'moves','object:moving');
  })
*/




    socket.on('mouse:move', function(e)
    {
      canvas.freeDrawingBrush._points = e.map(item => 
        {
        return new fabric.Point(item.x, item.y)
      })
      canvas._onMouseUpInDrawingMode({target: canvas.upperCanvasEl}) 

      console.log('recieved',  canvas.freeDrawingBrush._points.length)
    });
    socket.on('color:change', function(colour_taken)
    {
        console.log('recieved colour',colour_taken)
        canvas.freeDrawingBrush.color = colour_taken
    });

    socket.on('width:change', function(width_taken)
    {
        console.log('width:change',width_taken)
        canvas.freeDrawingBrush.width = width_taken
    });

let circle ;
    socket.on('circle:edit', function(circle_taken)
    {
      circle.set({
        radius: circle_taken.radius
      });
      canvas.renderAll();

        console.log('circle:edit',circle_taken)
        //'canvas.freeDrawingBrush.width = width_taken'
    });
    
    socket.on('circle:add', function(circle_taken)
    {
        console.log('circle:add',circle_taken)
        circle = new fabric.Circle(circle_taken)
        canvas.add(circle)
          
        //'canvas.freeDrawingBrush.width = width_taken'
    });



    let rect ;

    socket.on('rect:edit', function(rect_taken)
    {

      rect.set({
        top: rect_taken.top
      });
      rect.set({
        left: rect_taken.left
      });
      rect.set({
        width: rect_taken.width
      });
      rect.set({
        height: rect_taken.height
      });
      canvas.renderAll();
      console.log('rect:edit',rect_taken)
    });
    socket.on('rect:add', function(rect_taken)
    {

        rect = new fabric.Rect(rect_taken)
        canvas.add(rect)
          
        //'canvas.freeDrawingBrush.width = width_taken'
    });

    let line ;

    socket.on('line:edit', function(line_taken)
    {
      line.set({
        x1: line_taken.x1,
        y1: line_taken.y1,
        x2: line_taken.x2,
        y2: line_taken.y2
      });
      canvas.renderAll();
      console.log('line:edit',line_taken.x2, line_taken.y2,line_taken,line)

      //console.log('line:edit',line_taken.x2)
        //'canvas.freeDrawingBrush.width = width_taken'
    });
    socket.on('line:add', function(line_taken)
    {
        console.log('line:add',line_taken)

        line = new fabric.Line(line_taken, {
          strokeWidth: 5,
          fill: '#07ff11a3',
          stroke: '#07ff11a3',
          originX: 'center',
          originY: 'center',
          selectable: false
        });
        //line = new fabric.Line(line_taken)
        canvas.add(line)
        //'canvas.freeDrawingBrush.width = width_taken'
    });


    socket.on('picture:add', function(img_taken)
    {
      canvas.loadFromJSON(img_taken);
    /*  
      console.log("picture:add",img);
        var img = new fabric.Image(img_taken);       
        canvas.add(img)          
*/
    });

    socket.on('image:add', function(img_taken)
    {
      
        var img = new fabric.Image(img_taken);       
        canvas.add(img);
        console.log("image:add",img);        
        //'canvas.freeDrawingBrush.width = width_taken'
    });

    socket.on('take_data_from_json_file',function(data)
    {
      if(data)
      {
        canvas.loadFromJSON(data);
      }
    })

    canvas.on('object:modified', e =>
    {
 /*     let objects = canvas.getObjects();
      objects.forEach(function(object,index){
        console.log(object==e.target,index);
        if (object==e.target)
        {
          e.object_index = index;
        }
      });
      */
      console.log(e,'1e','object:modified');
      //socket.emit('object:modified', e)
      socket.emit('canvas_save_to_json',canvas.toJSON());
      socket.emit('object:modified', canvas.toJSON())
    });



    canvas.on('object:moving',e =>
    {
      socket.emit('canvas_save_to_json',canvas.toJSON());
      socket.emit('object:moving', canvas.toJSON());
      console.log('object:moving',e)
    });


    socket.on('object:moving', e =>
    {
        console.log('object:moving',e)
        canvas.loadFromJSON(e);
    });

    socket.on('figure_delete', e =>
    {
        console.log('figure_delete',e)
        canvas.loadFromJSON(e);
    });

    socket.on('figure_copied', e =>
    {
        console.log('figure_copied',e)
        canvas.loadFromJSON(e);
    });
    

    canvas.on('object:scaling',e =>
    {
      socket.emit('canvas_save_to_json',canvas.toJSON());
      socket.emit('object:scaling', canvas.toJSON());
      console.log('object:scaling',e)
    });


    socket.on('object:scaling', e =>
    {
        console.log('object:scaling',e)
        canvas.loadFromJSON(e);
    });

    canvas.on('object:rotating',e =>
    {
      socket.emit('canvas_save_to_json',canvas.toJSON());
      socket.emit('object:rotating', canvas.toJSON());
      console.log('object:rotating',e)
    });


    socket.on('object:rotating', e =>
    {
        console.log('object:rotating',e)
        canvas.loadFromJSON(e);
    });

    socket.on('text:add', e =>
    {
        console.log('text:add',e);
        canvas.loadFromJSON(e);
    });


    socket.on('object:modified', e =>
    {
        console.log('object:modified',e)
        canvas.loadFromJSON(e);
        /*let d = canvas.item(e.object_index);
        
        //console.log('dddd1212d',d.type);
      // console.log('object:modified',e.target,e.target.type);
        d.set(
            {
              left: e.target.left,
              top: e.target.top
            });
            */
        //canvas.renderAll();        

    });
  /*
    socket.on('circle:edit', function(circle_taken)
    {
      circle.set({
        radius: circle_taken.radius
      });
      canvas.renderAll();

        console.log('circle:edit',circle_taken)
        //'canvas.freeDrawingBrush.width = width_taken'
    });
*/

});

let stroke_line=0;

var drawing_color_fill = document.getElementById('drawing-color-fill'),
    drawing_color_border = document.getElementById('drawing-color-border'),
    drawing_figure_width = document.getElementById('drawing-figure-width'),
    drawing_figure_opacity = document.getElementById('opacity');


var drawingModeEl = document.getElementById('drawing-mode'),
      drawingOptionsEl = document.getElementById('drawing-mode-options'),
      drawingColorEl = document.getElementById('drawing-color'),
      drawingLineWidthEl = document.getElementById('drawing-line-width');
      
  drawingModeEl.onclick = function()
   {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    if (canvas.isDrawingMode) 
    {
      drawingModeEl.innerHTML = 'Cancel drawing mode';
      drawingOptionsEl.style.display = '';
    }
    else 
    {
      drawingModeEl.innerHTML = 'Enter drawing mode';
      drawingOptionsEl.style.display = 'none';
    }
  };


  //document.getElementById('drawing-mode-selector-2').addEventListener('change', function() 









  function drawcle() 
  {
    document.querySelectorAll('.config').forEach(item=>{
      item.style.display='none';
    });
    document.querySelector('.config_input_1').style.display='block';
    var circle, isDown, origX, origY;
    removeEvents();
    changeObjectSelection(false);
    canvas.on('mouse:down', function(o) 
    {
      isDown = true;
      var pointer = canvas.getPointer(o.e);
      origX = pointer.x;
      origY = pointer.y;
      circle = new fabric.Circle(
      {
        left: pointer.x,
        top: pointer.y,
        radius: 1,
        strokeWidth: drawing_figure_width.value,
        fill: hexToRgbA(drawing_color_fill.value,drawing_figure_opacity.value),
        stroke: drawing_color_border.value,
        strokeDashArray: [stroke_line, stroke_line],
        selectable: false,
        originX: 'center',
        originY: 'center'
      });
      canvas.add(circle);
      socket.emit("circle:add",circle);
    });
  
    canvas.on('mouse:move', function(o)
     {
      if (!isDown) return;
      var pointer = canvas.getPointer(o.e);
      circle.set({
        radius: Math.abs(origX - pointer.x)
      });
      socket.emit("circle:edit",circle);
      canvas.renderAll();
    });
  
    canvas.on('mouse:up', function(o)
    {
      isDown = false;
      circle.setCoords();
      socket.emit('canvas_save_to_json',canvas.toJSON());

    });
  
  }



  function drawrec() 
  {
    document.querySelectorAll('.config').forEach(item=>{
      item.style.display='none';
    });
    document.querySelector('.config_input_1').style.display='block';
    var rect, isDown, origX, origY;
    removeEvents();
    changeObjectSelection(false);
  
    canvas.on('mouse:down', function(o) 
    {
      isDown = true;
      var pointer = canvas.getPointer(o.e);
      origX = pointer.x;
      origY = pointer.y;
      var pointer = canvas.getPointer(o.e);
      rect = new fabric.Rect(
        {

        left: origX,
        top: origY,
        originX: 'left',
        originY: 'top',
        width: pointer.x - origX,
        height: pointer.y - origY,
        angle: 0,
        selectable:false,
        fill: hexToRgbA(drawing_color_fill.value,drawing_figure_opacity.value),
        stroke: drawing_color_border.value,
        strokeDashArray: [stroke_line, stroke_line],
        transparentCorners: false
      });
      canvas.add(rect);
      socket.emit("rect:add",rect);
    });
  
    canvas.on('mouse:move', function(o) 
    {
      if (!isDown) return;
      var pointer = canvas.getPointer(o.e);
  
      if (origX > pointer.x) 
      {
        rect.set({
          left: Math.abs(pointer.x)
        });
      }
      if (origY > pointer.y) 
      {
        rect.set({
          top: Math.abs(pointer.y)
        });
      }
  
      rect.set({
        width: Math.abs(origX - pointer.x)
      });
      rect.set({
        height: Math.abs(origY - pointer.y)
      });
  
      socket.emit("rect:edit",rect);
      canvas.renderAll();

    });
    
    canvas.on('mouse:up', function(o) {
      isDown = false;
      rect.setCoords();
      socket.emit('canvas_save_to_json',canvas.toJSON());
    });
  }


  
  function drawLine() 
  {
    document.querySelectorAll('.config').forEach(item=>{
      item.style.display='none';
    });
    document.querySelector('.config_input_1').style.display='block';

    let line, isDown;

    removeEvents();
    changeObjectSelection(false);
    canvas.on('mouse:down', function(o) {
      isDown = true;
      let pointer = canvas.getPointer(o.e);
      let points = [pointer.x, pointer.y, pointer.x, pointer.y];
      line = new fabric.Line(points, {
        strokeWidth: drawing_figure_width.value,
        //fill: hexToRgbA(drawing_color_fill.value,drawing_figure_opacity.value),
        stroke: hexToRgbA(drawing_color_fill.value,drawing_figure_opacity.value),
        strokeDashArray: [stroke_line, stroke_line],
        ///stroke: '#07ff11a3',
        originX: 'center',
        originY: 'center',
        selectable: false
      });
      canvas.add(line);
      socket.emit("line:add",points);
      console.log("line:add",points);
    });
    canvas.on('mouse:move', function(o) {
      if (!isDown) return;
      let pointer = canvas.getPointer(o.e);
      line.set({
        x2: pointer.x,
        y2: pointer.y
      });
      canvas.renderAll();
      socket.emit("line:edit",{x1:line.x1,y1:line.y1,x2:line.x2,y2:line.y2});
      //socket.emit("line:edit",line);
      console.log("line:edit",{x1:line.x1,y1:line.y1,x2:line.x2,y2:line.y2},line);
    });
  
    canvas.on('mouse:up', function(o) {
      isDown = false;
      line.setCoords();
      socket.emit('canvas_save_to_json',canvas.toJSON());
    });
  }
  




  function enableFreeDrawing()
  {

    document.querySelectorAll('.config').forEach(item=>{
      item.style.display='none';
    });
    document.querySelector('.config_input_3').style.display='block';
    removeEvents();
    canvas.isDrawingMode = true;
    
    drawingColorEl.onchange = function() 
    {
      canvas.freeDrawingBrush.color = drawingColorEl.value;
      //alert('!!!!!!!!!!!!aadad');
      socket.emit("color:change",drawingColorEl.value);
    };
    drawingLineWidthEl.onchange = function() 
    {
      canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
      socket.emit("width:change", canvas.freeDrawingBrush.width);
    };
    //alert(drawingColorEl.value);

    console.log('click me!!!')
    let isDrawing = false

    canvas.on('mouse:down', e => 
    {
      isDrawing = true;
      socket.emit('mouse:down', e)
    })
    canvas.on('mouse:up', e => 
    {
      isDrawing = false;
      console.log(e,'123456789');
      socket.emit('canvas_save_to_json',canvas.toJSON());
      //socket.emit('object:modified', canvas.toJSON())

    })
    canvas.on('mouse:move', function (e)
    {
      if (isDrawing) 
      {
        socket.emit('mouse:move', canvas.freeDrawingBrush._points);       
      }
    })
  }
  
  function enableSelection() 
  {
    removeEvents();
    changeObjectSelection(true);
    canvas.selection = true;
    

    canvas.on('mouse:down', e =>
    {
      let d = canvas.getActiveObject();
      //console.log('!!!!!!',d);
      //console.log('!!3412412412424124!',document.getElementById("myCanvas"),'123123123');
/*
      d.set
      (
        {
          top:200
        }
      );
*/
    });

  }
  
  function changeObjectSelection(value) {
    canvas.forEachObject(function (obj) {
      obj.selectable = value;
    });
    canvas.renderAll();
  }
  
  function removeEvents() 
  {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.off('mouse:down');
    canvas.off('mouse:up');
    canvas.off('mouse:move');
  }


  function hexToRgbA(hex,figures_opacity)
  {
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+ figures_opacity/100 + ')';
    }
    throw new Error('Bad Hex');
  }



  window.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() 
  {
    canvas.setHeight(window.innerHeight);
    canvas.setWidth(window.innerWidth);
    canvas.renderAll();
  }

  // resize on init
  resizeCanvas();

  var drawingOptionsEl = document.getElementById('drawing-mode-options-2');

  
  document.getElementById('drawing-mode-selector-2').addEventListener('change', function() 
  {
    if (this.value === '━━━') 
    {
      alert('━━━');
      stroke_line = 0;
    }
    else if (this.value === '- - - - -') 
    {
      alert('- - - - -');
      stroke_line = 20;
    }
  });



  document.getElementById("uploader").onchange = function(e) 
  {
    var reader = new FileReader();
    reader.onload = function(e) 
    {
      var image = new Image();
      image.src = e.target.result;
      image.onload = function() 
      {
        var img = new fabric.Image(image);
        img.set(
        {
          left: 100,
          top: 60
        });
        img.scaleToWidth(600);
        canvas.add(img).setActiveObject(img).renderAll();
        socket.emit('canvas_save_to_json',canvas.toJSON());
        socket.emit("picture:add",canvas.toJSON());
        console.log("picture:add",img);
      }
    }
    reader.readAsDataURL(e.target.files[0]);
  }


  

  function Copy() 
  {
    canvas.getActiveObject().clone(function(cloned) {
      _clipboard = cloned;
    });
  }



  function Delete() 
  {
    var doomedObj = canvas.getActiveObject();
    if (doomedObj.type === 'activeSelection') 
    {
        doomedObj.canvas = canvas;
        doomedObj.forEachObject(function(obj) 
        {
          canvas.remove(obj);
          socket.emit('canvas_save_to_json',canvas.toJSON());
          socket.emit("figure_delete",canvas.toJSON());
        });
    }
    else
    {

    var activeObject = canvas.getActiveObject();

      if(activeObject !== null ) 
      {
        canvas.remove(activeObject);
        socket.emit('canvas_save_to_json',canvas.toJSON());
        socket.emit("figure_delete",canvas.toJSON());
      }
    }
  }
  
  function Paste() 
  {
    // clone again, so you can do multiple copies.
    _clipboard.clone(function(clonedObj) {
      canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });
      if (clonedObj.type === 'activeSelection') 
      {
        // active selection needs a reference to the canvas.
        clonedObj.canvas = canvas;
        clonedObj.forEachObject(function(obj) 
        {
          canvas.add(obj);
          socket.emit('canvas_save_to_json',canvas.toJSON());
          socket.emit("figure_copied",canvas.toJSON());
        });
        // this should solve the unselectability
        clonedObj.setCoords();
      } else {
        canvas.add(clonedObj);
        socket.emit('canvas_save_to_json',canvas.toJSON());
        socket.emit("figure_copied",canvas.toJSON());
      }
      _clipboard.top += 10;
      _clipboard.left += 10;
      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
    });
  }

  

  document.body.addEventListener("keydown",function(e)
  {
    e = e || window.event;
    var key = e.which || e.keyCode; // keyCode detection
    var ctrl = e.ctrlKey ? e.ctrlKey : ((key === 17) ? true : false); // ctrl detection
    
    if ( key == 86 && ctrl ) 
    {
      //alert("Ctrl + V Pressed !");
      Paste();
      
    }
    else if ( key == 67 && ctrl )
    {
      //alert("Ctrl + C Pressed !");
      Copy();
    }
    else if ( key == 46 )
    {
      //alert("delete Pressed !");
      Delete();
    }
    
  },
  false);


  function print_Text()
  {
    var textbox = new fabric.Textbox('This is a Textbox object', {
      left: 20,
      top: 50,
      fill: '#880E4F',
      strokeWidth: 2,
      stroke: "#D81B60",
    });
  
    canvas.add(textbox);
    socket.emit('canvas_save_to_json',canvas.toJSON());
    socket.emit("text:add",canvas.toJSON());
  };


  const pathUsualGrid = './images/grids/usual-grid.svg';
  const pathTriangularGrid = './images/grids/triangular-grid.svg';
  
  canvas.setBackgroundColor(
      {
          source: pathUsualGrid,
          repeat: "repeat",
          scaleX: 1,
          scaleY: 1
      }, canvas.renderAll.bind(canvas)
  );
  

/*
  let activeObject = canvas.getActiveObject();
  activeObject.set('fill','rgba(50,50,25,0.51)');
  canvas.renderAll();*/

  /*
  let activeObject = canvas.getActiveObject();
  canvas._objects[7].set('fill','rgba(50,50,25,0.51)');
  canvas.renderAll();*/