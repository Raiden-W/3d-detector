import * as PIXI from "pixi.js";
import { CRTFilter } from "@pixi/filter-crt";
import { gsap } from "gsap";

import textInfo from "../../../static/textInfo.json" assert { type: "json" }; //import json file without using fetch

let itemBubbles = []; //array that will contain objects carrying name, index and sprites of those item bubbles
//helps count the up and down button pressing to scroll the bubbles
//technically change the index of each item bubble so as to change their positions and tell if one is chosen(if i = 4)
let uiState = 0;
//uiState changes through pressing left and right
//uiState 0 means use the scan and display info of chosen item, 1 means you can scroll the bubbles
// 2 means shifting to the entrance to playing page
let chosenItem, chosenItemName, chosenItemSearchName, chosenItemInfo;
let chosenAmount = 0;
//the current chosen item name;
//the chosen item's search name, will be input to img searching function to generate reel of item imgs
//the current chosen item's intro;
const uiEleImgs = {}; //obj that will contain the ui element imgs
const uiSize = 750; //size of sqaure the ui interface
const bubblePos = { x: uiSize * 1.16, y: uiSize / 2, r: uiSize * 0.46 };
//the parameters of the pos and layout of those item bubbles
const scanFilter = new PIXI.Graphics();
//will draw the filter circle to lighten the chosen bubble
const uiInfoMachine = new PIXI.Container();
//used to carry the ui scan filter, info board, and reel img together and animate them when ui state changes to 2

let titleStyle, infoStyle; //the text styles
let headTiling, itemNameTiling, itemInfoTiling; //the tiling texture created from text
let itemInfoText;
let textDisplayFirstTime = true; //to mark if the initial text has been set so they dont repeat in tick
let bubbleRotateStarts = false;
//^ above there is ui part variables
// ----------------------------------------------------------------------------------------

let itemImgUrls = [];
let itemImgs = [];
let initTextInfo = false;
let resetImgSizes = true;
let itemChange = true;
let reelAmiStarts = false;
let initFont = false;
let cullTimes = 0;
let reelImgsTiling = {};

const reelSize = { width: 600, height: 140, y: 569 };
const reelFrame = new PIXI.Graphics();

//^ above there is items' reel img part variables
// ----------------------------------------------------------------------------------------

const lerp = (a, b, t) => a + (b - a) * t; //define a linear lerp func

const canvasUI = document.createElement("canvas").getContext("webgl", {
	willReadFrequently: true,
	antialias: false,
	depth: false,
	stencil: true,
	preserveDrawingBuffer: true,
});
document.body.appendChild(canvasUI.canvas);
canvasUI.canvas.hidden = true;

const uiApp = new PIXI.Application({
	width: uiSize,
	height: uiSize,
	view: canvasUI.canvas,
	antialias: true,
	resolution: window.devicePixelRatio || 2,
});

//set app basic parameters

const crtFilter = new CRTFilter({
	curvature: 1,
	lineWidth: 20,
	lineContrast: 0.06,
	noise: 0.1,
	noiseSize: 2,
	vignetting: 0.3,
	vignettingAlpha: 0.6,
	vignettingBlur: 0.3,
});
uiApp.stage.filters = [crtFilter];
//old television filter

window.WebFontConfig = {
	google: {
		families: ["Silkscreen", "Orbitron", "DynaPuff"],
	},

	active() {
		titleStyle = new PIXI.TextStyle({
			fontFamily: "Silkscreen",
			fontSize: 18,
			fill: "#ffffff",
		});

		infoStyle = new PIXI.TextStyle({
			fontFamily: "DynaPuff",
			fontSize: 14,
			fontWeight: 400,
			lineJoin: "round",
			stroke: "#888caf",
			fill: "#fcfcf3",
			strokeThickness: 5,
			leading: 3,
			letterSpacing: 1,
			wordWrap: true,
			wordWrapWidth: uiSize * 0.41,
			breakWords: true,
		});

		initFont = true;
	},
};
// Load them google fonts before starting...!

(function () {
	const wf = document.createElement("script");
	wf.src = `${
		document.location.protocol === "https:" ? "https" : "http"
	}://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js`;
	wf.type = "text/javascript";
	wf.async = "true";
	const s = document.getElementsByTagName("script")[0];
	s.parentNode.insertBefore(wf, s);
})();
// include the web-font loader script

