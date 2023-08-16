import TempNode from '../core/TempNode.js';
import { EPSILON } from '../math/MathNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, tslFn, nodeProxy, vec3 } from '../shadernode/ShaderNode.js';

export const BurnNode = /* @__PURE__ */ tslFn( ( { base, blend } ) => {

	const fn = ( c ) => blend[ c ].lessThan( EPSILON ).cond( blend[ c ], base[ c ].oneMinus().div( blend[ c ] ).oneMinus().max( 0 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );

export const DodgeNode = /* @__PURE__ */ tslFn( ( { base, blend } ) => {

	const fn = ( c ) => blend[ c ].equal( 1.0 ).cond( blend[ c ], base[ c ].div( blend[ c ].oneMinus() ).max( 0 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );

export const ScreenNode = /* @__PURE__ */ tslFn( ( { base, blend } ) => {

	const fn = ( c ) => base[ c ].oneMinus().mul( blend[ c ].oneMinus() ).oneMinus();

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );

export const OverlayNode = /* @__PURE__ */ tslFn( ( { base, blend } ) => {

	const fn = ( c ) => base[ c ].lessThan( 0.5 ).cond( base[ c ].mul( blend[ c ], 2.0 ), base[ c ].oneMinus().mul( blend[ c ].oneMinus() ).oneMinus() );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} );


const BlendModeNode /* @__PURE__ */ = ( () => {

	class BlendModeNode extends TempNode {

		constructor( blendMode, baseNode, blendNode ) {

			super();

			this.blendMode = blendMode;

			this.baseNode = baseNode;
			this.blendNode = blendNode;

		}

		construct() {

			const { blendMode, baseNode, blendNode } = this;
			const params = { base: baseNode, blend: blendNode };

			let outputNode = null;

			if ( blendMode === BlendModeNode.BURN ) {

				outputNode = BurnNode( params );

			} else if ( blendMode === BlendModeNode.DODGE ) {

				outputNode = DodgeNode( params );

			} else if ( blendMode === BlendModeNode.SCREEN ) {

				outputNode = ScreenNode( params );

			} else if ( blendMode === BlendModeNode.OVERLAY ) {

				outputNode = OverlayNode( params );

			}

			return outputNode;

		}

	}

	BlendModeNode.BURN = 'burn';
	BlendModeNode.DODGE = 'dodge';
	BlendModeNode.SCREEN = 'screen';
	BlendModeNode.OVERLAY = 'overlay';

	return BlendModeNode;

} )();

export default BlendModeNode;

export const burn = /* @__PURE__ */ nodeProxy( BlendModeNode, BlendModeNode.BURN );
export const dodge = /* @__PURE__ */ nodeProxy( BlendModeNode, BlendModeNode.DODGE );
export const overlay = /* @__PURE__ */ nodeProxy( BlendModeNode, BlendModeNode.OVERLAY );
export const screen = /* @__PURE__ */ nodeProxy( BlendModeNode, BlendModeNode.SCREEN );

/* @__PURE__ */ addNodeElement( 'burn', burn );
/* @__PURE__ */ addNodeElement( 'dodge', dodge );
/* @__PURE__ */ addNodeElement( 'overlay', overlay );
/* @__PURE__ */ addNodeElement( 'screen', screen );

/* @__PURE__ */ addNodeClass( BlendModeNode );
