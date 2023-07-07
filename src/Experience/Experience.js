import * as THREE from "three";

import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Camera from "./Camera.js";
import Renderer from "./Renderer.js";
import World from "./World/World.js";
import Resources from "./Utils/Resources.js";
import sources from "./sources.js";
import ModalHandler from "./Utils/ModalHandler.js";

let instance = null;

export default class Experience {
	constructor(_canvas) {
		//singleton
		if (instance) {
			return instance;
		}

		instance = this;

		//global access
		window.experience = this;

		//options
		this.canvas = _canvas;

		this.isMobile = false;
		if (window.innerWidth < window.innerHeight) this.isMobile = testMobile();

		//setup
		this.sizes = new Sizes();
		this.time = new Time();
		this.scene = new THREE.Scene();
		this.resources = new Resources(sources);
		this.camera = new Camera();
		this.renderer = new Renderer();
		this.world = new World();
		this.modalHandler = new ModalHandler();

		//resize event
		this.sizes.on("resize", () => {
			this.resize();
		});

		//time tick event
		this.time.on("tick", () => {
			this.update();
		});
	}

	resize() {
		this.camera.resize();
		this.renderer.resize();
	}

	update() {
		this.camera.update();
		this.world.update();
		this.renderer.update();
	}

	// destroy()
}

const testMobile = () => {
	const match = window.matchMedia("(pointer:coarse)");
	return match && match.matches;
};
