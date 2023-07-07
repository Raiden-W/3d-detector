import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import EventEmitter from "./EventEmitter.js";

export default class Resources extends EventEmitter {
	constructor(sources) {
		super();

		this.sources = sources;

		this.items = {};
		this.toload = this.sources.length;
		this.loaded = 0;

		this.setLoaders();
		this.startLoading();
	}

	setLoaders() {
		this.loaders = {};
		this.loaders.gltfLoader = new GLTFLoader();
		this.loaders.dracoLoader = new DRACOLoader();
		this.loaders.dracoLoader.setDecoderPath("/draco/");
		this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader);
		this.loaders.textureLoader = new THREE.TextureLoader();
		// this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
		this.loaders.audioLoader = new THREE.AudioLoader();
	}

	startLoading() {
		//load each source

		for (const source of this.sources) {
			if (source.type === "gltfModel") {
				this.loaders.gltfLoader.load(source.path, (file) => {
					this.sourceLoaded(source, file);
				});
			}
			if (source.type === "texture") {
				this.loaders.textureLoader.load(source.path, (file) => {
					this.sourceLoaded(source, file);
				});
			}
			if (source.type === "sound") {
				this.loaders.audioLoader.load(source.path, (file) => {
					this.sourceLoaded(source, file);
				});
			}
		}
	}

	sourceLoaded(source, file) {
		this.items[source.name] = file;

		this.loaded++;

		if (this.loaded === this.toload) {
			this.trigger("ready");
		}
	}
}
