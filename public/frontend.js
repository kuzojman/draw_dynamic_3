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