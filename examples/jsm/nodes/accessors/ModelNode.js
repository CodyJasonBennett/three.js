import Object3DNode from './Object3DNode.js';
import { addNodeClass } from '../core/Node.js';
import { label } from '../core/ContextNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class ModelNode extends Object3DNode {

	constructor( scope = ModelNode.VIEW_MATRIX ) {

		super( scope );

	}

	update( frame ) {

		this.object3d = frame.object;

		super.update( frame );

	}

}

export default ModelNode;

export const modelDirection = /* @__PURE__ */ nodeImmutable( ModelNode, ModelNode.DIRECTION );
export const modelViewMatrix = /* @__PURE__ */ label( /* @__PURE__ */ nodeImmutable( ModelNode, ModelNode.VIEW_MATRIX ), 'modelViewMatrix' );
export const modelNormalMatrix = /* @__PURE__ */ nodeImmutable( ModelNode, ModelNode.NORMAL_MATRIX );
export const modelWorldMatrix = /* @__PURE__ */ nodeImmutable( ModelNode, ModelNode.WORLD_MATRIX );
export const modelPosition = /* @__PURE__ */ nodeImmutable( ModelNode, ModelNode.POSITION );
export const modelScale = /* @__PURE__ */ nodeImmutable( ModelNode, ModelNode.SCALE );
export const modelViewPosition = /* @__PURE__ */ nodeImmutable( ModelNode, ModelNode.VIEW_POSITION );

/* @__PURE__ */ addNodeClass( ModelNode );
