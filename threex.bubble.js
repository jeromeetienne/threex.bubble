/**
 * declare THREEx namespace
 * @type {[type]}
 */
var THREEx	= THREEx	|| {};

THREEx.BubbleMesh	= function(textureCube){
	var material	= new THREEx.BubbleMaterial(textureCube)
	var geometry	= new THREE.SphereGeometry(0.5, 32, 16)
	var mesh	= new THREE.Mesh(geometry, material)
	return mesh;
}

/**
 * THREEx extension
 * 
 * @constructor
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

