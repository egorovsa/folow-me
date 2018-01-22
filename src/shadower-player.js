import rangeSlider from 'rangeslider-pure';
import './css/range-slider.styl';


export class FollowPlayer {
	constructor(options) {
		this.animationRequestId = null;
		this.followContainer = options.followContainerId ? document.getElementById(options.followContainerId) : null;
		this.shadowerNotification = options.shadowerNotificationId ? document.getElementById(options.shadowerNotificationId) : null;
		this.recordedObjects = options.records ? options.records : [];
		this.startButton = options.startButtonId ? document.getElementById(options.startButtonId) : null;
		this.pauseButton = options.pauseButtonId ? document.getElementById(options.pauseButtonId) : null;
		this.stopButton = options.stopButtonId ? document.getElementById(options.stopButtonId) : null;
		this.range = options.range ? document.getElementById(options.range) : null;
		this.speedRange = options.speedRange ? document.getElementById(options.speedRange) : null;
		this.currentTimeMs = options.currentTimeMs ? options.currentTimeMs : 0;
		this.startTime = null;
		this.setEvents();
		this.createMouse();
		this.started = false;

		this.notificationTimerId = null;
		this.rangeGrid = document.getElementById('rangeGrid') ? document.getElementById('rangeGrid') : null;
		this.currentSpeed = 10;
		this.currentRatioSpeed = 1;

		if (this.range) {
			rangeSlider.create(this.range, {
				polyfill: true,     // Boolean, if true, custom markup will be created
				rangeClass: 'rangeSlider',
				disabledClass: 'rangeSlider--disabled',
				fillClass: 'rangeSlider__fill',
				bufferClass: 'rangeSlider__buffer',
				handleClass: 'rangeSlider__handle',
				startEvent: ['mousedown', 'touchstart', 'pointerdown'],
				moveEvent: ['mousemove', 'touchmove', 'pointermove'],
				endEvent: ['mouseup', 'touchend', 'pointerup'],
				onSlide: (position, value) => {
					this.setStatePlayer(+position);
				}
			});

			this.updateRange();
		}

		if (this.speedRange) {

			rangeSlider.create(this.speedRange, {
				polyfill: true,     // Boolean, if true, custom markup will be created
				rangeClass: 'rangeSlider',
				disabledClass: 'rangeSlider--disabled',
				fillClass: 'rangeSlider__fill',
				bufferClass: 'rangeSlider__buffer',
				handleClass: 'rangeSlider__handle',
				startEvent: ['mousedown', 'touchstart', 'pointerdown'],
				moveEvent: ['mousemove', 'touchmove', 'pointermove'],
				endEvent: ['mouseup', 'touchend', 'pointerup'],
				onSlide: (position, value) => {
					this.currentRatioSpeed = +position;
					let title = document.getElementById('speedTitle');

					if (title) {
						title.innerHTML = position + 'x';
					}
				}
			});
		}
	}

	showNotification(text, danger) {
		if (this.shadowerNotification) {
			this.shadowerNotification.innerHTML = text;
			this.removeClass(this.shadowerNotification, 'danger');

			if (danger) {
				this.addClass(this.shadowerNotification, 'danger');
			}

			this.addClass(this.shadowerNotification, 'active');
			clearTimeout(this.notificationTimerId);

			this.notificationTimerId = setTimeout(() => {
				this.removeClass(this.shadowerNotification, 'active');
			}, 1500);
		}
	}

	setCurrentTimeMs(time) {
		this.currentTimeMs = time;

		this.range.rangeSlider.update({
			value: this.currentTimeMs
		}, true);
	}

	addRecord(record) {
		this.recordedObjects = record;
		this.updateRange();
	}

	toMMSS(secondsTotal) {
		secondsTotal = secondsTotal / 1000;

		let sec_num = parseInt(secondsTotal); // don't forget the second param
		let hours = Math.floor(sec_num / 3600);
		let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		let seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (minutes < 10) {
			minutes = "0" + minutes;
		}

		if (seconds < 10) {
			seconds = "0" + seconds;
		}

		return minutes + ':' + seconds;
	}

