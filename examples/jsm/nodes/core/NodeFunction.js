
const NodeFunction /* @__PURE__ */ = ( () => {

	class NodeFunction {

		constructor( type, inputs, name = '', presicion = '' ) {

			this.type = type;
			this.inputs = inputs;
			this.name = name;
			this.presicion = presicion;

		}

		getCode( /*name = this.name*/ ) {

			console.warn( 'Abstract function.' );

		}

	}

	NodeFunction.isNodeFunction = true;

	return NodeFunction;

} )();


export default NodeFunction;
