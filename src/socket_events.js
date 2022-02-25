function handle_mouse_move(e)
{
  canvas.freeDrawingBrush._points = e.map(item => 
    {
    return new fabric.Point(item.x, item.y)
  })
  canvas._onMouseUpInDrawingMode({target: canvas.upperCanvasEl}) 

  console.log('recieved',  canvas.freeDrawingBrush._points.length)
}
export{
  handle_mouse_move
}