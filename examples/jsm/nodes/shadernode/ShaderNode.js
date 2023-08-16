import Node, { addNodeClass } from '../core/Node.js';
import ArrayElementNode from '../utils/ArrayElementNode.js';
import ConvertNode from '../utils/ConvertNode.js';
import JoinNode from '../utils/JoinNode.js';
import SplitNode from '../utils/SplitNode.js';
import ConstNode from '../core/ConstNode.js';
import { getValueFromType, getValueType } from '../core/NodeUtils.js';

const NodeElements = /* @__PURE__ */ new Map(); // @TODO: Currently only a few nodes are added, probably also add others

export function addNodeElement( name, nodeElement ) {

	if ( NodeElements.has( name ) ) throw new Error( `Redefinition of node element ${ name }` );
	if ( typeof nodeElement !== 'function' ) throw new Error( `Node element ${ name } is not a function` );

	NodeElements.set( name, nodeElement );

}

const shaderNodeHandler = {

	construct( NodeClosure, params ) {

		const inputs = params.shift();

		return NodeClosure( nodeObjects( inputs ), ...params );

	},

	get: function ( node, prop, nodeObj ) {

		if ( typeof prop === 'string' && node[ prop ] === undefined ) {

			if ( NodeElements.has( prop ) ) {

				const nodeElement = NodeElements.get( prop );

				return ( ...params ) => nodeElement( nodeObj, ...params );

			} else if ( prop.endsWith( 'Assign' ) && NodeElements.has( prop.slice( 0, prop.length - 'Assign'.length ) ) ) {

				const nodeElement = NodeElements.get( prop.slice( 0, prop.length - 'Assign'.length ) );

				return ( ...params ) => nodeObj.assign( nodeElement( nodeObj, ...params ) );

			} else if ( /^[xyzwrgbastpq]{1,4}$/.test( prop ) === true ) {

				// accessing properties ( swizzle )

				prop = prop
					.replace( /r|s/g, 'x' )
					.replace( /g|t/g, 'y' )
					.replace( /b|p/g, 'z' )
					.replace( /a|q/g, 'w' );

				return nodeObject( new SplitNode( node, prop ) );

			} else if ( prop === 'width' || prop === 'height' ) {

				// accessing property

				return nodeObject( new SplitNode( node, prop === 'width' ? 'x' : 'y' ) );

			} else if ( /^\d+$/.test( prop ) === true ) {

				// accessing array

				return nodeObject( new ArrayElementNode( node, new ConstNode( Number( prop ), 'uint' ) ) );

			}

		}

		return node[ prop ];

	}

};

const nodeObjectsCacheMap = /* @__PURE__ */ new WeakMap();

const ShaderNodeObject = function ( obj, altType = null ) {

	const type = getValueType( obj );

	if ( type === 'node' ) {

		let nodeObject = nodeObjectsCacheMap.get( obj );

		if ( nodeObject === undefined ) {

			nodeObject = new Proxy( obj, shaderNodeHandler );
			nodeObjectsCacheMap.set( obj, nodeObject );
			nodeObjectsCacheMap.set( nodeObject, nodeObject );

		}

		return nodeObject;

	} else if ( ( altType === null && ( type === 'float' || type === 'boolean' ) ) || ( type && type !== 'shader' && type !== 'string' ) ) {

		return nodeObject( getConstNode( obj, altType ) );

	} else if ( type === 'shader' ) {

		return tslFn( obj );

	}

	return obj;

};

const ShaderNodeObjects = function ( objects, altType = null ) {

	for ( const name in objects ) {

		objects[ name ] = nodeObject( objects[ name ], altType );

	}

	return objects;

};

const ShaderNodeArray = function ( array, altType = null ) {

	const len = array.length;

	for ( let i = 0; i < len; i ++ ) {

		array[ i ] = nodeObject( array[ i ], altType );

	}

	return array;

};

const ShaderNodeProxy = function ( NodeClass, scope = null, factor = null, settings = null ) {

	const assignNode = ( node ) => nodeObject( settings !== null ? Object.assign( node, settings ) : node );

	if ( scope === null ) {

		return ( ...params ) => {

			return assignNode( new NodeClass( ...nodeArray( params ) ) );

		};

	} else if ( factor !== null ) {

		factor = nodeObject( factor );

		return ( ...params ) => {

			return assignNode( new NodeClass( scope, ...nodeArray( params ), factor ) );

		};

	} else {

		return ( ...params ) => {

			return assignNode( new NodeClass( scope, ...nodeArray( params ) ) );

		};

	}

};

const ShaderNodeImmutable = function ( NodeClass, ...params ) {

	return nodeObject( new NodeClass( ...nodeArray( params ) ) );

};

class ShaderNodeInternal extends Node {

	constructor( jsFunc ) {

		super();

		this._jsFunc = jsFunc;

	}

	call( inputs, stack, builder ) {

		inputs = nodeObjects( inputs );

		return nodeObject( this._jsFunc( inputs, stack, builder ) );

	}

