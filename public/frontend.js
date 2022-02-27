//import { canvas } from "./some_functions.js"
//const canvas = new fabric.Canvas(document.getElementById('canvasId'));
//canvas = windows.canvas;


const as = document.querySelector('.scale__value');


const socket = io();

canvas.isDrawingMode = false;
//canvas.freeDrawingBrush.width = 5;
//canvas.freeDrawingBrush.color = '#00aeff';




socket.on( 'connect', function()
{
  let circle ;
  let rect ;
  let line ;

    socket.on('mouse:move', handle_mouse_move);      
    socket.on('color:change', change_colour_of_brush);
    socket.on('width:change', width_of_line_passed_taken);
    socket.on('circle:edit', circle_passed_to_board);   
    socket.on('circle:add', adding_circle_on_the_board);
    socket.on('rect:edit', handle_editing_rectangle);   
    socket.on('rect:add', editing_passing_rectangle);
    socket.on('line:edit', editing_added_line_to_board);
    socket.on('line:add', adding_line_to_partner_board);
    socket.on('image:add', adding_image_to_canvas);
    socket.on('object:moving', reciveing_part_of_data_to_socket_io);
    socket.on('figure_copied', reciveing_part_of_data_to_socket_io);
    socket.on('object:scaling', reciveing_part_of_data_to_socket_io);
    socket.on('text:add', Loading_json_data_to_board);
    socket.on('figure_delete', Loading_json_data_to_board);
    socket.on('object:rotating', reciveing_part_of_data_to_socket_io);
    socket.on('picture:add', Loading_json_data_to_board);
    socket.on('object:modified', reciveing_part_of_data_to_socket_io);

    canvas.on('object:modified', saving_data_to_json_send_io);
    canvas.on('object:moving'  , saving_data_to_json_send_io);
    canvas.on('object:scaling' , sending_to_test);
    canvas.on('object:rotating', sending_to_test);

    socket.on('take_data_from_json_file',function(data)
    {
      if(data)
      {
        canvas.loadFromJSON(data);
      }
    })



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
    let isDrawing = false

    canvas.on('mouse:down', e => 
    {
      isDrawing = true;
      socket.emit('mouse:down', e)
    })
    canvas.on('mouse:up', e => 
    {
      isDrawing = false;
      socket.emit('canvas_save_to_json',canvas.toJSON());

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
  

/*
socket.on('object:modified', e =>
{
    console.log('object:modified',e)
    if (e.objects) 
    {
      for (const object of e.objects) 
      {
        let d = canvas.item(object.index);
        d.set(object.object);
        //canvas._objects[object.object_index]=object;
        
      }
    } 
    else 
    {
      let d = canvas.item(e.index);
      d.set(e.object);
      /*d.set(
        {
          left: e.object.left,
          top: e.object.top
        });*/
      //canvas._objects[e.target.object_index]=e.target;
   // }

    //canvas.loadFromJSON(e);
    /*let d = canvas.item(e.object_index);
    
    //console.log('dddd1212d',d.type);
  // console.log('object:modified',e.target,e.target.type);
    d.set(
        {
          left: e.target.left,
          top: e.target.top
        });
        */
 //   canvas.renderAll();        

//});

   /*     
      */

/*
  let activeObject = canvas.getActiveObject();
  activeObject.set('fill','rgba(50,50,25,0.51)');
  canvas.renderAll();*/

  /*
  let activeObject = canvas.getActiveObject();
  canvas._objects[7].set('fill','rgba(50,50,25,0.51)');
  canvas.renderAll();*/