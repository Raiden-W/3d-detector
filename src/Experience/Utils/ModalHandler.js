import Experience from "../Experience";

export default class ModalHandler {
	constructor() {
		this.experience = new Experience();
		this.time = this.experience.time;
		this.dialog = document.querySelector("dialog");
		this.dialog.addEventListener("cancel", (event) => {
			event.preventDefault();
		});

		this.closeBtn = document.querySelector(".close-dialog-btn");
		this.closeBtn.onclick = () => {
			this.closeModal();
		};
	}

	showModal() {
		this.dialog.showModal();
		this.time.pauseAni = true;
	}

	closeModal() {
		this.dialog.classList.add("hide");
		const dialogClose = () => {
			this.dialog.classList.remove("hide");
			this.dialog.close();
			this.time.pauseAni = false;
			this.dialog.removeEventListener("animationend", dialogClose, false);
			this.time.tick();
		};
		this.dialog.addEventListener("animationend", dialogClose, false);
	}
}
