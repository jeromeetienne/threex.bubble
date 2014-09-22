var THREEx	= THREEx	|| {}

THREEx.SsLensFlare	= {}

THREEx.SsLensFlare.baseUrl	= '../'
/**
 * Do a screen space pseudo lens flare based on john chapman algo.
 * For details see http://john-chapman-graphics.blogspot.fr/2013/02/pseudo-lens-flare.html
 *
 * @param  {THREE.WebGLRender}		renderer          instance of webgl renderer
 * @param  {THREE.WebGLRenderTarget}	colorRenderTarget the render target containing color rendering
 * @param  {THREE.WebGLRenderTarget*}	lensRenderTarget the render target destination, optional
 * @return {THREEx.SsLensFlare}		the instanced object
 */
THREEx.SsLensFlare.Passes	= function(renderer, colorRenderTarget, lensRenderTarget){
	var baseUrl	= THREEx.SsLensFlare.baseUrl
	var passes	= []
	this.passes	= passes

	// copy color + downsample
	var effect	= new THREE.TexturePass(colorRenderTarget)
	passes.push(effect)

	// ThresholdShader
	var effect	= new THREE.ShaderPass(THREEx.SsLensFlare.ThresholdShader)
	passes.push(effect)
	
	// FeatureGenerationShader
	var effect	= new THREE.ShaderPass(THREEx.SsLensFlare.FeatureGenerationShader)
	effect.uniforms['tLensColor' ].value	= THREE.ImageUtils.loadTexture(baseUrl+'images/lenscolor.png' )
	effect.uniforms['textureSize' ].value.set(lensRenderTarget.width, lensRenderTarget.height)
	// composer.addPass( effect )
	passes.push(effect)
	
	// add HorizontalBlur Pass
	var effect	= new THREE.ShaderPass( THREE.HorizontalBlurShader )
	effect.uniforms[ 'h' ].value	= 0.005
	passes.push(effect)

	// add VerticalBlur Pass
	var effect	= new THREE.ShaderPass( THREE.VerticalBlurShader )
	effect.uniforms[ 'v' ].value	= 0.005
	passes.push(effect)

	// add HorizontalBlur Pass
	var effect	= new THREE.ShaderPass( THREE.HorizontalBlurShader )
	effect.uniforms[ 'h' ].value	= 0.005 
	passes.push(effect)

	// add VerticalBlur Pass
	var effect	= new THREE.ShaderPass( THREE.VerticalBlurShader )
	effect.uniforms[ 'v' ].value	= 0.005
	passes.push(effect)

	this.addPassesTo	= function(composer){
		passes.forEach(function(pass){
			composer.addPass(pass)
		})
	}
}

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Specific blendPass which update the tLensStar based on camera move
 */
THREEx.SsLensFlare.BlendPass	= function(lensRenderTarget){
	var baseUrl	= THREEx.SsLensFlare.baseUrl
	var passes	= []
	this.passes	= passes

	// add blend with lensRenderTarget 
	// + a full-resolution texture of lens dirt
	// + full resolution of lens startdust
	var effect	= new THREE.ShaderPass(THREEx.SsLensFlare.BlendShader)
	effect.uniforms['tLensDirt'].value	= THREE.ImageUtils.loadTexture(baseUrl+'images/lensdirt.png')
	effect.uniforms['tLensStar'].value	= THREE.ImageUtils.loadTexture(baseUrl+'images/lensstar.png')
	effect.uniforms['tLensColor'].value	= lensRenderTarget
	passes.push(effect)


	this.update	= function(camera){
		// compute the angle based on camera rotation
		var angle	= (camera.rotation.y + camera.rotation.z)*6
		// compute each matrix
		var scaleBias1	= new THREE.Matrix4().makeTranslation(-0.5, -0.5, 0)
		var rotation	= new THREE.Matrix4().makeRotationZ(angle)
		var scaleBias2	= new THREE.Matrix4().makeTranslation(+0.5, +0.5, 0)
		// build lensStarMatrix
		var lensStarMatrix	= effect.uniforms['tLensStarMatrix'].value
		lensStarMatrix.copy(scaleBias2).multiply(rotation).multiply(scaleBias1)
	}

	this.addPassesTo	= function(composer){
		passes.forEach(function(pass){
			composer.addPass(pass)
		})
	}
}

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////


