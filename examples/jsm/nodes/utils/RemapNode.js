import Node, { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class RemapNode extends Node {

	constructor( node, inLowNode, inHighNode, outLowNode, outHighNode ) {

		super();

		this.node = node;
		this.inLowNode = inLowNode;
		this.inHighNode = inHighNode;
		this.outLowNode = outLowNode;
		this.outHighNode = outHighNode;

		this.doClamp = true;

	}

	construct() {

		const { node, inLowNode, inHighNode, outLowNode, outHighNode, doClamp } = this;

		let t = node.sub( inLowNode ).div( inHighNode.sub( inLowNode ) );

		if ( doClamp === true ) t = t.clamp();

		return t.mul( outHighNode.sub( outLowNode ) ).add( outLowNode );

	}

}

export default RemapNode;

export const remap = /* @__PURE__ */ nodeProxy( RemapNode, null, null, { doClamp: false } );
export const remapClamp = /* @__PURE__ */ nodeProxy( RemapNode );

/* @__PURE__ */ addNodeElement( 'remap', remap );
/* @__PURE__ */ addNodeElement( 'remapClamp', remapClamp );

/* @__PURE__ */ addNodeClass( RemapNode );
