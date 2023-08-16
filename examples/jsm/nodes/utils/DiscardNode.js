import CondNode from '../math/CondNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

let discardExpression;

class DiscardNode extends CondNode {

	constructor( condNode ) {

		discardExpression = discardExpression || expression( 'discard' );

		super( condNode, discardExpression );

	}

}

export default DiscardNode;

export const discard = /* @__PURE__ */ nodeProxy( DiscardNode );

/* @__PURE__ */ addNodeElement( 'discard', discard );

/* @__PURE__ */ addNodeClass( DiscardNode );