THREEx.SsLensFlare.ThresholdShader = {
	uniforms: {
		tDiffuse: { type : 't'	, value	: null },
		uScale	: { type : 'v4'	, value	: new THREE.Vector4( 10, 10, 10, 1 ) },
		uBias	: { type : 'v4'	, value	: new THREE.Vector4( -0.9, -0.9, -0.9, 0 ) },
	},
	vertexShader	: [
		'varying vec2 vUv;',
		'void main() {',
			'vUv = uv;',

			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join('\n'),
	fragmentShader: [
		'uniform sampler2D tDiffuse;',
		
		'varying vec2 vUv;',

		'uniform vec4 uScale;',
		'uniform vec4 uBias;',
		'void main() {',
			'gl_FragColor	= max(vec4(0.0), texture2D(tDiffuse, vUv) + uBias) * uScale;',
		'}'
	].join('\n')
};


//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

THREEx.SsLensFlare.FeatureGenerationShader	= {
	uniforms: {
		tDiffuse	: { type : 't'	, value	: null	},
		tLensColor	: { type : 't'	, value	: null	},
		textureSize	: {
			type	: 'v2',
			value	: new THREE.Vector2(window.innerWidth, window.innerHeight)
		},
		//uGhosts		: { type : 'i'	, value	: 8	},
		uGhostDispersal	: { type : 'f'	, value	: 0.35	},
		uHaloWidth	: { type : 'f'	, value	: 0.25	},
		uDistortion	: { type : 'f'	, value	: 4.5	},
	},
	vertexShader	: [
		'varying vec2 vUv;',
		'void main() {',
			'vUv = uv;',

			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join('\n'),
	fragmentShader: [
		'#define MAX_GHOSTS 4',
		
		'uniform sampler2D tDiffuse;',
		'uniform sampler2D tLensColor;',
		
		'varying vec2	vUv;',

		'uniform vec2	textureSize;',
		'uniform float	uGhostDispersal;',

		'uniform float	uHaloWidth;',
		'uniform float	uDistortion;',

		/*----------------------------------------------------------------------------*/
		'vec4 textureDistorted(',
		'	in sampler2D	texture,',
		'	in vec2		uv,',
		'	in vec2		direction,',	// direction of distortion
		'	in vec3		distortion ',	// per-channel distortion factor
		') {',
		'	return vec4(',
		'		texture2D(texture, uv + direction * distortion.r).r,',
		'		texture2D(texture, uv + direction * distortion.g).g,',
		'		texture2D(texture, uv + direction * distortion.b).b,',
		'		1.0',
		'	);',
		'}',

		'void main() {',

			'vec2 texcoord = -vUv + vec2(1.0);',
			
			// ghost vector to image centre
			'vec2 ghostVec = (vec2(0.5) - texcoord) * uGhostDispersal;',

			///////////////////////////////////////////////////
			//	sample ghosts:
			'for(int i = 0; i < MAX_GHOSTS; ++i){',
				// offset of the ghosts
			'	vec2 offset	= fract(texcoord + ghostVec * float(i));',

				// linear falloff at the center
			'	float weight	= length(vec2(0.5) - offset) / length(vec2(0.5));',
			'	weight		= pow(1.0 - weight, 10.0);',
				// sample tDiffuse with offset/weight
      			'	gl_FragColor	+= texture2D(tDiffuse, offset)* weight;',
			'}',

			// honor tLensColor
			'float distance2Center	= length(vec2(0.5) - vUv) / length(vec2(0.5));',	
			'vec2 uvLensColor	= vec2(distance2Center, 1.0);',
			'gl_FragColor		*= texture2D(tLensColor, uvLensColor);',
			
			///////////////////////////////////////////////////
			// sample halo:

			'vec2 texelSize = 1.0 / textureSize;',
			'vec2 haloVec	= normalize(ghostVec) * uHaloWidth;',
			'vec3 distortion= vec3(-texelSize.x * uDistortion, 0.0, texelSize.x * uDistortion);',


			'float weight	= length(vec2(0.5) - fract(texcoord + haloVec)) / length(vec2(0.5));',
			'weight		= pow(1.0 - weight, 5.0);',
			'gl_FragColor	+= textureDistorted(',
			'	tDiffuse,',
			'	fract(texcoord + haloVec),',
			'	normalize(ghostVec),',
			'	distortion',
			') * weight;',
		'}'
	].join('\n')
};

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////


THREEx.SsLensFlare.BlendShader = {
	uniforms: {
		artefactScale	: { type : 'f'	, value	: 7 },
		mixRatio	: { type : "f"  , value : 0.5 },
		opacity		: { type : "f"  , value : 2.0 },
		tDiffuse	: { type : 't'	, value	: null },
		tLensDirt	: { type : 't'	, value	: null },
		tLensColor	: { type : 't'	, value	: null },
		tLensStar	: { type : 't'	, value	: null },
		tLensStarMatrix	: { type : 'm4'	, value	: new THREE.Matrix4().identity() },
	},
	vertexShader	: [
		'varying vec2 vUv;',

		'uniform sampler2D tLensDirt; // full resolution dirt texture',
		'void main() {',
			'vUv = uv;',

			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join('\n'),
	fragmentShader: [
		'uniform sampler2D tDiffuse;',
		'uniform sampler2D tLensDirt;',
		'uniform sampler2D tLensColor;',
		'uniform sampler2D tLensStar;',
		'uniform mat4      tLensStarMatrix;',

		'varying vec2	vUv;',

		'uniform float	artefactScale;',

		"uniform float	opacity;",
		"uniform float	mixRatio;",
		
		'void main() {',
			// compute artefactColor
			'vec4 artefactColor	= texture2D(tLensDirt, vUv);',
			// take the tLensStar fragment using the rotation matrix in tLensStarMatrix
			'vec2 lensStarUv	= (tLensStarMatrix * vec4(vUv.x, vUv.y,0.0,1.0)).xy;',
			'artefactColor		+= texture2D(tLensStar, lensStarUv);',
			// honor artefactScale
			'artefactColor		*= vec4(vec3(artefactScale), 1.0);',
			// build the final fragment
			'vec4 texelLensColor	= texture2D(tLensColor, vUv) * artefactColor;',
			'vec4 texelDiffuse	= texture2D(tDiffuse, vUv);',
			'gl_FragColor		= opacity * mix(texelDiffuse, texelLensColor, mixRatio );',
		'}'
	].join('\n')
};
