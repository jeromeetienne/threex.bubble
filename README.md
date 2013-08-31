threex.bubble
=============

It is a 
[threex](http://jeromeetienne.github.io/threex/) extension 
for 
[three.js](http://threejs.org)
which provide realistic bubble with [fresnel effect](http://en.wikipedia.org/wiki/Fresnel_equations).

Show Don't Tell
===============
* [examples/basic.html](http://jeromeetienne.github.io/threex.bubble/examples/basic.html)
\[[view source](https://github.com/jeromeetienne/threex.bubble/blob/master/examples/basic.html)\] :
It shows a bubble with a texture cube.

How To Install It
=================

You can install it via script tag

```html
<script src='threex.bubble.js'></script>
```

Or you can install with [bower](http://bower.io/), as you wish.

```bash
bower install threex.bubble
```

How To Use It
=============

You can create a bubble with those simple lines. You create the mesh and adds it to the scene.
The texture cube can be dynamic or static, it is up to you.

```javascript
var mesh	= new THREEx.BubbleMesh(textureCube)
scene.add(mesh)
```

You can use only the material if you want. Just create a ```THREEx.BubbleMaterial``` 
to get a material suitable for bubble. 
Internally, this is simply a ```THREE.FresnelShader``` in a ```THREE.ShaderMaterial```.

```javascript
var material	= new THREEx.BubbleMaterial(textureCube)
```