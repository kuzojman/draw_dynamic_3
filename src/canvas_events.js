function edit_circle_by_mouse(o,socket)
     {
      if (!isDown) return;
      var pointer = canvas.getPointer(o.e);
      circle.set({
        radius: Math.abs(origX - pointer.x)
      });
      socket.emit("circle:edit",circle);
      canvas.renderAll();
    }

export{
    edit_circle_by_mouse
}