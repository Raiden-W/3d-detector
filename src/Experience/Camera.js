import * as THREE from "three";
import Experience from "./Experience.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Camera {
	constructor() {
		this.experience = new Experience();
		this.sizes = this.experience.sizes;
		this.scene = this.experience.scene;
		this.canvas = this.experience.canvas;

		this.setInstance();
		this.setControls();
	}

	setInstance() {
		this.instance = new THREE.PerspectiveCamera(
			40,
			this.sizes.width / this.sizes.height,
			0.1,
			100
		);
		this.instance.position.set(0.7, 0.7, 4.5);
		if (this.experience.isMobile) this.instance.position.set(0.7, 0.7, 6);
		this.scene.add(this.instance);
	}

	setControls() {
		this.controls = new OrbitControls(this.instance, this.canvas);
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.09;
		this.controls.enablePan = false;
		this.controls.minAzimuthAngle = -Math.PI * 0.7;
		this.controls.maxAzimuthAngle = Math.PI * 0.7;
		this.controls.minPolarAngle = Math.PI * 0.05;
		this.controls.maxPolarAngle = Math.PI * 0.95;
		this.controls.minDistance = 4;
		this.controls.maxDistance = 6.5;

		if (this.experience.isMobile) {
			this.controls.minDistance = 6.5;
			this.controls.maxDistance = 9;
		}
	}

	resize() {
		this.instance.aspect = this.sizes.width / this.sizes.height;
		this.instance.updateProjectionMatrix();
	}

	update() {
		if (this.controls.enabled) this.controls.update();
	}
}
