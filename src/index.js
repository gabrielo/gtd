var gtdGl;
var map;
var gl;
var canvasLayer;
var mapMatrix = new Float32Array(16);
var pixelsToWebGLMatrix = new Float32Array(16);
var gui;
var timeSlider;

var mapOptions = {
  zoom: 2,
  center: new google.maps.LatLng(0.0, 0.0),
  styles: mapStyles
};

var canvasLayerOptions = {
  resizeHandler: resize,
  animate: true,
  updateHandler: update
};

function resize() {
  var w = gl.canvas.width;
  var h = gl.canvas.height;
  gl.viewport(0, 0, w, h);
  pixelsToWebGLMatrix.set([2/w, 0,   0, 0,
    0,  -2/h, 0, 0,
    0,   0,   0, 0,
    -1,   1,   0, 1]);
}

function update() {
  var mapProjection = map.getProjection();
  mapMatrix.set(pixelsToWebGLMatrix);
  var scale = canvasLayer.getMapScale();
  scaleMatrix(mapMatrix, scale, scale);
  var translation = canvasLayer.getMapTranslation();
  translateMatrix(mapMatrix, translation.x, translation.y);  

  var currentEpoch = timeSlider.getCurrentTime()/1000.0;
  gtdGl.draw(mapMatrix, {currentEpoch: currentEpoch});
  timeSlider.animate();
}

function initTimeSlider(opts) {
  var startTime = new Date("1970-01-01").getTime();
  var endTime = new Date("2016-12-31").getTime();
  if (opts.startTime) {
    startTime = opts.startTime;
  }
  if (opts.endTime) {
    endTime = opts.endTime;
  }
  var timeSlider = new TimeSlider({
    startTime: startTime,
    endTime: endTime,
    dwellAnimationTime: 2 * 1000,
    increment: 30*24*60*60*1000,
    //span: 21*60*60*30*1000,
    formatCurrentTime: function(date) {
      return date.getFullYear();
    },
    animationRate: {
      fast: 10,
      medium: 30,
      slow: 60
    }
  });  
  return timeSlider;
}

function init() {
  var mapDiv = document.getElementById('map-div');
  var dataUrl = '../data/gtd.bin';

  map = new google.maps.Map(mapDiv, mapOptions);
  canvasLayerOptions.map = map;
  canvasLayer = new CanvasLayer(canvasLayerOptions);

  timeSlider = initTimeSlider();

  gl = canvasLayer.canvas.getContext('experimental-webgl');
  gl.getExtension("OES_standard_derivatives");

  gtdGl = new GtdGl(gl);
  gtdGl.getBin(dataUrl, function(data) {
    gtdGl.setBuffer(data);
  })


  gui = new dat.GUI();
  gui.add(gtdGl, 'show0Casualties');

}

document.addEventListener('DOMContentLoaded', init, false);
