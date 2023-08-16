import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class PackingNode extends TempNode {

	constructor( scope, node ) {

		super();

		this.scope = scope;
		this.node = node;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	construct() {

		const { scope, node } = this;

		let result = null;

		if ( scope === PackingNode.DIRECTION_TO_COLOR ) {

			result = node.mul( 0.5 ).add( 0.5 );

		} else if ( scope === PackingNode.COLOR_TO_DIRECTION ) {

			result = node.mul( 2.0 ).sub( 1 );

		}

		return result;

	}

}

/* @__PURE__ */( () => {

	PackingNode.DIRECTION_TO_COLOR = 'directionToColor';
	PackingNode.COLOR_TO_DIRECTION = 'colorToDirection';

} )();

export default PackingNode;

export const directionToColor = /* @__PURE__ */ nodeProxy( PackingNode, PackingNode.DIRECTION_TO_COLOR );
export const colorToDirection = /* @__PURE__ */ nodeProxy( PackingNode, PackingNode.COLOR_TO_DIRECTION );

/* @__PURE__ */ addNodeElement( 'directionToColor', directionToColor );
/* @__PURE__ */ addNodeElement( 'colorToDirection', colorToDirection );

/* @__PURE__ */ addNodeClass( PackingNode );