	getNodeType( builder ) {

		const { outputNode } = builder.getNodeProperties( this );

		return outputNode ? outputNode.getNodeType( builder ) : super.getNodeType( builder );

	}

	construct( builder ) {

		builder.addStack();

		builder.stack.outputNode = nodeObject( this._jsFunc( builder.stack, builder ) );

		return builder.removeStack();

	}

}

const bools = [ false, true ];
const uints = [ 0, 1, 2, 3 ];
const ints = [ - 1, - 2 ];
const floats = [ 0.5, 1.5, 1 / 3, 1e-6, 1e6, Math.PI, Math.PI * 2, 1 / Math.PI, 2 / Math.PI, 1 / ( Math.PI * 2 ), Math.PI / 2 ];


const boolsCacheMap = /* @__PURE__ */ ( () => {

	const boolsCacheMap = new Map();
	for ( const bool of bools ) boolsCacheMap.set( bool, new ConstNode( bool ) );

	return boolsCacheMap;

} )();

const uintsCacheMap = /* @__PURE__ */ ( () => {

	const uintsCacheMap = new Map();
	for ( const uint of uints ) uintsCacheMap.set( uint, new ConstNode( uint, 'uint' ) );

	return uintsCacheMap;

} )();

const intsCacheMap = /* @__PURE__ */ ( () => {

	const intsCacheMap = new Map( [ ...uintsCacheMap ].map( el => new ConstNode( el.value, 'int' ) ) );
	for ( const int of ints ) intsCacheMap.set( int, new ConstNode( int, 'int' ) );

	return intsCacheMap;

} )();

const floatsCacheMap = /* @__PURE__ */ ( () => {

	const floatsCacheMap = new Map( [ ...intsCacheMap ].map( el => new ConstNode( el.value ) ) );
	for ( const float of floats ) floatsCacheMap.set( float, new ConstNode( float ) );
	for ( const float of floats ) floatsCacheMap.set( - float, new ConstNode( - float ) );

	return floatsCacheMap;

} )();

const cacheMaps = { bool: boolsCacheMap, uint: uintsCacheMap, ints: intsCacheMap, float: floatsCacheMap };

const constNodesCacheMap = /* @__PURE__ */ new Map( [ ...boolsCacheMap, ...floatsCacheMap ] );

const getConstNode = ( value, type ) => {

	if ( constNodesCacheMap.has( value ) ) {

		return constNodesCacheMap.get( value );

	} else if ( value.isNode === true ) {

		return value;

	} else {

		return new ConstNode( value, type );

	}

};

const safeGetNodeType = ( node ) => {

	try {

		return node.getNodeType();

	} catch ( _ ) {

		return undefined;

	}

};

const ConvertType = function ( type, cacheMap = null ) {

	return ( ...params ) => {

		if ( params.length === 0 || ( ! [ 'bool', 'float', 'int', 'uint' ].includes( type ) && params.every( param => typeof param !== 'object' ) ) ) {

			params = [ getValueFromType( type, ...params ) ];

		}

		if ( params.length === 1 && cacheMap !== null && cacheMap.has( params[ 0 ] ) ) {

			return nodeObject( cacheMap.get( params[ 0 ] ) );

		}

		if ( params.length === 1 ) {

			const node = getConstNode( params[ 0 ], type );
			if ( safeGetNodeType( node ) === type ) return nodeObject( node );
			return nodeObject( new ConvertNode( node, type ) );

		}

		const nodes = params.map( param => getConstNode( param ) );
		return nodeObject( new JoinNode( nodes, type ) );

	};

};

// exports

// utils

export const getConstNodeType = ( value ) => ( value !== undefined && value !== null ) ? ( value.nodeType || value.convertTo || ( typeof value === 'string' ? value : null ) ) : null;

// shader node base

export function ShaderNode( jsFunc ) {

	return new Proxy( new ShaderNodeInternal( jsFunc ), shaderNodeHandler );

}

export const nodeObject = ( val, altType = null ) => /* new */ ShaderNodeObject( val, altType );
export const nodeObjects = ( val, altType = null ) => new ShaderNodeObjects( val, altType );
export const nodeArray = ( val, altType = null ) => new ShaderNodeArray( val, altType );
export const nodeProxy = ( ...params ) => new ShaderNodeProxy( ...params );
export const nodeImmutable = ( ...params ) => new ShaderNodeImmutable( ...params );

export const shader = ( jsFunc ) => { // @deprecated, r154

	console.warn( 'TSL: shader() is deprecated. Use tslFn() instead.' );

	return new ShaderNode( jsFunc );

};

export const tslFn = ( jsFunc ) => {

	let shaderNode = null;

	return ( ...params ) => {

		if ( shaderNode === null ) shaderNode = new ShaderNode( jsFunc );

		return shaderNode.call( ...params );

	};

};

/* @__PURE__ */ addNodeClass( ShaderNode );

