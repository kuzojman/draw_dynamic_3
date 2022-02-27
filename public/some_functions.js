const canvas = new fabric.Canvas(document.getElementById('canvasId'));
//window.canvas = new fabric.Canvas(document.getElementById('canvasId'));
//window.canvas = canvas;

function handle_mouse_move(e)
{
  canvas.freeDrawingBrush._points = e.map(item => 
    {
    return new fabric.Point(item.x, item.y)
  })
  canvas._onMouseUpInDrawingMode({target: canvas.upperCanvasEl}) 

  console.log('recieved',  canvas.freeDrawingBrush._points.length)
}

function change_colour_of_brush(colour_taken)
{
  console.log('recieved colour',colour_taken);
  canvas.freeDrawingBrush.color = colour_taken;
}

function handle_editing_rectangle(rect_taken)
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
    }

    function editing_passing_rectangle (rect_taken)
    {

        rect = new fabric.Rect(rect_taken)
        canvas.add(rect)
        //'canvas.freeDrawingBrush.width = width_taken'
    }


    function adding_line_to_partner_board( line_taken)
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
    }

    function editing_added_line_to_board(line_taken)
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
    }

    function width_of_line_passed_taken (width_taken)
    {
        console.log('width:change',width_taken)
        canvas.freeDrawingBrush.width = width_taken
    }

    function circle_passed_to_board(circle_taken)
    {
      circle.set({
        radius: circle_taken.radius
      });
      canvas.renderAll();

        console.log('circle:edit',circle_taken)
        //'canvas.freeDrawingBrush.width = width_taken'
    }

    function adding_circle_on_the_board(circle_taken)
    {
        console.log('circle:add',circle_taken)
        circle = new fabric.Circle(circle_taken)
        canvas.add(circle)
          
        //'canvas.freeDrawingBrush.width = width_taken'
    }

    function adding_image_to_canvas(img_taken)
    {
        var img = new fabric.Image(img_taken);       
        canvas.add(img);
        console.log("image:add",img);        
    }

    function saving_data_to_json_send_io(e)
    {
      socket.emit('canvas_save_to_json',canvas.toJSON());
      send_part_of_data(e);
      //socket.emit('object:modified', canvas.toJSON())
    }
    
    function reciveing_part_of_data_to_socket_io(e)
    {
        recive_part_of_data(e);
    }

    function Loading_json_data_to_board(e)
    {
        canvas.loadFromJSON(e);
    }
    function sending_to_test(e)
    {
      socket.emit('canvas_save_to_json',canvas.toJSON());
      send_part_of_data(e);
    }
 
