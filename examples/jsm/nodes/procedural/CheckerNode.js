import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UVNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, tslFn, nodeProxy } from '../shadernode/ShaderNode.js';

const checkerShaderNode = /* @__PURE__ */ tslFn( ( inputs ) => {

	const uv = inputs.uv.mul( 2.0 );

	const cx = uv.x.floor();
	const cy = uv.y.floor();
	const result = cx.add( cy ).mod( 2.0 );

	return result.sign();

} );

class CheckerNode extends TempNode {

	constructor( uvNode = uv() ) {

		super( 'float' );

		this.uvNode = uvNode;

	}

	generate( builder ) {

		return checkerShaderNode( { uv: this.uvNode } ).build( builder );

	}

}

export default CheckerNode;

export const checker = /* @__PURE__ */ nodeProxy( CheckerNode );

/* @__PURE__ */ addNodeElement( 'checker', checker );

/* @__PURE__ */ addNodeClass( CheckerNode );
