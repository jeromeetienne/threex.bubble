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
	var shader	= THREEx.BubbleMaterial.FresnelShader;
	// var shader	= THREE.FresnelShader;
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

/**
 * Last modified by @author Mr&Mrs(2014)
 * Based  on work by alteredq / http://alteredqualia.com/
 * and derivative of Nvidia Cg tutorial
 */
THREEx.BubbleMaterial.FresnelShader  = {

	uniforms: {
		mRefractionRatio	: { type: "f", value: 0.988 },
		mFresnelBias		: { type: "f", value: 0.9   },
		mFresnelPower		: { type: "f", value: 2.0   },
		mFresnelScale		: { type: "f", value: 1.0   },
		tCube			: { type: "t", value: null  }
	},

	vertexShader: [

		"uniform float mRefractionRatio;",
		"uniform float mFresnelBias;",
		"uniform float mFresnelScale;",
		"uniform float mFresnelPower;",

		"varying vec3  vReflect;",
		"varying vec3  vRefract[3];",
		"varying float vReflectionFactor;",
			
		"void main() {",

			"vec4 mvPosition	= modelViewMatrix * vec4( position, 1.0 );",
			"vec4 worldPosition	= modelMatrix*1.3 * vec4( position, 1.0 );",

			"vec3 worldNormal	= normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",

			"vec3 I		= worldPosition.xyz - cameraPosition;",

			"vReflect	= reflect( I, worldNormal );",
			"vRefract[0]	= refract( normalize( I ), worldNormal, mRefractionRatio * 0.986 );",
			"vRefract[1]	= refract( normalize( I ), worldNormal, mRefractionRatio * 0.987 );",
			"vRefract[2]	= refract( normalize( I ), worldNormal, mRefractionRatio * 0.988 );",
			"vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower);",
			
			"gl_Position	= projectionMatrix * mvPosition;",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform samplerCube tCube;",

		"varying vec3 vReflect;",
		"varying vec3 vRefract[3];",
		"varying float vReflectionFactor;",

		"void main() {",

			"vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, -vReflect.yz ) );",
			"vec4 refractedColor = vec4( 0.97 );",

			"refractedColor.r = textureCube( tCube, vec3( vRefract[0].x, vRefract[0].yz ) ).r;",
			"refractedColor.g = textureCube( tCube, vec3( vRefract[1].x, vRefract[1].yz ) ).g;",
			"refractedColor.b = textureCube( tCube, vec3( vRefract[2].x, vRefract[2].yz ) ).b;",

			//"gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.5, 0.1 ) );",
			"gl_FragColor = mix( refractedColor*0.94, reflectedColor, clamp( vReflectionFactor, 0.5, 0.15 ) );",

		"}"

	].join("\n")

};
