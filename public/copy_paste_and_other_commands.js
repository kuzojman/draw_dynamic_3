

  let mouse_coords;

  function Copy() 
  {
    canvas.getActiveObject().clone(function(cloned) {
      _clipboard = cloned;
    });
    canvas.on('mouse:move', function (e) {
      getMouse(e);
  });

  }

  function getMouse(e) 
  {
    mouse_coords =  {
      x: e.e.clientX, 
      y: e.e.clientY
    } 
    //console.log(e.e.clientX,e.e.clientY);
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
        left: mouse_coords.x,//clonedObj.left + 10,
        top:  mouse_coords.y,//clonedObj.top + 10,
        evented: true,
      });
      //canvas.off('mouse:move');
    

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

/*
var state = [];
var mods = 0;

canvas.on(
  'object:modified', function () 
  {
  updateModifications(true);
},
  'object:added', function () {
  updateModifications(true);
});

function updateModifications(savehistory) 
{
  if (savehistory === true) 
  {
      let myjson = JSON.stringify(canvas);
      state.push(myjson);
  }
}

  function undo() 
  {
    if (mods < state.length) 
    {
        //canvas.clear().renderAll();
        let index = state.length - 1 - mods - 1;
        if(index<0)
        {
          index = 0;
        }
        canvas.loadFromJSON(state[index]);
        //canvas.renderAll();
        console.log(state,state.length - 1 - mods - 1)
        mods += 1;

    }
  }
*/

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

  document.addEventListener('keyup', ({ keyCode, ctrlKey } = event) => {
    // Check Ctrl key is pressed.
    if (!ctrlKey) {
      return
    }

    // Check pressed button is Z - Ctrl+Z.
    if (keyCode === 90) {
      canvas.undo()
    }

    // Check pressed button is Y - Ctrl+Y.
    if (keyCode === 89) {
      canvas.redo()
    }
  })