import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';

import { MeshBasicMaterial } from 'three';

const defaultValues = /* @__PURE__ */ new MeshBasicMaterial();

class MeshBasicNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshBasicNodeMaterial = true;

		this.lights = false;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

}

export default MeshBasicNodeMaterial;

/* @__PURE__ */ addNodeMaterial( MeshBasicNodeMaterial );