// types
// @TODO: Maybe export from ConstNode.js?

export const color = /* @__PURE__ */ new ConvertType( 'color' );

export const float = /* @__PURE__ */ new ConvertType( 'float', cacheMaps.float );
export const int = /* @__PURE__ */ new ConvertType( 'int', cacheMaps.int );
export const uint = /* @__PURE__ */ new ConvertType( 'uint', cacheMaps.uint );
export const bool = /* @__PURE__ */ new ConvertType( 'bool', cacheMaps.bool );

export const vec2 = /* @__PURE__ */ new ConvertType( 'vec2' );
export const ivec2 = /* @__PURE__ */ new ConvertType( 'ivec2' );
export const uvec2 = /* @__PURE__ */ new ConvertType( 'uvec2' );
export const bvec2 = /* @__PURE__ */ new ConvertType( 'bvec2' );

export const vec3 = /* @__PURE__ */ new ConvertType( 'vec3' );
export const ivec3 = /* @__PURE__ */ new ConvertType( 'ivec3' );
export const uvec3 = /* @__PURE__ */ new ConvertType( 'uvec3' );
export const bvec3 = /* @__PURE__ */ new ConvertType( 'bvec3' );

export const vec4 = /* @__PURE__ */ new ConvertType( 'vec4' );
export const ivec4 = /* @__PURE__ */ new ConvertType( 'ivec4' );
export const uvec4 = /* @__PURE__ */ new ConvertType( 'uvec4' );
export const bvec4 = /* @__PURE__ */ new ConvertType( 'bvec4' );

export const mat3 = /* @__PURE__ */ new ConvertType( 'mat3' );
export const imat3 = /* @__PURE__ */ new ConvertType( 'imat3' );
export const umat3 = /* @__PURE__ */ new ConvertType( 'umat3' );
export const bmat3 = /* @__PURE__ */ new ConvertType( 'bmat3' );

export const mat4 = /* @__PURE__ */ new ConvertType( 'mat4' );
export const imat4 = /* @__PURE__ */ new ConvertType( 'imat4' );
export const umat4 = /* @__PURE__ */ new ConvertType( 'umat4' );
export const bmat4 = /* @__PURE__ */ new ConvertType( 'bmat4' );

export const string = ( value = '' ) => nodeObject( new ConstNode( value, 'string' ) );
export const arrayBuffer = ( value ) => nodeObject( new ConstNode( value, 'ArrayBuffer' ) );

/* @__PURE__ */ addNodeElement( 'color', color );
/* @__PURE__ */ addNodeElement( 'float', float );
/* @__PURE__ */ addNodeElement( 'int', int );
/* @__PURE__ */ addNodeElement( 'uint', uint );
/* @__PURE__ */ addNodeElement( 'bool', bool );
/* @__PURE__ */ addNodeElement( 'vec2', vec2 );
/* @__PURE__ */ addNodeElement( 'ivec2', ivec2 );
/* @__PURE__ */ addNodeElement( 'uvec2', uvec2 );
/* @__PURE__ */ addNodeElement( 'bvec2', bvec2 );
/* @__PURE__ */ addNodeElement( 'vec3', vec3 );
/* @__PURE__ */ addNodeElement( 'ivec3', ivec3 );
/* @__PURE__ */ addNodeElement( 'uvec3', uvec3 );
/* @__PURE__ */ addNodeElement( 'bvec3', bvec3 );
/* @__PURE__ */ addNodeElement( 'vec4', vec4 );
/* @__PURE__ */ addNodeElement( 'ivec4', ivec4 );
/* @__PURE__ */ addNodeElement( 'uvec4', uvec4 );
/* @__PURE__ */ addNodeElement( 'bvec4', bvec4 );
/* @__PURE__ */ addNodeElement( 'mat3', mat3 );
/* @__PURE__ */ addNodeElement( 'imat3', imat3 );
/* @__PURE__ */ addNodeElement( 'umat3', umat3 );
/* @__PURE__ */ addNodeElement( 'bmat3', bmat3 );
/* @__PURE__ */ addNodeElement( 'mat4', mat4 );
/* @__PURE__ */ addNodeElement( 'imat4', imat4 );
/* @__PURE__ */ addNodeElement( 'umat4', umat4 );
/* @__PURE__ */ addNodeElement( 'bmat4', bmat4 );
/* @__PURE__ */ addNodeElement( 'string', string );
/* @__PURE__ */ addNodeElement( 'arrayBuffer', arrayBuffer );

// basic nodes
// HACK - we cannot export them from the corresponding files because of the cyclic dependency
export const element = /* @__PURE__ */ nodeProxy( ArrayElementNode );
export const convert = ( node, types ) => nodeObject( new ConvertNode( nodeObject( node ), types ) );
export const split = ( node, channels ) => nodeObject( new SplitNode( nodeObject( node ), channels ) );

/* @__PURE__ */ addNodeElement( 'element', element );
/* @__PURE__ */ addNodeElement( 'convert', convert );
