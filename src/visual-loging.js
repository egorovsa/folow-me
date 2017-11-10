import './css/shadower.styl';

export class VisualLoging {
	constructor(container) {
		this.logContainer = container;
		this.logObjects = [];
		//
		// document.getElementById('getData').addEventListener('click', () => {
		// 	console.log(JSON.stringify(this.logObjects));
		// });
	}

	appendNew(object) {
		this.logObjects.push(object);
		this.render();
	}

	getMousePosition() {
		let html = '';

		for (let i = 0; i < this.logObjects.length - 1; i++) {
			if (this.logObjects[i].type === 'mousemove') {
				html = `
					<div class="shadower-visual-loging">
						<div class="shadower-log active">
							<div class="shadower-log-type"><span>MOUSE MOVE:</span></div>
							<div class=""><span>PositionX:</span> ${this.logObjects[i].offsetX}</div>
							<div class=""><span>PositionY:</span> ${this.logObjects[i].offsetY}</div>
						</div>		 
					</div>
				`;
			}
		}

		return html;
	}

	getScrollosition() {
		let html = '';

		for (let i = 0; i < this.logObjects.length - 1; i++) {
			if (this.logObjects[i].type === 'scroll') {
				html = `
					<div class="shadower-visual-loging">
						<div class="shadower-log active">
							<div class="shadower-log-type"><span>Window scroll:</span></div>
							<div class=""><span>PositionTop:</span> ${this.logObjects[i].scrollTop}</div>
							<div class=""><span>PositionLeft:</span> ${this.logObjects[i].scrollLeft}</div>
						</div>		 
					</div>
				`;
			}
		}

		return html;
	}

	getHtml() {
		let html = '';

		if (this.logObjects) {
			html = '<div class="shadower-visual-loging">';

			for (let i = this.logObjects.length - 1; i > 0; i--) {
				let className = 'active';


				if (Date.now() - this.logObjects[i].eventTime > 3000) {
					className = '';
				}

				if (Date.now() - this.logObjects[i].eventTime < 4500) {
					if (this.logObjects[i].type !== 'mousemove' && this.logObjects[i].type !== 'scroll') {
						html += `
							<div class="shadower-log ${className}">
								<div class="shadower-log-type"><span>TAG:</span> ${this.logObjects[i].tag}</div>
								<div class="shadower-log-type"><span>EventType:</span> ${this.logObjects[i].type}</div>
								<div class=""><span>Time spent:</span> ${this.logObjects[i].timeSpent}</div>
								<div class=""><span>Focused:</span> ${this.logObjects[i].isFocused}</div>
							`;

						if (this.logObjects[i].symbol) {
							html += `<div class="shadower-log-danger"><span>Symbol:</span> ${this.logObjects[i].symbol}</div>`
						}

						if (this.logObjects[i].copyPastedData) {
							html += `<div class="shadower-log-danger"><span>Paste data:</span> ${this.logObjects[i].copyPastedData}</div>`
						}

						html += '</div>'
					}
				}
			}
		}

		return html += '</div>';
	}

	render = () => {
		this.logContainer.innerHTML = this.getMousePosition() + this.getScrollosition() + this.getHtml();

		setTimeout(() => {
			this.render();
		}, 5000);
	}
}