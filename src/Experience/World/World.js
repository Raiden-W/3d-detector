import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Detector from "./Detector.js";

export default class World {
	constructor() {
		this.experience = new Experience();
		this.scene = this.experience.scene;
		this.resources = this.experience.resources;

		//wait for resources
		this.resources.on("ready", () => {
			//set up
			this.environment = new Environment();
			this.detector = new Detector();
		});
	}

	update() {
		if (this.detector) this.detector.update();
		if (this.environment) this.environment.update();
	}
}
