const canvas = new fabric.Canvas(document.getElementById('canvasId'));
const socket = io();

canvas.isDrawingMode = true;
canvas.freeDrawingBrush.width = 5;
canvas.freeDrawingBrush.color = '#00aeff';




socket.on( 'connect', function()
{
    let isDrawing = false

    canvas.on('mouse:down', e => {
      isDrawing = true;
      socket.emit('mouse:down', e)
    })
    canvas.on('mouse:up', e => {
      isDrawing = false;
    })
    canvas.on('mouse:move', function (e)
    {
      if (isDrawing) 
      {
        socket.emit('mouse:move', canvas.freeDrawingBrush._points);       
      }
    })

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


});


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

  drawingColorEl.onchange = function() 
  {
    canvas.freeDrawingBrush.color = drawingColorEl.value;
    socket.emit("color:change",drawingColorEl.value);
  };
  drawingLineWidthEl.onchange = function() 
  {
    canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
    socket.emit("width:change", canvas.freeDrawingBrush.width);
  };






  function drawcle() 
  {
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
        strokeWidth: 1,
        fill: '#07ff11a3',
        stroke: 'black',
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
    });
  
  }

  function enableFreeDrawing(){
    removeEvents();
    canvas.isDrawingMode = true;
  }
  
  function enableSelection() {
    removeEvents();
    changeObjectSelection(true);
    canvas.selection = true;
  }
  
  function changeObjectSelection(value) {
    canvas.forEachObject(function (obj) {
      obj.selectable = value;
    });
    canvas.renderAll();
  }
  
  function removeEvents() {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.off('mouse:down');
    canvas.off('mouse:up');
    canvas.off('mouse:move');
  }