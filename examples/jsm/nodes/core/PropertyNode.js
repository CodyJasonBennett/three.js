import Node, { addNodeClass } from './Node.js';
import { nodeImmutable, nodeObject } from '../shadernode/ShaderNode.js';

class PropertyNode extends Node {

	constructor( nodeType, name = null ) {

		super( nodeType );

		this.name = name;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	isGlobal( /*builder*/ ) {

		return true;

	}

	generate( builder ) {

		const nodeVary = builder.getVarFromNode( this, this.getNodeType( builder ) );
		const name = this.name;

		if ( name !== null ) {

			nodeVary.name = name;

		}

		return builder.getPropertyName( nodeVary );

	}

}

export default PropertyNode;

export const property = ( type, name ) => nodeObject( new PropertyNode( type, name ) );

export const diffuseColor = /* @__PURE__ */ nodeImmutable( PropertyNode, 'vec4', 'DiffuseColor' );
export const roughness = /* @__PURE__ */ nodeImmutable( PropertyNode, 'float', 'Roughness' );
export const metalness = /* @__PURE__ */ nodeImmutable( PropertyNode, 'float', 'Metalness' );
export const clearcoat = /* @__PURE__ */ nodeImmutable( PropertyNode, 'float', 'Clearcoat' );
export const clearcoatRoughness = /* @__PURE__ */ nodeImmutable( PropertyNode, 'float', 'ClearcoatRoughness' );
export const sheen = /* @__PURE__ */ nodeImmutable( PropertyNode, 'vec3', 'Sheen' );
export const sheenRoughness = /* @__PURE__ */ nodeImmutable( PropertyNode, 'float', 'SheenRoughness' );
export const iridescence = /* @__PURE__ */ nodeImmutable( PropertyNode, 'float', 'Iridescence' );
export const iridescenceIOR = /* @__PURE__ */ nodeImmutable( PropertyNode, 'float', 'IridescenceIOR' );
export const iridescenceThickness = /* @__PURE__ */ nodeImmutable( PropertyNode, 'float', 'IridescenceThickness' );
export const specularColor = /* @__PURE__ */ nodeImmutable( PropertyNode, 'color', 'SpecularColor' );
export const shininess = /* @__PURE__ */ nodeImmutable( PropertyNode, 'float', 'Shininess' );
export const output = /* @__PURE__ */ nodeImmutable( PropertyNode, 'vec4', 'Output' );

/* @__PURE__ */ addNodeClass( PropertyNode );
