import ViewportTextureNode from './ViewportTextureNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { viewportTopLeft } from './ViewportNode.js';
import { FramebufferTexture } from 'three';

let sharedFramebuffer = null;

class ViewportSharedTextureNode extends ViewportTextureNode {

	constructor( uvNode = viewportTopLeft, levelNode = null ) {

		if ( sharedFramebuffer === null ) {

			sharedFramebuffer = new FramebufferTexture();

		}

		super( uvNode, levelNode, sharedFramebuffer );

	}

}

export default ViewportSharedTextureNode;

export const viewportSharedTexture = /* @__PURE__ */ nodeProxy( ViewportSharedTextureNode );

/* @__PURE__ */ addNodeElement( 'viewportSharedTexture', viewportSharedTexture );

/* @__PURE__ */ addNodeClass( ViewportSharedTextureNode );
