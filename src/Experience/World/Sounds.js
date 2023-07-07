import * as THREE from "three";
import Experience from "../Experience.js";

export default class Sounds {
	constructor(detector) {
		this.experience = new Experience();
		this.camera = this.experience.camera.instance;
		this.resources = this.experience.resources;
		this.detector = detector;

		this.setSounds();
	}

	setSounds() {
		this.listner = new THREE.AudioListener();
		this.camera.add(this.listner);

		this.switchClip = new THREE.Audio(this.listner);
		this.buttonClip = new THREE.Audio(this.listner);

		this.switchClip.setBuffer(this.resources.items.switchSound);
		this.switchClip.setVolume(0.3);
		this.buttonClip.setBuffer(this.resources.items.buttonSound);
		this.buttonClip.setVolume(0.3);

		this.detector.on("Switch", () => {
			this.switchClip.play();
		});
		this.detector.on("ButtonUp", () => {
			this.buttonClip.play();
		});
		this.detector.on("ButtonDown", () => {
			this.buttonClip.play();
		});
		this.detector.on("ButtonLeft", () => {
			this.buttonClip.play();
		});
		this.detector.on("ButtonRight", () => {
			this.buttonClip.play();
		});
		this.detector.on("ButtonSelect", () => {
			this.buttonClip.play();
		});
	}
}
