/**
 * vendor.js framework definition
 * @type {Object}
 */
var THREEx	= THREEx || {};

THREEx.fresnelDatGui	= function(material, datGui){
	// arguments sanity check
	console.assert(material instanceof THREE.ShaderMaterial)
	var uniforms	= material.uniforms
	// arguments default values
	datGui	= datGui || new dat.GUI()
	// options
	var options  = {
		mRefractionRatio: uniforms['mRefractionRatio'].value,
		mFresnelBias	: uniforms['mFresnelBias'].value,
		mFresnelPower	: uniforms['mFresnelPower'].value,
		mFresnelScale	: uniforms['mFresnelScale'].value,
	}
	var onChange = function(){
		uniforms['mRefractionRatio'].value	= options['mRefractionRatio']
		uniforms['mFresnelBias'].value		= options['mFresnelBias']
		uniforms['mFresnelPower'].value		= options['mFresnelPower']
		uniforms['mFresnelScale'].value		= options['mFresnelScale']
	}
	onChange()
	
	// config datGui
	datGui.add( options, 'mRefractionRatio').listen().onChange( onChange )
	datGui.add( options, 'mFresnelBias').listen().onChange( onChange )
	datGui.add( options, 'mFresnelPower').listen().onChange( onChange )
	datGui.add( options, 'mFresnelScale').listen().onChange( onChange )
}