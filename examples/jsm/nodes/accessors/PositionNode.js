import Node, { addNodeClass } from '../core/Node.js';
import { attribute } from '../core/AttributeNode.js';
import { varying } from '../core/VaryingNode.js';
import { normalize } from '../math/MathNode.js';
import { modelWorldMatrix, modelViewMatrix } from './ModelNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class PositionNode extends Node {

	constructor( scope = PositionNode.LOCAL ) {

		super( 'vec3' );

		this.scope = scope;

	}

	isGlobal() {

		return true;

	}

	getHash( /*builder*/ ) {

		return `position-${this.scope}`;

	}

	generate( builder ) {

		const scope = this.scope;

		let outputNode = null;

		if ( scope === PositionNode.GEOMETRY ) {

			outputNode = attribute( 'position', 'vec3' );

		} else if ( scope === PositionNode.LOCAL ) {

			outputNode = varying( positionGeometry );

		} else if ( scope === PositionNode.WORLD ) {

			const vertexPositionNode = modelWorldMatrix.mul( positionLocal );
			outputNode = varying( vertexPositionNode );

		} else if ( scope === PositionNode.VIEW ) {

			const vertexPositionNode = modelViewMatrix.mul( positionLocal );
			outputNode = varying( vertexPositionNode );

		} else if ( scope === PositionNode.VIEW_DIRECTION ) {

			const vertexPositionNode = positionView.negate();
			outputNode = normalize( varying( vertexPositionNode ) );

		} else if ( scope === PositionNode.WORLD_DIRECTION ) {

			const vertexPositionNode = positionLocal.transformDirection( modelWorldMatrix );
			outputNode = normalize( varying( vertexPositionNode ) );

		}

		return outputNode.build( builder, this.getNodeType( builder ) );

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

}

/* @__PURE__ */ ( () => {

	PositionNode.GEOMETRY = 'geometry';
	PositionNode.LOCAL = 'local';
	PositionNode.WORLD = 'world';
	PositionNode.WORLD_DIRECTION = 'worldDirection';
	PositionNode.VIEW = 'view';
	PositionNode.VIEW_DIRECTION = 'viewDirection';

} )();


export default PositionNode;

export const positionGeometry = /* @__PURE__ */ nodeImmutable( PositionNode, PositionNode.GEOMETRY );
export const positionLocal = /* @__PURE__ */ nodeImmutable( PositionNode, PositionNode.LOCAL );
export const positionWorld = /* @__PURE__ */ nodeImmutable( PositionNode, PositionNode.WORLD );
export const positionWorldDirection = /* @__PURE__ */ nodeImmutable( PositionNode, PositionNode.WORLD_DIRECTION );
export const positionView = /* @__PURE__ */ nodeImmutable( PositionNode, PositionNode.VIEW );
export const positionViewDirection = /* @__PURE__ */ nodeImmutable( PositionNode, PositionNode.VIEW_DIRECTION );

/* @__PURE__ */ addNodeClass( PositionNode );