// console.log("ui elements name: " + Object.keys(textInfo.uiElesInfo));
//display all the names of ui eles in console

uiApp.loader.baseUrl = "/images/";
//the folder carring all the imgs
for (const uiEle in textInfo.uiElesInfo) {
	uiApp.loader.add(uiEle, textInfo.uiElesInfo[uiEle].localUrl);
	// console.log(uiEle, textInfo.uiElesInfo[uiEle].localUrl);
}
//load all the ui eles imgs accrodong to text json

for (const itemBubb in textInfo.itemBubbInfo) {
	uiApp.loader.add(itemBubb, textInfo.itemBubbInfo[itemBubb].localUrl);
}
//load all the item bubble imgs accrodong to text json

export default function getCanvasUI(detector) {
	uiApp.loader.load((_, resources) => {
		//load function will be executed after the resources all have been loaded
		//its is a promise function so this whole block wont be executed immediately at first

		uiEleImgs.uiBg = PIXI.Sprite.from(resources.uiBg.texture);

		uiEleImgs.uiBigBubble = PIXI.Sprite.from(resources.uiBigBubble.texture);
		uiEleImgs.uiBigBubble.anchor.set(0.5);
		uiEleImgs.uiBigBubble.setTransform(bubblePos.x, bubblePos.y);

		uiEleImgs.uiEntrance = PIXI.Sprite.from(resources.uiExclamation.texture);
		uiEleImgs.uiEntrance.anchor.set(0.5);
		uiEleImgs.uiEntrance.setTransform(bubblePos.x, bubblePos.y);

		uiEleImgs.uiTopBar = PIXI.Sprite.from(resources.uiTopBar.texture);

		uiEleImgs.uiState0Arrow = PIXI.Sprite.from(resources.uiState0Arrow.texture);
		uiEleImgs.uiState0Arrow.anchor.set(0.5);
		uiEleImgs.uiState0Arrow.setTransform(uiSize * 0.345, uiSize * 0.078);

		uiEleImgs.uiState1Arrow = PIXI.Sprite.from(resources.uiState1Arrow.texture);
		uiEleImgs.uiState1Arrow.anchor.set(0.5);
		uiEleImgs.uiState1Arrow.setTransform(uiSize * 0.8, uiSize / 2);
		uiEleImgs.uiState1Arrow.alpha = 0;

		uiApp.stage.addChild(
			uiEleImgs.uiBg,
			uiEleImgs.uiBigBubble,
			uiEleImgs.uiEntrance,
			uiEleImgs.uiState0Arrow,
			uiEleImgs.uiState1Arrow
		);
		//set the positions of ui background

		uiEleImgs.uiReelMask = PIXI.Sprite.from(resources.uiReelMask.texture);
		uiEleImgs.uiReelMask.renderable = false;
		uiInfoMachine.addChild(uiEleImgs.uiReelMask);

		const uiEleNum = Object.keys(textInfo.uiElesInfo).length;
		//get the number of ui elements from json
		let index = -uiEleNum;
		for (const res in resources) {
			if (index >= 0) {
				itemBubbles[index] = {
					i: index,
					name: res.replace(/([A-Z])/g, " $1").toUpperCase(),
					//get the property keys (names) of an object as a string array, manipulate the string
					//insert space before capital letters and turn all letters into capital
					searchName: textInfo.itemBubbInfo[res].searchName,
					img: PIXI.Sprite.from(resources[res].texture),
					introInfo: textInfo.itemBubbInfo[res].introInfo,
					heartImg: PIXI.Sprite.from(resources.uiHeart.texture),
					beloved: false,
				};
			}
			index++;
			//index++ and if (index >= 0) mean starts from the item bubble imgs (which are queued later in array) instead of ui eles
		}
		//load all the item bubble imgs from resources filling into an array packed of objects with
		//name, searchName, sprite, intro text and i(index)

		chosenItemName = itemBubbles[4].name;
		chosenItemSearchName = itemBubbles[4].searchName;
		chosenItemInfo = itemBubbles[4].introInfo;
		initTextInfo = true;
		//initialize chosen item (index = 4) info and tell the get reel functions to start working

		for (const itemBubble of itemBubbles) {
			itemBubble.img.anchor.set(0.5);
			uiApp.stage.addChild(itemBubble.img);
			itemBubble.img.addChild(itemBubble.heartImg);
			itemBubble.heartImg.alpha = 0;
			itemBubble.heartImg.position.set(15, 19);
		}
		updateBubblePos(0);
		//initialize the layout and opacity of each bubble img

		uiEleImgs.uiRotatingScan = PIXI.Sprite.from(
			resources.uiRotatingScan.texture
		);
		uiEleImgs.uiRotatingScan.anchor.set(0.5);
		uiEleImgs.uiRotatingScan.setTransform(uiSize * 0.596, uiSize * 0.501);
		//load the uiRotatingScan img from resources and set the sprite anchor to center

		scanFilter.blendMode = PIXI.BLEND_MODES.ADD;
		scanFilter.beginFill(0x201035);
		scanFilter.drawCircle(uiSize * 0.104, 0, uiSize * 0.065);
		scanFilter.endFill();
		//draw the filter circle to lighten the chosen bubble

		uiEleImgs.uiRotatingScan.addChild(scanFilter);
		//integrate filter graph to scan img to rotate them together later

		uiEleImgs.uiInfoBoard = PIXI.Sprite.from(resources.uiInfoBoard.texture);
		uiEleImgs.uiInfoBoard.setTransform(uiSize * 0.04, uiSize * 0.09);
		//load info board img and set the position

		uiInfoMachine.addChild(uiEleImgs.uiRotatingScan, uiEleImgs.uiInfoBoard);
		//put scan and info board together in a contatiner called uiInfoMachine
		uiInfoMachine.pivot.set(0, (uiInfoMachine.height * 2) / 3);
		uiInfoMachine.position.set(0, (uiInfoMachine.height * 2) / 3);

		uiApp.stage.addChild(uiInfoMachine, uiEleImgs.uiTopBar);

		detector.on("ButtonLeft", () => {
			if (uiState == 1) {
				gsap.to(uiEleImgs.uiRotatingScan, {
					duration: 1.1,
					angle: 0,
					ease: "elastic",
				}); //rotate scan
				gsap.to(uiEleImgs.uiState0Arrow, { duration: 0.2, alpha: 1 }); //arrow0 appears
				gsap.to(uiInfoMachine.scale, {
					duration: 1,
					x: 1,
					y: 1,
					ease: "elastic",
				});
				uiEleImgs.uiState1Arrow.alpha = 0; //arrow1 disappears
				itemChange = true; //to reset reel img, item name and info display
				headTextUpdate(0);
			}
			//ui state 1 to 0

			if (uiState == 2) {
				gsap.to(uiEleImgs.uiState1Arrow, {
					delay: 0.15,
					duration: 0.2,
					alpha: 1,
				});
				gsap.to(uiInfoMachine, { duration: 0.25, x: 0, alpha: 1 });
				gsap.to(uiEleImgs.uiBigBubble, {
					duration: 0.4,
					x: bubblePos.x,
					ease: "power3",
					onUpdate: () => {
						uiEleImgs.uiEntrance.setTransform(
							uiEleImgs.uiBigBubble.x,
							uiEleImgs.uiBigBubble.y
						);
					},
				});
				gsap.to(uiEleImgs.uiBigBubble.scale, {
					duration: 1,
					x: 1,
					y: 1,
					ease: "elastic",
				});
				updateBubblePos(0);
				headTextUpdate(1);
				updateSelectedBubblesTrans(1);
			}
			//ui state 2 to 1: make the arrow2 appear

			uiState--;
			//change ui state
			if (uiState < 0) uiState = 0;
			//limit state num
		});

		detector.on("ButtonRight", () => {
			if (uiState == 0) {
				gsap.to(uiEleImgs.uiRotatingScan, {
					duration: 0.6,
					angle: -105,
					ease: "bounce",
				});
				gsap.to(uiEleImgs.uiState1Arrow, { duration: 0.2, alpha: 1 });
				gsap.to(uiInfoMachine.scale, {
					duration: 1,
					x: 0.97,
					y: 0.97,
					ease: "elastic",
				});
				uiEleImgs.uiState0Arrow.alpha = 0;
				headTextUpdate(1);
			}
			//ui state 0 to 1
			if (uiState == 1) {
				uiEleImgs.uiState1Arrow.alpha = 0;
				gsap.to(uiInfoMachine, { duration: 0.3, x: -500, alpha: 0 });
				gsap.to(uiEleImgs.uiBigBubble, {
					duration: 0.35,
					x: uiSize / 2,
					ease: "slow",
					onUpdate: () => {
						uiEleImgs.uiEntrance.setTransform(
							uiEleImgs.uiBigBubble.x,
							uiEleImgs.uiBigBubble.y
						);
					},
				});
				gsap.to(uiEleImgs.uiBigBubble.scale, {
					duration: 1,
					x: 1.3,
					y: 1.3,
					ease: "elastic",
				});
				bubblesFadeOut();
				headTextUpdate(2);
				updateSelectedBubblesTrans(2);
			}
			//ui state 1 to 2

			if (uiState == 2 && chosenAmount > 0) {
				detector.modalHandler.showModal();
			}

			uiState++;
			//change ui state
			if (uiState > 2) uiState = 2;
			//limit state num
		});

		detector.on("ButtonDown", () => {
			if (uiState == 1) {
				updateBubblePos(1);
			}
			//only if the ui state is 1 can the bubbles be moved
			if (uiState == 0) itemInfoScroll(-1);
		});

		detector.on("ButtonUp", () => {
			if (uiState == 1) {
				updateBubblePos(-1);
			}
			//only if the ui state is 1 can the bubbles be moved
			if (uiState == 0) itemInfoScroll(1);
		});

		detector.on("ButtonSelect", () => {
			if (uiState == 1) {
				chosenItem.beloved = !chosenItem.beloved;
				if (chosenItem.beloved && chosenAmount < 5) {
					const selectedBubble = PIXI.Sprite.from(chosenItem.img.texture);
					selectedBubble.name = chosenItem.name;
					selectedBubble.anchor.set(0.5);
					selectedBubble.x = -bubblePos.r;
					uiEleImgs.uiBigBubble.addChild(selectedBubble);
					updateSelectedBubblesTrans(1);
					gsap.to(chosenItem.heartImg, { duration: 0.2, alpha: 1 });
					chosenAmount++;
				}
				if (!chosenItem.beloved && chosenAmount > 0) {
					for (let item of uiEleImgs.uiBigBubble.children) {
						if (item.name === chosenItem.name) {
							gsap.to(item.scale, { duration: 1, x: 0, y: 0, ease: "power3" });
							gsap.to(item, {
								duration: 0.25,
								alpha: 0,
								ease: "power3",
								onComplete: () => {
									item.destroy();
									updateSelectedBubblesTrans(1);
								},
							});
							gsap.to(chosenItem.heartImg, { duration: 0.3, alpha: 0 });
							chosenAmount--;
						}
					}
				}
				if (chosenAmount > 0)
					uiEleImgs.uiEntrance.texture = resources.uiPlay.texture;
				else uiEleImgs.uiEntrance.texture = resources.uiExclamation.texture;
			}
		});
		//temporarily use html button events to test those interactive ui functions
	});

	let time = 0; //start to count the current time
	let initRad = 0;
	uiApp.ticker.add((deltaTime) => {
		// animation code needs loop
		crtFilter.time = time * 0.08;
		crtFilter.seed = Math.random(0, 10);
		if (itemChange && initTextInfo && initFont) {
			if (textDisplayFirstTime) {
				headTextUpdate(0);
				//init the headText contet
				const infoImgsText = new PIXI.Text("IMGS / INFO", titleStyle);
				infoImgsText.setTransform(
					uiSize * 0.025,
					uiSize * 0.413,
					1,
					1.1,
					-Math.PI / 2
				);
				uiEleImgs.uiInfoBoard.addChild(infoImgsText);
				//init the info/imgs title text
				textDisplayFirstTime = false;
			}

			getItemImgs(chosenItemSearchName);
			itemNameDisplayUpdate();
			itemInfoUpdate();
			itemChange = false;
			//animate head text tilt texture and chosen item name(if needs)
		}
		if (resetImgSizes) {
			if (checkLoad()) {
				setImgs();
				resetImgSizes = false;
				reelAmiStarts = true;
			}
		}
		if (reelAmiStarts) {
			reelImgsTiling.tilePosition.x += deltaTime;
		}
		if (initTextInfo && initFont) {
			headTiling.tilePosition.x -= deltaTime * 1.8;
			itemNameTiling.tilePosition.x -= deltaTime * 0.9;
			// const colorT = (Math.cos(time * 0.1) + 1) * 0.5;
			const colorT = Math.abs(((time * 0.03) % 2) - 1); //triangle wave between 0 and 1
			const color = [
				lerp(0, 255, colorT) / 255,
				lerp(255, 0, colorT) / 255,
				lerp(0, 255, colorT) / 255,
			];
			headTiling.tint = PIXI.utils.rgb2hex(color);
			//animates the rolling headline tilt texture
		}

		if (
			uiState === 2 &&
			uiEleImgs.uiBigBubble.children.length > 0 &&
			bubbleRotateStarts
		) {
			const numSeBu = uiEleImgs.uiBigBubble.children.length;
			const changingUniRad = (Math.PI * 2) / numSeBu;
			for (let i = 0; i < numSeBu; i++) {
				const curX = -Math.sin(changingUniRad * i + initRad) * 185;
				const curY = -Math.cos(changingUniRad * i + initRad) * 185;
				const unitWave = initRad * 8 + ((Math.PI * 2) / numSeBu) * i;
				uiEleImgs.uiBigBubble.children[i].setTransform(
					curX,
					curY,
					Math.sin(unitWave) * 0.03 + 1,
					Math.sin(unitWave) * 0.03 + 1
				);
			}
			initRad -= deltaTime * 0.003;
		} else initRad = 0;

		if (chosenAmount > 0)
			uiEleImgs.uiEntrance.scale.set(Math.sin(time * 0.1) * 0.06 + 1.3);

		time += deltaTime;
	});

	async function getItemImgs(nameString) {
		// const response = await fetch("http://localhost:3000/api/" + nameString);
		// in local dev mode using the local server url

		const response = await fetch("/api/" + nameString);
		// in deployed version useing serverless function, the same origin url

		itemImgUrls = await response.json();
		//get json format from the respose object (must be done when using fetch)
		itemImgUrls = itemImgUrls.filter(Boolean);
		//filter out the null elements to make sure all the url results are valid
		itemImgs.length = 0;
		for (let i = 0; i < itemImgUrls.length; i++) {
			itemImgs[i] = await PIXI.Sprite.from(itemImgUrls[i]);
		}
		resetImgSizes = true;
	}

	const updateBubblePos = (upDownCounts) => {
		for (const bubbleObj of itemBubbles) {
			bubbleObj.i = bubbleObj.i + upDownCounts;
			if (bubbleObj.i >= itemBubbles.length)
				bubbleObj.i = bubbleObj.i % itemBubbles.length;
			else if (bubbleObj.i < 0) bubbleObj.i = bubbleObj.i + itemBubbles.length;
			//cuz index decides the bubble positions in the scrolling
			//when bubble index > length then reset it to count from 0
			//and when bubble index reaches negative then + length to put it in the later position of queue

			if (bubbleObj.i > 8) {
				bubbleObj.img.x = bubblePos.x;
				bubbleObj.img.y = uiSize / 2;
			} else {
				const newX =
					bubblePos.x - Math.sin((Math.PI / 8) * bubbleObj.i) * bubblePos.r;
				const newY =
					bubblePos.y - Math.cos((Math.PI / 8) * bubbleObj.i) * bubblePos.r;
				gsap.to(bubbleObj.img, {
					duration: 0.35,
					x: newX,
					y: newY,
					ease: "power3",
				});
			}
			//figure out the position of each item bubble according to its current index

			if (bubbleObj.i == 4) {
				gsap.to(bubbleObj.img, { duration: 0.4, alpha: 1 });
				chosenItem = bubbleObj;
				chosenItemSearchName = bubbleObj.searchName;
				chosenItemName = bubbleObj.name;
				chosenItemInfo = bubbleObj.introInfo;
			} else gsap.to(bubbleObj.img, { duration: 0.4, alpha: 0.65 });
			//get the number 4 item name which is chosen by the scan, and set all opacity
		}
		console.log(chosenItemName);
	};

	const bubblesFadeOut = () => {
		for (const bubbleObj of itemBubbles) {
			if (bubbleObj.i >= 0 && bubbleObj.i <= 8) {
				const newX =
					bubblePos.x -
					Math.sin((Math.PI / 8) * bubbleObj.i) * (bubblePos.r + 150);
				const newY =
					bubblePos.y -
					Math.cos((Math.PI / 8) * bubbleObj.i) * (bubblePos.r + 150);
				gsap.to(bubbleObj.img, {
					duration: 0.6,
					x: newX - 400,
					y: newY,
					alpha: 0,
					ease: "power3",
				});
			} else bubbleObj.img.alpha = 0;
		}
	};

	const checkLoad = () => {
		let ifLoad = [];
		for (let i = 0; i < itemImgs.length; i++) {
			if (itemImgs[i].width > 1) ifLoad[i] = true;
			else break;
		}
		if (ifLoad[itemImgs.length - 1] === true) return true;
	};

	const setImgs = () => {
		reelFrame.clear();
		const reelContainer = new PIXI.Container();

		let widthTotal = 0;
		for (let i = 0; i < itemImgs.length; i++) {
			const factor = reelSize.height / itemImgs[i].height;
			itemImgs[i].height = reelSize.height;
			itemImgs[i].width *= factor;
			itemImgs[i].width = Math.floor(itemImgs[i].width);
			if (i === 0) {
				itemImgs[i].x = 0;
			} else {
				itemImgs[i].x = itemImgs[i - 1].x + itemImgs[i - 1].width;
			}
			itemImgs[i].y = 0;
			reelFrame.lineStyle(2, 0xffffff, 1, 0);
			reelFrame.drawRect(
				itemImgs[i].x,
				itemImgs[i].y,
				itemImgs[i].width,
				itemImgs[i].height
			);

			widthTotal += itemImgs[i].width;
			reelContainer.addChild(itemImgs[i]);
		}

		reelContainer.addChild(reelFrame);

		const reelTex = PIXI.RenderTexture.create({
			width: widthTotal,
			height: reelSize.height,
		});
		uiApp.renderer.render(reelContainer, reelTex);

		reelImgsTiling = new PIXI.TilingSprite(
			reelTex,
			reelSize.width,
			reelSize.height
		);
		reelImgsTiling.y = reelSize.y;
		reelImgsTiling.mask = uiEleImgs.uiReelMask;
		reelImgsTiling.blendMode = PIXI.BLEND_MODES.SCREEN;
		reelImgsTiling.alpha = 0.9;

		uiInfoMachine.addChild(reelImgsTiling);
		//when it is first time just add the reel directly
		if (cullTimes > 0) {
			const length = uiInfoMachine.children.length;
			gsap.from(uiInfoMachine.children[length - 1], {
				duration: 0.4,
				alpha: 0,
			});
			gsap.to(uiInfoMachine.children[length - 2], {
				duration: 0.6,
				alpha: 0,
				onComplete: () => {
					uiInfoMachine.removeChildAt(length - 2);
				},
			});
			//manipulate the alpha of the new and old reels to fade in and fade out when reel restarts
			//from the second time, after adding the new reel,cull the old one in the container
			//will wait until the fading animation is completed to be executed
		}
		cullTimes++;
		//counts which time it is
	};

	const headTextUpdate = (nextUiState) => {
		const headText = new PIXI.Text();
		headText.style = titleStyle;
		if (nextUiState === 0) headText.text = textInfo.headInfo.state0Text;
		else if (nextUiState === 1) headText.text = textInfo.headInfo.state1Text;
		else if (nextUiState === 2) headText.text = textInfo.headInfo.state2Text;

		if (uiEleImgs.uiTopBar.children.length > 0)
			uiEleImgs.uiTopBar.removeChild(headTiling);

		headTiling = new PIXI.TilingSprite(
			headText.texture,
			uiSize * 0.77,
			headText.height
		);
		uiEleImgs.uiTopBar.addChild(headTiling);
		// headTiling.position.x = uiSize * 0.11;
		headTiling.setTransform(uiSize * 0.11, uiSize * -0.001, 0, 1.1);
		headTiling.blendMode = PIXI.BLEND_MODES.ADD;
	};

	const itemNameDisplayUpdate = () => {
		const itemNameText = new PIXI.Text(chosenItemName + "     ", titleStyle);

		if (uiEleImgs.uiInfoBoard.children.length > 1)
			uiEleImgs.uiInfoBoard.removeChild(itemNameTiling);
		itemNameTiling = new PIXI.TilingSprite(
			itemNameText.texture,
			uiSize * 0.22,
			itemNameText.height
		);
		uiEleImgs.uiInfoBoard.addChild(itemNameTiling);
		itemNameTiling.setTransform(uiSize * 0.188, uiSize * 0.019, 1, 0.9);
	};

	const itemInfoUpdate = () => {
		if (uiEleImgs.uiInfoBoard.children.length > 2) {
			const oldItemInfoTiling =
				uiEleImgs.uiInfoBoard.removeChild(itemInfoTiling);
			uiEleImgs.uiInfoBoard.addChild(oldItemInfoTiling);
			gsap.to(oldItemInfoTiling, {
				delay: 0.3,
				duration: 0.8,
				alpha: 0,
				onComplete: () => {
					uiEleImgs.uiInfoBoard.removeChild(oldItemInfoTiling);
				},
			});
		}

		itemInfoText = new PIXI.Text(chosenItemInfo, infoStyle);
		itemInfoTiling = new PIXI.TilingSprite(
			itemInfoText.texture,
			itemInfoText.width,
			uiSize * 0.553
		);
		uiEleImgs.uiInfoBoard.addChild(itemInfoTiling);
		itemInfoTiling.setTransform(uiSize * 0.1, uiSize * 0.08);
		gsap.from(itemInfoTiling, { delay: 0.3, duration: 1, alpha: 0 });
	};

	const itemInfoScroll = (unitMove) => {
		const newY = itemInfoTiling.tilePosition.y + unitMove * 40;
		const bottomLineY = -(itemInfoText.height - itemInfoTiling.height - 60);
		gsap.to(itemInfoTiling.tilePosition, {
			duration: 0.2,
			y: newY,
			onComplete: () => {
				if (itemInfoTiling.tilePosition.y > 0) {
					gsap.to(itemInfoTiling.tilePosition, { duration: 0.1, y: 0 });
				} else if (itemInfoTiling.tilePosition.y < bottomLineY) {
					gsap.to(itemInfoTiling.tilePosition, {
						duration: 0.1,
						y: bottomLineY,
					});
				}
			},
		});
	};

	const updateSelectedBubblesTrans = (uiState) => {
		const numBub = uiEleImgs.uiBigBubble.children.length;

		if (uiState == 1 && numBub > 0) {
			bubbleRotateStarts = false;
			for (let i = 0; i < numBub; i++) {
				const curX = -Math.sin((Math.PI / 9) * i + (Math.PI * 5) / 18) * 200;
				const curY = -Math.cos((Math.PI / 9) * i + (Math.PI * 5) / 18) * 200;
				gsap.to(uiEleImgs.uiBigBubble.children[i], {
					delay: 0.02,
					duration: 0.3,
					x: curX,
					y: curY,
					alpha: 0.6,
					ease: "power4",
				});
				gsap.to(uiEleImgs.uiBigBubble.children[i].scale, {
					delay: 0.02,
					duration: 0.6,
					x: 0.65,
					y: 0.65,
					ease: "back",
				});
			}
		} else if (uiState == 2 && numBub > 0) {
			const unitRad = (Math.PI * 2) / numBub;
			for (let i = 0; i < numBub; i++) {
				const curX = -Math.sin(unitRad * i) * 185;
				const curY = -Math.cos(unitRad * i) * 185;
				gsap.to(uiEleImgs.uiBigBubble.children[i], {
					delay: 0.05,
					duration: 0.5,
					x: curX,
					y: curY,
					alpha: 0.9,
					ease: "power4",
					onComplete: () => {
						bubbleRotateStarts = true;
					},
				});
				gsap.to(uiEleImgs.uiBigBubble.children[i].scale, {
					delay: 0.05,
					duration: 0.6,
					x: 1,
					y: 1,
					ease: "back",
				});
			}
		}
	};

	return canvasUI.canvas;
}
