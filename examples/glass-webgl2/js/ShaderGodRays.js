/**
 * Modified by @author Mr&Mrs(2014) http://www.webgl.no
 * work based on @author huwb / http://huwbowles.com/
 * God-rays (crepuscular rays)
 *
 * Similar implementation to the one used by Crytek for CryEngine 2 [Sousa2008].
 * Blurs a mask generated from the depth map along radial lines emanating from the light
 * source. The blur repeatedly applies a blur filter of increasing support but constant
 * sample count to produce a blur filter with large support.
 *
 * My implementation performs 3 passes, similar to the implementation from Sousa. I found
 * just 6 samples per pass produced acceptible results. The blur is applied three times,
 * with decreasing filter support. The result is equivalent to a single pass with
 * 6*6*6 = 216 samples.
 *
 * References:
 *
 * Sousa2008 - Crysis Next Gen Effects, GDC2008, http://www.crytek.com/sites/default/files/GDC08_SousaT_CrysisEffects.ppt
 */

THREE.ShaderGodRays = {

	'godrays_generate': {

		uniforms: {

			tInput: {
				type: "t",
				value: null
			},

			fStepSize: {
				type: "f",
				value: 2.0
			},

			vSunPositionScreenSpace: {
				type: "v2",
				value: new THREE.Vector2( 0.5, 0.5 )
			}

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"#define TAPS_PER_PASS 6.0",  //6

			"varying vec2 vUv;",

			"uniform sampler2D tInput;",

			"uniform vec2 vSunPositionScreenSpace;",
			"uniform float fStepSize;", // filter step size

			"void main() {",

				// delta from current pixel to "sun" position

				"vec2 delta = vSunPositionScreenSpace - vUv;",
				"float dist = length( delta )*5.0;",

				// Step vector (uv space)

				"vec2 stepv = (fStepSize * delta) / dist;",

				// Number of iterations between pixel and sun

				"float iters = dist/fStepSize;",

				"vec2 uv = vUv.xy;",
				"float col = 0.0;",

		/*		"for ( float i = 0.0; i < TAPS_PER_PASS; i += 1.0 ) {",  // i=1.0

					"col += ( i <= iters && uv.y < 1.0 ? texture2D( tInput, uv ).r : 0.001 );",
					"uv += stepv;",

				"}",*/
				

				// Unrolling loop manually makes it work in ANGLE

				"if ( 0.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
				"uv += stepv;",

				"if ( 1.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
				"uv += stepv;",

				"if ( 2.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
				"uv += stepv;",

				"if ( 3.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
				"uv += stepv;",

				"if ( 4.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
				"uv += stepv;",

				"if ( 5.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
				"uv += stepv;",

				"gl_FragColor = vec4( col/TAPS_PER_PASS );",
				"gl_FragColor.a = 1.0;",

			"}"

		].join("\n")

	},


	'godrays_combine': {

		uniforms: {

			tColors: {
				type: "t",
				value: null
			},

			tGodRays: {
				type: "t",
				value: null
			},

			fGodRayIntensity: {
				type: "f",
				value: 0.69
			},

			vSunPositionScreenSpace: {
				type: "v2",
				value: new THREE.Vector2( 0.5, 0.5 )
			}

		},

		vertexShader: [

			"varying vec2 vUv;",
			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

			].join("\n"),

		fragmentShader: [

			"varying vec2 vUv;",

			"uniform sampler2D tColors;",
			"uniform sampler2D tGodRays;",

			"uniform vec2 vSunPositionScreenSpace;",
			"uniform float fGodRayIntensity;",

			"void main() {",
			//	"gl_FragColor = texture2D( tColors, vUv ) + fGodRayIntensity * vec4( 1.0 + texture2D( tGodRays, vUv ).r );",
				"if( fGodRayIntensity  >= 0.0) ",
				"gl_FragColor = texture2D( tColors, vUv ) + fGodRayIntensity * vec4( 0.0 + texture2D( tGodRays, vUv ).r *0.79)*vec4( 0.5 + texture2D( tGodRays, vUv ).r /0.79);",
				"else gl_FragColor = texture2D( tColors, vUv )+fGodRayIntensity; ",

				"gl_FragColor.a = 1.0;",

			"}"

		].join("\n")

	},

	'godrays_fake_sun': {

		uniforms: {

			vSunPositionScreenSpace: {
				type: "v2",
				value: new THREE.Vector2( 0.5, 0.5 )
			},

			fAspect: {
				type: "f",
				value: 1.0
			},

			sunColor: {
				type: "c",
				value: new THREE.Color( 0xffee00 )
			},

			bgColor: {
				type: "c",
				value: new THREE.Color( 0x000000 )
			}

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"varying vec2 vUv;",

			"uniform vec2 vSunPositionScreenSpace;",
			"uniform float fAspect;",

			"uniform vec3 sunColor;",
			"uniform vec3 bgColor;",

			"void main() {",

				"vec2 diff = vUv - vSunPositionScreenSpace;",

				// Correct for aspect ratio

				"diff.x *= fAspect;",

				"float prop = clamp( length( diff ) / 0.5, 0.0, 1.0 );",
				"prop = 0.35 * pow( 1.0 - prop, 3.0 );",

				"gl_FragColor.xyz = mix( sunColor, bgColor, 1.0 - prop );",
				"gl_FragColor.w = 1.0;",

			"}"

		].join("\n")

	}

};
