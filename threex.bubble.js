/**
 * declare THREEx namespace
 * @type {[type]}
 */
var THREEx	= THREEx	|| {};

/**
 * create a THREE.Mesh suitable for a bubble
 * @param {THREE.Texture} textureCube a texture cube to reflect in the bubble
 */
THREEx.BubbleMesh	= function(textureCube){
	var material	= new THREEx.BubbleMaterial(textureCube)
	var geometry	= new THREE.SphereGeometry(0.5, 32, 16)
	var mesh	= new THREE.Mesh(geometry, material)
	return mesh;
}

/**
 * create a THREE.ShaderMaterial suitable for bubble
 * @param {THREE.Texture} textureCube a texture cube to reflect in the bubble
 */
THREEx.BubbleMaterial	= function(textureCube){
	var shader	= THREE.FresnelShader;
	console.assert( shader )
	var material	= new THREE.ShaderMaterial({
		fragmentShader	: shader.fragmentShader,
		vertexShader	: shader.vertexShader,
		uniforms	: THREE.UniformsUtils.clone( shader.uniforms )
	});
	// set textureCube
	material.uniforms[ "tCube" ].value = textureCube;
	return material
}

