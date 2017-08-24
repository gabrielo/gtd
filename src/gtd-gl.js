// gtd-gl.js

var gtdVertexShader = 
'attribute vec4 a_coord;\n' +
'attribute float a_epoch;\n' +
'attribute float a_val;\n' +
'uniform mat4 u_map_matrix;\n' +
'uniform float u_span;\n' +
'uniform float u_epoch;\n' +
'varying float v_val;\n' +
'varying float v_alpha;\n' +
'void main() {\n' +
'    vec4 position;\n' +
'    if (a_epoch > u_epoch + u_span) {\n' +
'        position = vec4(-1,-1,-1,-1);\n' +
'    } else if (a_epoch < u_epoch) {\n' +
'        position = vec4(-1,-1,-1,-1);\n' +
'    } else {\n' +
'        position = u_map_matrix * a_coord;\n' +
'    }\n' + 
'    gl_Position = position;\n' +
'    float pointSize = 1.0;\n' +
'    if (a_val > 0.0) {\n' +
'        pointSize = a_val;\n' +
'    }\n' + 
'    gl_PointSize = sqrt(a_val);\n' +
'    v_alpha = (u_epoch - a_epoch) / u_span;\n' + 
'    v_val = a_val;\n' +
'}\n';

var gtdFragmentShader = 
'#extension GL_OES_standard_derivatives : enable\n' +
'precision mediump float;\n' +
'varying float v_val;\n' +
'void main() {\n' +
'    vec4 color;\n' +
'    if (v_val == 1.0) {\n' +
'      color = vec4(13.0/255., 115.0/255., 39.0/255., .85); \n' +
'    }\n' + 
'    else if (v_val == 2.0) {\n' +
'      color = vec4(244.0/255., 115.0/255., 33.0/255., .85); \n' +
'    }\n' + 
'    else if (v_val == 3.0) {\n' +
'      color = vec4(105.0/255., 42.0/255., 123.0/255., .85); \n' +
'    }\n' + 
'    else if (v_val == 4.0) {\n' +
'      color = vec4(160.0/255., 123.0/255., 105.0/255., .85); \n' +
'    }\n' + 
'    else {\n' +
'      color = vec4(245.0/255., 245.0/255., 0.0/255., .85); \n' +
'    }\n' + 
'    gl_FragColor = color;\n' +
'}\n';

var GtdGl = function GtdGl(gl) {
    this.gl = gl;
    this.program = createProgram(gl, dotMapVertexShader, dotMapFragmentShader);
    this.buffer = {
        'numAttributes': 4,
        'count': 0,
        'buffer': null,
        'ready': false
    };
    this.show0Casualties = true;

}

GtdGl.prototype.getBin = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.open('get', url, true);
    xhr.onload = function () {
      var float32Array = new Float32Array(this.response);
      callback(float32Array);
    };
    xhr.send();
}


GtdGl.prototype.setBuffer = function(data) {
    this.data = data;
    this.buffer.count = data.length / this.buffer.numAttributes;
    this.buffer.buffer = createBuffer(gl, data);   
    this.buffer.ready = true;
}

GtdGl.prototype.draw = function draw(transform, options) {
    if (this.buffer.ready && this.showDotmap) {
        var options = options || {};
        var gl = this.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
        var program = this.program;
        var buffer = this.buffer;
        gl.useProgram(program.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
        bindAttribute(gl, program.program, 'a_coord', 2, gl.FLOAT, false, this.buffer.numAttributes*4, 0);    
        bindAttribute(gl, program.program, 'a_val', 1, gl.FLOAT, false, this.buffer.numAttributes*4, 8);    
        bindAttribute(gl, program.program, 'a_val', 1, gl.FLOAT, false, this.buffer.numAttributes*4, 8);    
        gl.uniformMatrix4fv(program.u_map_matrix, false, transform);
        gl.uniform1f(program.u_point_size, pointSize);

        if (this.showDotmap) {
        gl.drawArrays(gl.POINTS, 0, buffer.count);

        }
        gl.disable(gl.BLEND);
    }
};