	getRangeChild(time) {
		let child = document.createElement('div');
		child.appendChild(document.createTextNode(this.toMMSS(time)));

		return child;
	}

	updateRange() {
		if (this.range) {

			let max = 0;

			if (this.recordedObjects.length > 0) {
				max = this.recordedObjects[this.recordedObjects.length - 1].timeSpent;
			}

			this.range.rangeSlider.update({
				min: 0,
				max: max,
				value: this.currentTimeMs
			}, true);

			this.setStatePlayer(this.currentTimeMs);

			if (this.rangeGrid) {
				let count = max > 5000 ? 5 : (max / 1000).toFixed(0);
				this.rangeGrid.innerHTML = '';

				if (count > 0) {
					let times = Math.round(parseInt(max) / 1000) / count;

					for (let i = 0; i <= count; i++) {
						this.rangeGrid.appendChild(this.getRangeChild(i * times * 1000));
					}
				}
			}
		}
	}

	hasClass(ele, cls) {
		return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	};

	addClass(ele, cls) {
		if (!this.hasClass(ele, cls)) {
			ele.className += " " + cls;
		}
	};

	removeClass(ele, cls) {
		if (this.hasClass(ele, cls)) {
			let reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');

			ele.className = ele.className.replace(reg, ' ');
		}
	};

	createMouse() {
		let mouse = document.createElement("div");
		mouse.id = 'mousePlay';
		mouse.className = 'shadower-player-mouse';
		mouse.innerHTML = '+';
		document.body.appendChild(mouse);
	}

	setStatePlayer = (value) => {
		if (+value === 0) {
			this.clearAddData();
		}

		this.currentTimeMs = +value;

		if (!this.started) {
			if (this.recordedObjects.length > 0) {
				this.playBlocks();
				this.playMouse();
			}
		}
	};

	setEvents() {
		if (this.startButton) {
			this.startButton.addEventListener('click', () => {
				this.start();
				this.clearAddData();
			});
		}

		if (this.pauseButton) {
			this.pauseButton.addEventListener('click', () => {
				this.pause();
			});
		}

		if (this.stopButton) {
			this.stopButton.addEventListener('click', () => {
				this.stop();
			});
		}


	}

	start = () => {
		if (this.recordedObjects) {
			if (!this.started) {
				this.addClass(this.startButton, 'active');
				this.started = true;
				this.render();
			}
		}
	};

	pause = () => {
		this.started = false;
		this.removeClass(this.startButton, 'active');
		clearTimeout(this.animationRequestId);
	};

	stop = () => {
		this.started = false;
		this.removeClass(this.startButton, 'active');
		this.currentTimeMs = 0;

		clearTimeout(this.animationRequestId);

		if (this.range) {
			this.range.rangeSlider.update({
				value: 0
			}, true);
		}
	};

	time = () => {
		this.currentTimeMs += (this.currentSpeed * this.currentRatioSpeed);

		if (this.range) {
			this.range.rangeSlider.update({
				value: this.currentTimeMs
			}, true);
		}

		this.animationRequestId = setTimeout(() => {
			this.render();
		}, 10);

		if (this.currentTimeMs >= this.recordedObjects[this.recordedObjects.length - 1].timeSpent) {
			this.stop();
		}
	};

	clearAddData() {
		this.recordedObjects.forEach((object) => {
			this.removeClass(document.body, 'shadower-focus');

			if (object.objectId) {
				let element = document.getElementById(object.objectId);

				this.removeClass(element, 'shadower-focus');
				this.removeClass(element, 'shadower-blur');
				element.value = '';
			}
		})
	};

