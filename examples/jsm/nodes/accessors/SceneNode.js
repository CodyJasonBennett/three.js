import Node from '../core/Node.js';
import { addNodeClass } from '../core/Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { reference } from './ReferenceNode.js';


const SceneNode /* @__PURE__ */ = ( () => {

	class SceneNode extends Node {

		constructor( scope = SceneNode.BACKGROUND_BLURRINESS, scene = null ) {

			super();

			this.scope = scope;
			this.scene = scene;

		}

		construct( builder ) {

			const scope = this.scope;
			const scene = this.scene !== null ? this.scene : builder.scene;

			let output;

			if ( scope === SceneNode.BACKGROUND_BLURRINESS ) {

				output = reference( 'backgroundBlurriness', 'float', scene );

			} else if ( scope === SceneNode.BACKGROUND_INTENSITY ) {

				output = reference( 'backgroundIntensity', 'float', scene );

			} else {

				console.error( 'THREE.SceneNode: Unknown scope:', scope );

			}

			return output;

		}

	}

	SceneNode.BACKGROUND_BLURRINESS = 'backgroundBlurriness';
	SceneNode.BACKGROUND_INTENSITY = 'backgroundIntensity';

	return SceneNode;

} )();


export default SceneNode;

export const backgroundBlurriness = /* @__PURE__ */ nodeImmutable( SceneNode, SceneNode.BACKGROUND_BLURRINESS );
export const backgroundIntensity = /* @__PURE__ */ nodeImmutable( SceneNode, SceneNode.BACKGROUND_INTENSITY );

/* @__PURE__ */ addNodeClass( SceneNode );
