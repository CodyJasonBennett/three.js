import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class OperatorNode extends TempNode {

	constructor( op, aNode, bNode, ...params ) {

		super();

		this.op = op;

		if ( params.length > 0 ) {

			let finalBNode = bNode;

			for ( let i = 0; i < params.length; i ++ ) {

				finalBNode = new OperatorNode( op, finalBNode, params[ i ] );

			}

			bNode = finalBNode;

		}

		this.aNode = aNode;
		this.bNode = bNode;

	}

	hasDependencies( builder ) {

		return this.op !== '=' ? super.hasDependencies( builder ) : false;

	}

	getNodeType( builder, output ) {

		const op = this.op;

		const aNode = this.aNode;
		const bNode = this.bNode;

		const typeA = aNode.getNodeType( builder );
		const typeB = bNode.getNodeType( builder );

		if ( typeA === 'void' || typeB === 'void' ) {

			return 'void';

		} else if ( op === '=' || op === '%' ) {

			return typeA;

		} else if ( op === '&' || op === '|' || op === '^' || op === '>>' || op === '<<' ) {

			return builder.getIntegerType( typeA );

		} else if ( op === '==' || op === '&&' || op === '||' || op === '^^' ) {

			return 'bool';

		} else if ( op === '<' || op === '>' || op === '<=' || op === '>=' ) {

			const typeLength = output ? builder.getTypeLength( output ) : Math.max( builder.getTypeLength( typeA ), builder.getTypeLength( typeB ) );

			return typeLength > 1 ? `bvec${ typeLength }` : 'bool';

		} else {

			if ( typeA === 'float' && builder.isMatrix( typeB ) ) {

				return typeB;

			} else if ( builder.isMatrix( typeA ) && builder.isVector( typeB ) ) {

				// matrix x vector

				return builder.getVectorFromMatrix( typeA );

			} else if ( builder.isVector( typeA ) && builder.isMatrix( typeB ) ) {

				// vector x matrix

				return builder.getVectorFromMatrix( typeB );

			} else if ( builder.getTypeLength( typeB ) > builder.getTypeLength( typeA ) ) {

				// anytype x anytype: use the greater length vector

				return typeB;

			}

			return typeA;

		}

	}

	generate( builder, output ) {

		const op = this.op;

		const aNode = this.aNode;
		const bNode = this.bNode;

		const type = this.getNodeType( builder, output );

		let typeA = null;
		let typeB = null;

		if ( type !== 'void' ) {

			typeA = aNode.getNodeType( builder );
			typeB = bNode.getNodeType( builder );

			if ( op === '=' ) {

				typeB = typeA;

			} else if ( op === '<' || op === '>' || op === '<=' || op === '>=' || op === '==' ) {

				if ( builder.isVector( typeA ) ) {

					typeB = typeA;

				} else {

					typeA = typeB = 'float';

				}

			} else if ( op === '>>' || op === '<<' ) {

				typeA = type;
				typeB = builder.changeComponentType( typeB, 'uint' );

			} else if ( builder.isMatrix( typeA ) && builder.isVector( typeB ) ) {

				// matrix x vector

				typeB = builder.getVectorFromMatrix( typeA );

			} else if ( builder.isVector( typeA ) && builder.isMatrix( typeB ) ) {

				// vector x matrix

				typeA = builder.getVectorFromMatrix( typeB );

			} else {

				// anytype x anytype

				typeA = typeB = type;

			}

		} else {

			typeA = typeB = type;

		}

		const a = aNode.build( builder, typeA );
		const b = bNode.build( builder, typeB );

		const outputLength = builder.getTypeLength( output );

		if ( output !== 'void' ) {

			if ( op === '=' ) {

				builder.addLineFlowCode( `${a} ${this.op} ${b}` );

				return a;

			} else if ( op === '<' && outputLength > 1 ) {

				return builder.format( `${ builder.getMethod( 'lessThan' ) }( ${a}, ${b} )`, type, output );

			} else if ( op === '<=' && outputLength > 1 ) {

				return builder.format( `${ builder.getMethod( 'lessThanEqual' ) }( ${a}, ${b} )`, type, output );

			} else if ( op === '>' && outputLength > 1 ) {

				return builder.format( `${ builder.getMethod( 'greaterThan' ) }( ${a}, ${b} )`, type, output );

			} else if ( op === '>=' && outputLength > 1 ) {

				return builder.format( `${ builder.getMethod( 'greaterThanEqual' ) }( ${a}, ${b} )`, type, output );

			} else {

				return builder.format( `( ${a} ${this.op} ${b} )`, type, output );

			}

		} else if ( typeA !== 'void' ) {

			return builder.format( `${a} ${this.op} ${b}`, type, output );

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.op = this.op;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.op = data.op;

	}

}

export default OperatorNode;

export const add = /* @__PURE__ */ nodeProxy( OperatorNode, '+' );
export const sub = /* @__PURE__ */ nodeProxy( OperatorNode, '-' );
export const mul = /* @__PURE__ */ nodeProxy( OperatorNode, '*' );
export const div = /* @__PURE__ */ nodeProxy( OperatorNode, '/' );
export const remainder = /* @__PURE__ */ nodeProxy( OperatorNode, '%' );
export const equal = /* @__PURE__ */ nodeProxy( OperatorNode, '==' );
export const assign = /* @__PURE__ */ nodeProxy( OperatorNode, '=' );
export const lessThan = /* @__PURE__ */ nodeProxy( OperatorNode, '<' );
export const greaterThan = /* @__PURE__ */ nodeProxy( OperatorNode, '>' );
export const lessThanEqual = /* @__PURE__ */ nodeProxy( OperatorNode, '<=' );
export const greaterThanEqual = /* @__PURE__ */ nodeProxy( OperatorNode, '>=' );
export const and = /* @__PURE__ */ nodeProxy( OperatorNode, '&&' );
export const or = /* @__PURE__ */ nodeProxy( OperatorNode, '||' );
export const xor = /* @__PURE__ */ nodeProxy( OperatorNode, '^^' );
export const bitAnd = /* @__PURE__ */ nodeProxy( OperatorNode, '&' );
export const bitOr = /* @__PURE__ */ nodeProxy( OperatorNode, '|' );
export const bitXor = /* @__PURE__ */ nodeProxy( OperatorNode, '^' );
export const shiftLeft = /* @__PURE__ */ nodeProxy( OperatorNode, '<<' );
export const shiftRight = /* @__PURE__ */ nodeProxy( OperatorNode, '>>' );

/* @__PURE__ */ addNodeElement( 'add', add );
/* @__PURE__ */ addNodeElement( 'sub', sub );
/* @__PURE__ */ addNodeElement( 'mul', mul );
/* @__PURE__ */ addNodeElement( 'div', div );
/* @__PURE__ */ addNodeElement( 'remainder', remainder );
/* @__PURE__ */ addNodeElement( 'equal', equal );
/* @__PURE__ */ addNodeElement( 'assign', assign );
/* @__PURE__ */ addNodeElement( 'lessThan', lessThan );
/* @__PURE__ */ addNodeElement( 'greaterThan', greaterThan );
/* @__PURE__ */ addNodeElement( 'lessThanEqual', lessThanEqual );
/* @__PURE__ */ addNodeElement( 'greaterThanEqual', greaterThanEqual );
/* @__PURE__ */ addNodeElement( 'and', and );
/* @__PURE__ */ addNodeElement( 'or', or );
/* @__PURE__ */ addNodeElement( 'xor', xor );
/* @__PURE__ */ addNodeElement( 'bitAnd', bitAnd );
/* @__PURE__ */ addNodeElement( 'bitOr', bitOr );
/* @__PURE__ */ addNodeElement( 'bitXor', bitXor );
/* @__PURE__ */ addNodeElement( 'shiftLeft', shiftLeft );
/* @__PURE__ */ addNodeElement( 'shiftRight', shiftRight );

/* @__PURE__ */ addNodeClass( OperatorNode );
