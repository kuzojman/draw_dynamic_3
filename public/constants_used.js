
const as = document.querySelector('.scale__value');
const socket = io();

let circle ;
let rect ;
let line ;
let stroke_line=0;

var drawing_color_fill = document.getElementById('drawing-color-fill'),
    drawing_color_border = document.getElementById('drawing-color-border'),
    drawing_figure_width = document.getElementById('drawing-figure-width'),
    drawing_figure_opacity = document.getElementById('opacity');


var drawingModeEl = document.getElementById('drawing-mode'),
      drawingOptionsEl = document.getElementById('drawing-mode-options'),
      drawingColorEl = document.getElementById('drawing-color'),
      drawingLineWidthEl = document.getElementById('drawing-line-width');