	playMouse() {
		let followContainer = this.followContainer.getBoundingClientRect();
		let mouse = document.getElementById('mousePlay');
		let x = 0;
		let y = 0;
		let click = null;
		let rightClick = null;

		for (let i = 0; i < this.recordedObjects.length - 1; i++) {
			if (this.recordedObjects[i].timeSpent > this.currentTimeMs) {
				break;
			}

			if (this.recordedObjects[i].type === 'mousemove') {
				x = this.recordedObjects[i].offsetX + parseInt(followContainer.left);
				y = this.recordedObjects[i].offsetY + parseInt(followContainer.top);
			}

			if (this.recordedObjects[i].type === 'click') {
				rightClick = null;
				click = this.recordedObjects[i].timeSpent;
			}

			if (this.recordedObjects[i].type === 'contextmenu') {
				click = null;
				rightClick = this.recordedObjects[i].timeSpent;
			}
		}

		if (click && this.currentTimeMs - click > 500) {
			click = null;
		}

		if (rightClick && this.currentTimeMs - rightClick > 500) {
			rightClick = null;
		}

		mouse.style.transform = 'translate(' + x + 'px,' + y + 'px)';

		if (click) {
			mouse.className = 'shadower-player-mouse click';
		} else if (rightClick) {
			mouse.className = 'shadower-player-mouse right-click';
		} else {
			mouse.className = 'shadower-player-mouse';
		}
	}

	playBlocks() {
		let textObject = {};
		let focusObjects = {};
		let paste = {};

		for (let i = 0; i < this.recordedObjects.length - 1; i++) {
			if (this.recordedObjects[i].timeSpent > this.currentTimeMs) {
				break;
			}

			if (this.recordedObjects[i].type === 'paste') {
				paste = {
					timeSpent: this.recordedObjects[i].timeSpent,
					tag: this.recordedObjects[i].tag,
					pastedData: this.recordedObjects[i].copyPastedData
				}
			}

			if (
				this.recordedObjects[i].objectId &&
				this.recordedObjects[i].type === 'keyup'

			) {
				textObject[this.recordedObjects[i].objectId] = this.recordedObjects[i].value;
			}

			if (
				this.recordedObjects[i].type === 'focus' ||
				this.recordedObjects[i].type === 'blur'
			) {
				let name = 'window';
				let tag = 'window';
				let obj = document.body;
				let pasteData = '';

				if (this.recordedObjects[i].objectId) {
					obj = document.getElementById(this.recordedObjects[i].objectId);
					name = this.recordedObjects[i].objectId;
					tag = this.recordedObjects[i].tag;
					pasteData = this.recordedObjects[i].copyPastedData;
				}

				focusObjects[name] = {
					object: obj,
					type: this.recordedObjects[i].type,
					tag: tag,
					timeSpent: this.recordedObjects[i].timeSpent
				};
			}
		}

		if (paste && paste.timeSpent && this.currentTimeMs - paste.timeSpent > 200) {
			paste = {}
		}

		if (paste.timeSpent) {
			this.showNotification('Вставлен текст в: ' + paste.tag + ' (' + paste.pastedData + ') ', true);
		}

		for (let obj in focusObjects) {
			if (focusObjects[obj].type === 'focus' && this.currentTimeMs - focusObjects[obj].timeSpent < 200) {
				this.removeClass(focusObjects[obj].object, 'shadower-blur');
				this.addClass(focusObjects[obj].object, 'shadower-focus');
				// this.showNotification('Объект в фокусе: ' + focusObjects[obj].tag);
			}

			if (focusObjects[obj].type === 'blur' && this.currentTimeMs - focusObjects[obj].timeSpent < 200) {
				this.removeClass(focusObjects[obj].object, 'shadower-focus');
				this.addClass(focusObjects[obj].object, 'shadower-blur');
				this.showNotification('Покинул объект: ' + focusObjects[obj].tag, true);
			}
		}

		if (!focusObjects['window']) {
			this.removeClass(document.body, 'shadower-focus');
			this.removeClass(document.body, 'shadower-blur');
		}

		for (let obj in textObject) {
			let field = document.getElementById(obj);

			if (field.value !== textObject[obj]) {
				field.value = textObject[obj];
			}
		}
	}

	render() {
		if (this.recordedObjects.length > 0) {
			this.playBlocks();
			this.playMouse();
			this.time();
		}
	}
}