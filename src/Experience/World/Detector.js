import * as THREE from "three";
import Experience from "../Experience.js";
import getCanvasUI from "./2d_ui.js";
import EventEmitter from "../Utils/EventEmitter.js";
import { gsap } from "gsap";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import Sounds from "./Sounds.js";

export default class Detector extends EventEmitter {
	constructor() {
		super();

		this.experience = new Experience();
		this.scene = this.experience.scene;
		this.camera = this.experience.camera.instance;
		this.controls = this.experience.camera.controls;
		this.sizes = this.experience.sizes;
		this.resources = this.experience.resources;
		this.time = this.experience.time;
		this.modalHandler = this.experience.modalHandler;

		this.powerOn = false;
		this.sounds = new Sounds(this);
		this.canvasUI = getCanvasUI(this);
		this.setUI();
		this.setModel();
		this.setInteraction();

		this.fakeAnimationObj = { x: 0 };
	}

	setUI() {
		this.textureUI = new THREE.CanvasTexture(this.canvasUI);
		this.textureUI.encoding = THREE.sRGBEncoding;
		this.materialUI = new THREE.MeshStandardMaterial({
			color: "#000000",
			emissive: "#ffffff",
			emissiveMap: this.textureUI,
			emissiveIntensity: 0,
			roughness: 0,
		});
	}

	setModel() {
		this.model = this.resources.items.detectorModel.scene;
		this.model.rotateY(-Math.PI * 0.5);

		this.pivot = new THREE.Vector3(0.1, -0.15, 0);
		this.controls.target = this.pivot;

		// console.log(this.model);
		// console.log(this.model.children);

		this.screen = this.model.children[1];

		if (this.experience.isMobile) {
			this.model.rotateX(Math.PI * -0.5);
			this.screen.rotateX(Math.PI * -0.5);
			this.pivot = new THREE.Vector3(-0.1, -0.15, 0);
			this.controls.target = this.pivot;
		}

		this.antenna = this.model.children[4];
		this.lightA = this.model.children[2];
		this.lightB = this.model.children[3];
		this.raderPanel = this.model.children[0];
		this.raderHood = this.model.children[21];

		this.screen.material = this.materialUI;
		this.lightA.material = new THREE.MeshPhongMaterial({
			color: "#030303",
			emissive: "#7a0000",
			specular: "#2e2e2e",
			shininess: 100,
			emissiveIntensity: 0.01,
		});
		this.lightB.material = new THREE.MeshPhongMaterial({
			color: "#030303",
			emissive: "#abc819",
			specular: "#2e2e2e",
			shininess: 100,
			emissiveIntensity: 0.01,
		});
		this.raderPanel.material = new THREE.ShaderMaterial({
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			uniforms: {
				u_Time: { value: 0 },
				u_Switch: { value: 0 },
			},
		});
		this.raderHood.material = new THREE.MeshStandardMaterial({
			color: "#ebebeb",
			transparent: true,
			opacity: 0.2,
			roughness: 0,
			metalness: 1,
			flatShading: true,
		});
		this.scene.add(this.model);

		//the entry animation
		this.controls.enableRotate = false;
		gsap.from(this.model.position, {
			duration: 4,
			x: -4,
			z: -30,
			ease: "slow",
			onComplete: () => {
				this.controls.enableRotate = true;
			},
		});
		gsap.from(this.model.rotation, {
			duration: 5,
			x: -4 * Math.PI,
			y: -2 * Math.PI,
			ease: "circ",
		});
		gsap.to(this.fakeAnimationObj, {
			duration: 5,
			x: 1,
			onStart: () => {
				this.duringAnimation = true;
			},
			onComplete: () => {
				this.duringAnimation = false;
			},
		});
	}

