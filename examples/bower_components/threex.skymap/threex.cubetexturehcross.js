var THREEx	= THREEx	|| {}
THREEx.CubeTextureHCross	= {}

/**
 * Load a horizontal-cross image
 */
THREEx.CubeTextureHCross.load	= function(url, onLoad){
	var loader = new THREE.ImageLoader();
	loader.load(url, function ( image ) {
		var images	= THREEx.CubeTextureHCross.split(image)
		// build the cubemap
		var cubeMap	= new THREE.Texture( images );
		// notify the callback
		onLoad(cubeMap)
	} );
}


/**
 * Split a horizonal-cross image into 6 subimage for THREE.CubeTexture
 */
THREEx.CubeTextureHCross.split	= function(image){
	// function to extract subImages
	var getSubImage = function( x, y ){
		var subImageW	= image.width  / 4;
		var subImageH	= image.height / 3;
		// create the canvas
		var canvas	= document.createElement( 'canvas' );
		canvas.width	= subImageW;
		canvas.height	= subImageH;
		// copy the sub image to the canvas
		var context	= canvas.getContext( '2d' );
		context.drawImage( image, - x * subImageW, - y * subImageH );
		// return the canvas
		return canvas;
	};
	// split each subImage
	var subImages	= []
	subImages[ 0 ]	= getSubImage( 2, 1 ); // px
	subImages[ 1 ]	= getSubImage( 0, 1 ); // nx
	subImages[ 2 ]	= getSubImage( 1, 0 ); // py
	subImages[ 3 ]	= getSubImage( 1, 2 ); // ny
	subImages[ 4 ]	= getSubImage( 1, 1 ); // pz
	subImages[ 5 ]	= getSubImage( 3, 1 ); // nz
	// return the just-built subimage
	return subImages
}

/**
 * Build a horizonal-cross image from a THREE.CubeTexture
 */
THREEx.CubeTextureHCross.build	= function(images){
	// sanity check
	console.assert( images.length === 6 )
	// init some variables
	var subImageW	= images[0].width
	var subImageH	= images[0].height
	// create the canvas
	var canvas	= document.createElement( 'canvas' );
	canvas.width	= subImageW*4;
	canvas.height	= subImageH*3;
	// copy the sub image to the canvas
	var context	= canvas.getContext( '2d' );
	function putSubImage(subImage, x, y){
		context.drawImage(subImage, x * subImageW, y * subImageH);
	}
	// handle each subimage
	putSubImage(images[0], 2, 1)	// px
	putSubImage(images[1], 0, 1)	// nx
	putSubImage(images[2], 1, 0)	// py
	putSubImage(images[3], 1, 2)	// ny
	putSubImage(images[4], 1, 1)	// pz
	putSubImage(images[5], 3, 1)	// nz
	// return the canvas
	return canvas
}
