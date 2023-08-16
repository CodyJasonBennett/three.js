import DFGApprox from './DFGApprox.js';
import { tslFn } from '../../shadernode/ShaderNode.js';

const EnvironmentBRDF = /* @__PURE__ */ tslFn( ( inputs ) => {

	const { dotNV, specularColor, specularF90, roughness } = inputs;

	const fab = DFGApprox( { dotNV, roughness } );
	return specularColor.mul( fab.x ).add( specularF90.mul( fab.y ) );

} );

export default EnvironmentBRDF;