	setInteraction() {
		this.mouse = new THREE.Vector2();
		this.raycaster = new THREE.Raycaster();

		this.buttonEvents = {
			up: "ButtonUp",
			down: "ButtonDown",
			left: "ButtonLeft",
			right: "ButtonRight",
		};

		if (this.experience.isMobile) {
			this.buttonEvents = {
				up: "ButtonRight",
				down: "ButtonLeft",
				left: "ButtonUp",
				right: "ButtonDown",
			};
		}

		window.addEventListener("click", (event) => {
			this.mouse.x = (event.clientX / this.sizes.width) * 2 - 1;
			this.mouse.y = -((event.clientY / this.sizes.height) * 2 - 1);
			this.raycaster.setFromCamera(this.mouse, this.camera);
			this.intersects = this.raycaster.intersectObjects(this.model.children);
			// console.log(this.intersects[0].object.name);

			if (this.duringAnimation === false) {
				//turn on
				if (this.powerOn === false) {
					//turn on actions
					if (this.intersects[0].object.name === "Switch_Tip001") {
						// change screen
						//zoom in
						this.controls.enabled = false;

						this.cameraInitPos = this.camera.position.clone();
						this.cameraInitRot = this.camera.rotation.clone();

						gsap.to(this.camera.position, {
							delay: 0.4,
							duration: 1.2,
							x: 0.2,
							y: 0,
							z: 2.7,
							ease: "back",
						});
						if (this.experience.isMobile) {
							gsap.to(this.camera.position, {
								delay: 0.4,
								duration: 1.2,
								x: 0,
								y: -0.22,
								z: 4.8,
								ease: "back",
							});
						}
						gsap.to(this.camera.rotation, {
							delay: 0.4,
							duration: 1.2,
							x: 0,
							y: 0,
							z: 0,
							ease: "back",
						});
						gsap.to(this.materialUI, {
							delay: 0.8,
							duration: 2.5,
							emissiveIntensity: 0.3,
						});
						gsap.to(this.raderPanel.material.uniforms.u_Switch, {
							delay: 0,
							duration: 0.5,
							value: 1,
							ease: "expo",
						});

						//animate the indicator light
						this.animateLightA = gsap.to(this.lightA.material, {
							delay: 0.3,
							duration: 0.5,
							emissiveIntensity: 1,
							repeat: -1,
							yoyo: true,
							ease: "circ",
						});

						this.trigger("Switch");

						this.powerOn = !this.powerOn;
						this.animateSwitch();

						gsap.to(this.fakeAnimationObj, {
							duration: 3,
							x: 1,
							onStart: () => {
								this.duringAnimation = true;
							},
							onComplete: () => {
								this.duringAnimation = false;
							},
						});
					}
				} else {
					if (this.intersects[0].object.name === "Button_Up") {
						this.trigger(this.buttonEvents.up);
						// animation
						this.animateBotton();
					} else if (this.intersects[0].object.name === "Button_Down") {
						this.trigger(this.buttonEvents.down);
						// animation
						this.animateBotton();
					} else if (this.intersects[0].object.name === "Button_Left") {
						this.trigger(this.buttonEvents.left);
						// animation
						this.animateBotton();
					} else if (this.intersects[0].object.name === "Button_Right") {
						this.trigger(this.buttonEvents.right);
						// animation
						this.animateBotton();
					} else if (this.intersects[0].object.name === "Button_Select") {
						this.trigger("ButtonSelect");
						// animation
						this.animateBotton();
					} else if (this.intersects[0].object.name === "Switch_Tip001") {
						// change screen
						// zoom out
						gsap.to(this.camera.position, {
							delay: 0.4,
							duration: 1.2,
							x: this.cameraInitPos.x,
							y: this.cameraInitPos.y,
							z: this.cameraInitPos.z,
							ease: "expo",
							onComplete: () => {
								this.controls.enabled = true;
							},
						});
						gsap.to(this.camera.rotation, {
							delay: 0.4,
							duration: 1.2,
							x: this.cameraInitRot.x,
							y: this.cameraInitRot.y,
							z: this.cameraInitRot.z,
							ease: "expo",
						});
						gsap.to(this.materialUI, {
							delay: 0.4,
							duration: 1,
							emissiveIntensity: 0,
						});
						gsap.to(this.raderPanel.material.uniforms.u_Switch, {
							delay: 1,
							duration: 2,
							value: 0,
							ease: "power1",
						});

						gsap.to(this.fakeAnimationObj, {
							duration: 2.5,
							x: 0,
							onStart: () => {
								this.duringAnimation = true;
							},
							onComplete: () => {
								this.duringAnimation = false;
							},
						});

						//stop the indicator lights
						this.animateLightA.revert();
						this.animateSwitch();

						this.trigger("Switch");
						this.powerOn = !this.powerOn;
					}
				}
			}
		});
	}

	update() {
		this.textureUI.needsUpdate = true;
		this.raderPanel.material.uniforms.u_Time.value = this.time.elapsed * 0.001;
	}

	animateBotton() {
		//botton position
		const posX = this.intersects[0].object.position.x;
		this.buttonAnimation = gsap.to(this.intersects[0].object.position, {
			delay: 0.05,
			duration: 0.1,
			x: posX - 0.045,
			repeat: 1,
			yoyo: true,
			onComplete: () => {
				this.buttonAnimation.kill();
			},
		});
		//indicator light
		gsap
			.fromTo(
				this.lightB.material,
				{
					duration: 0.1,
					emissiveIntensity: 0,
					ease: "none",
				},
				{
					duration: 0.1,
					emissiveIntensity: 1,
					ease: "none",
				}
			)
			.repeat(3)
			.yoyo(true);
	}
	animateSwitch() {
		const zRotate = this.intersects[0].object.parent.rotation.z;
		gsap.to(this.intersects[0].object.parent.rotation, {
			delay: 0.05,
			duration: 0.1,
			z: -zRotate,
		});

		let offset;
		let delay;
		zRotate > 0
			? ((offset = 0.6), (delay = 0.05))
			: ((offset = -0.6), (delay = 0.8));
		const yPos = this.antenna.position.y;
		gsap.to(this.antenna.position, {
			delay: delay,
			duration: 0.5,
			y: yPos + offset,
		});
	}
}
