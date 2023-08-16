import Node, { addNodeClass } from '../core/Node.js';
import { timerLocal } from './TimerNode.js';
import { nodeObject, nodeProxy } from '../shadernode/ShaderNode.js';

class OscNode extends Node {

	constructor( method = OscNode.SINE, timeNode = timerLocal() ) {

		super();

		this.method = method;
		this.timeNode = timeNode;

	}

	getNodeType( builder ) {

		return this.timeNode.getNodeType( builder );

	}

	construct() {

		const method = this.method;
		const timeNode = nodeObject( this.timeNode );

		let outputNode = null;

		if ( method === OscNode.SINE ) {

			outputNode = timeNode.add( 0.75 ).mul( Math.PI * 2 ).sin().mul( 0.5 ).add( 0.5 );

		} else if ( method === OscNode.SQUARE ) {

			outputNode = timeNode.fract().round();

		} else if ( method === OscNode.TRIANGLE ) {

			outputNode = timeNode.add( 0.5 ).fract().mul( 2 ).sub( 1 ).abs();

		} else if ( method === OscNode.SAWTOOTH ) {

			outputNode = timeNode.fract();

		}

		return outputNode;

	}

	serialize( data ) {

		super.serialize( data );

		data.method = this.method;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.method = data.method;

	}

}

/* @__PURE__ */ ( () => {

	OscNode.SINE = 'sine';
	OscNode.SQUARE = 'square';
	OscNode.TRIANGLE = 'triangle';
	OscNode.SAWTOOTH = 'sawtooth';

} )();

export default OscNode;

export const oscSine = /* @__PURE__ */ nodeProxy( OscNode, OscNode.SINE );
export const oscSquare = /* @__PURE__ */ nodeProxy( OscNode, OscNode.SQUARE );
export const oscTriangle = /* @__PURE__ */ nodeProxy( OscNode, OscNode.TRIANGLE );
export const oscSawtooth = /* @__PURE__ */ nodeProxy( OscNode, OscNode.SAWTOOTH );

/* @__PURE__ */ addNodeClass( OscNode );
