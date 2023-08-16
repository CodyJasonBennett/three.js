import Object3DNode from './Object3DNode.js';
import { addNodeClass } from '../core/Node.js';
import { label } from '../core/ContextNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';


const CameraNode = /* @__PURE__ */ ( () => {

	class CameraNode extends Object3DNode {

		constructor( scope = CameraNode.POSITION ) {

			super( scope );

		}

		getNodeType( builder ) {

			const scope = this.scope;

			if ( scope === CameraNode.PROJECTION_MATRIX ) {

				return 'mat4';

			} else if ( scope === CameraNode.NEAR || scope === CameraNode.FAR ) {

				return 'float';

			}

			return super.getNodeType( builder );

		}

		update( frame ) {

			const camera = frame.camera;
			const uniformNode = this._uniformNode;
			const scope = this.scope;

			if ( scope === CameraNode.VIEW_MATRIX ) {

				uniformNode.value = camera.matrixWorldInverse;

			} else if ( scope === CameraNode.PROJECTION_MATRIX ) {

				uniformNode.value = camera.projectionMatrix;

			} else if ( scope === CameraNode.NEAR ) {

				uniformNode.value = camera.near;

			} else if ( scope === CameraNode.FAR ) {

				uniformNode.value = camera.far;

			} else {

				this.object3d = camera;

				super.update( frame );

			}

		}

		generate( builder ) {

			const scope = this.scope;

			if ( scope === CameraNode.PROJECTION_MATRIX ) {

				this._uniformNode.nodeType = 'mat4';

			} else if ( scope === CameraNode.NEAR || scope === CameraNode.FAR ) {

				this._uniformNode.nodeType = 'float';

			}

			return super.generate( builder );

		}

	}

	CameraNode.PROJECTION_MATRIX = 'projectionMatrix';
	CameraNode.NEAR = 'near';
	CameraNode.FAR = 'far';

	return CameraNode;

} )();


export default CameraNode;

export const cameraProjectionMatrix = /* @__PURE__ */ label( /* @__PURE__ */ nodeImmutable( CameraNode, CameraNode.PROJECTION_MATRIX ), 'projectionMatrix' );
export const cameraNear = /* @__PURE__ */ nodeImmutable( CameraNode, CameraNode.NEAR );
export const cameraFar = /* @__PURE__ */ nodeImmutable( CameraNode, CameraNode.FAR );
export const cameraViewMatrix = /* @__PURE__ */ nodeImmutable( CameraNode, CameraNode.VIEW_MATRIX );
export const cameraNormalMatrix = /* @__PURE__ */ nodeImmutable( CameraNode, CameraNode.NORMAL_MATRIX );
export const cameraWorldMatrix = /* @__PURE__ */ nodeImmutable( CameraNode, CameraNode.WORLD_MATRIX );
export const cameraPosition = /* @__PURE__ */ nodeImmutable( CameraNode, CameraNode.POSITION );

/* @__PURE__ */ addNodeClass( CameraNode );
