import * as THREE from "three";
import Experience from "../Experience.js";

export default class Environment {
	constructor() {
		this.experience = new Experience();
		this.scene = this.experience.scene;
		this.renderer = this.experience.renderer.instance;
		this.camera = this.experience.camera.instance;
		this.time = this.experience.time;
		this.sizes = this.experience.sizes;
		this.resources = this.experience.resources;

		this.setSunlighht();
		this.setLightProbe();
		this.setBackground();
	}

	setBackground() {
		this.bgTexture = this.resources.items.bgTexture;
		this.bgTexture.encoding = THREE.sRGBEncoding;
		this.bgTexture.wrapS = THREE.RepeatWrapping;
		this.bgTexture.wrapT = THREE.RepeatWrapping;
		this.bgTexture.center.set(0.5, 0.5);
		this.scene.background = this.bgTexture;
	}

	setLightProbe() {
		this.lightProbeTexture = this.resources.items.lightProbeTexture;
		this.lightProbeTexture.encoding = THREE.sRGBEncoding;
		this.sphere = new THREE.Mesh(
			new THREE.SphereGeometry(1),
			new THREE.MeshBasicMaterial({
				map: this.resources.items.lightProbeTexture,
				side: THREE.BackSide,
			})
		);
		this.sphere.position.set(0, 0, 3);
		this.camera.add(this.sphere);

		this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
			generateMipmaps: true,
			minFilter: THREE.LinearMipmapLinearFilter,
		});
		this.cubeCamera = new THREE.CubeCamera(0.1, 1.1, this.cubeRenderTarget);
		this.sphere.add(this.cubeCamera);

		this.scene.environment = this.cubeRenderTarget.texture;

		/**make a test sphere to see if the envMap works */
		// this.chromeMaterial = new THREE.MeshBasicMaterial({
		// 	color: "#ffffff",
		// 	envMap: this.cubeRenderTarget.texture,
		// });
		// this.testSphere = new THREE.Mesh(
		// 	new THREE.SphereGeometry(1),
		// 	this.chromeMaterial
		// );
		// this.testSphere.position.set(0, 5, 0);
		// this.scene.add(this.testSphere);
	}

	update() {
		this.cubeCamera.rotateZ(this.time.delta * 0.0003);
		this.cubeCamera.rotateX(this.time.delta * 0.0002);
		this.cubeCamera.update(this.renderer, this.scene);

		this.bgTexture.offset.set(0, this.time.elapsed * 0.0003);
		this.bgRepeat = this.sizes.width / 120;

		this.bgTexture.repeat.set(
			this.bgRepeat,
			(this.bgRepeat * this.sizes.height) / this.sizes.width
		);
	}

	setSunlighht() {
		this.sunLight = new THREE.DirectionalLight("#E6E6FA");
		// this.sunLight.castShadow = true;
		// this.sunLight.shadow.camera.far = 15;
		// this.sunLight.shadow.mapSize.set(1024, 1024);
		// this.sunLight.shadow.normalBias = 0.05;
		this.sunLight.position.set(-1, 5, 5);
		this.sunLight.intensity = 1.5;
		this.scene.add(this.sunLight);
		this.ambientLight = new THREE.AmbientLight("#E6E6FA");
		this.ambientLight.intensity = 0.5;
		this.scene.add(this.ambientLight);
	}
}
