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
      if (isDrawing) {
        socket.emit('mouse:move', canvas.freeDrawingBrush._points);
        
      }
    })

    socket.on('mouse:move', function(e)
    {
      canvas.freeDrawingBrush._points = e.map(item => {
        return new fabric.Point(item.x, item.y)
      })
      canvas._onMouseUpInDrawingMode({target: canvas.upperCanvasEl}) 

      console.log('recieved',  canvas.freeDrawingBrush._points.length)
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
  };
  drawingLineWidthEl.onchange = function() 
  {
    canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
  };

