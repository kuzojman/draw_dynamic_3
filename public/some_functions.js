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
 

    function find_object_index(target_object)
    {
      let target_index ;
      let objects = canvas.getObjects();
      objects.forEach(function(object,index){
        
        if (object==target_object)
        {
          target_index = index;
        }
      });
      return target_index;
    }
    
    function send_part_of_data(e)
    {
      if (e.target._objects)
      {
        let data = {objects:[]};
          let json_canvas = canvas.toJSON();
    
    
    
         e.transform.target._objects.forEach(object =>
          {
            
           let object_index = find_object_index(object);
           object.object_index = object_index;
           data.objects.push({object:object, 
                                index:object_index,
                                top_all:json_canvas.objects[object_index].top,
                                left_all:json_canvas.objects[object_index].left,
                                angle:json_canvas.objects[object_index].angle,
                                scaleX:json_canvas.objects[object_index].scaleX,
                                scaleY:json_canvas.objects[object_index].scaleY});
         });
    
         socket.emit('object:modified', data);
         console.log('data send',data);
         //console.log('e send',e);
      }
      else
      {
       let object_index = find_object_index(e.target);
    
       e.target.object_index = object_index;
       
       socket.emit('object:modified', 
       {
         object: e.target,
         index:object_index
       });
      }
    }
    
    function recive_part_of_data(e)
    {
      console.log('get something',e);
      if (e.objects) 
      {
        for (const object of e.objects) 
        {
          let d = canvas.item(object.index);
          
          //console.log('!!!!!!!', object.index,object,object.object.top,object.top_all,object.object.top+object.top_all);
          
         // d.set(object.object);
          d.set({
            top: object.top_all,//+object.object.top,
            left: object.left_all,//+object.object.left
            angle: object.angle,
            scaleX: object.scaleX,
            scaleY: object.scaleY
          }
          );
        }
      } 
      else 
      {
        let d = canvas.item(e.index);
        d.set(e.object);
      }
    
      canvas.renderAll(); 
      //return d;       
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
  