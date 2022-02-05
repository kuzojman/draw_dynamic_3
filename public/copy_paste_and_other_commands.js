  

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