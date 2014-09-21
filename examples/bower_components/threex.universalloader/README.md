threex.universalloader
=============

threex.universalloader is a 
[threex game extension for three.js](http://www.threejsgames.com/extensions/).
It provides an universal loader for models in three.js. You give it the url
of your models and it will load it with the three.js loader suitable for its format.

Show Don't Tell
===============
* [examples/basic.html](http://jeromeetienne.github.io/threex.universalloader/examples/basic.html)
\[[view source](https://github.com/jeromeetienne/threex.universalloader/blob/master/examples/basic.html)\] :
It shows a basic usage of threex.universalloader.

A Screenshot
============
[![screenshot](https://raw.githubusercontent.com/jeromeetienne/threex.universalloader/master/examples/images/screenshot-threex-universalloader-512x512.jpg)](http://jeromeetienne.github.io/threex.universalloader/examples/basic.html)

How To Install It
=================

You can install it via script tag

```html
<script src='threex.universalloader.js'></script>
```

Or you can install with [bower](http://bower.io/), as you wish.

```bash
bower install threex.universalloader
```

How To Use It
=============

Here is a basic usage. First you create the loader itself

```javascript
var loader  = new THREEx.UniversalLoader()
```

Then you trigger the loading of your model. Say you want to load a 
model at ```models/monster.dae```

```javascript
var url = 'models/monster.dae'
loader.load(url, function(object3d){
    // this function will be notified when the model is loaded
    scene.add(object3d)
})
```

There is a special case for the OBJ/MTL models as they need 2 urls, one for
the 
[OBJ](http://en.wikipedia.org/wiki/Wavefront_.obj_file), one for the 
[MTL](http://en.wikipedia.org/wiki/Wavefront_.obj_file#Material_template_library). In this case, just provides both
urls in a array like this.

```javascript
var urls = ['models/monster.obj', 'models/monster.mtl']
loader.load(url, function(object3d){
    // this function will be notified when the model is loaded
    scene.add(object3d)
})
```