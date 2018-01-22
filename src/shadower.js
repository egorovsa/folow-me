import './css/shadower.styl';

import {FollowPlayer} from './shadower-player';
import {VisualLoging} from './visual-loging';

export {FollowPlayer};
export {VisualLoging};

export class Follow {
	constructor(initialObject) {
		this.followContainer = initialObject.followContainerId ? document.getElementById(initialObject.followContainerId) : null;

		this.fields = initialObject.id.map((id) => {
			return document.getElementById(id);
		});

		this.fields.push(this.followContainer);
		this.logContainer = initialObject.logContainer;
		this.followWindowEvents = initialObject.followWindowEvents ? initialObject.followWindowEvents : false;
		this.pasteEvent = initialObject.pasteEvent ? initialObject.pasteEvent : false;
		this.sendRequests = initialObject.sendRequests ? initialObject.sendRequests : false;
		this.apiUrl = initialObject.apiUrl;
		this.timestart = 0;
		this.newObjectCb = initialObject.newObjectCb ? initialObject.newObjectCb : null;
		this.started = false;

		this.followEvents = initialObject.followEvents ? initialObject.followEvents : [
			'keyup',
		];
	}

	start() {
		this.timestart = Date.now();
		this.appendEventer();
		this.started = true;
	}

	stop() {
		this.started = false;
		this.removeEventer();
		this.timestart = 0;
	}

	isRecord() {
		return this.started;
	}

	appendEventer() {
		this.followEvents.forEach((event) => {
			this.fields.forEach((field) => {
				field.addEventListener(event, this.sendEvent);
			})
		});

		if (this.pasteEvent) {
			this.fields.forEach((field) => {
				field.addEventListener('paste', this.pasteHandler, false);
			});
		}

		if (this.followWindowEvents) {
			window.addEventListener('blur', this.sendEvent);
			window.addEventListener('focus', this.sendEvent);
			this.followContainer.addEventListener('mousemove', this.sendEvent);
			window.addEventListener('scroll', this.sendEvent);
		}
	}

	removeEventer() {
		this.followEvents.forEach((event) => {
			this.fields.forEach((field) => {
				field.removeEventListener(event, this.sendEvent);
			})
		});

		if (this.pasteEvent) {
			this.fields.forEach((field) => {
				field.removeEventListener('paste', this.pasteHandler, false);
			});
		}

		if (this.followWindowEvents) {
			window.removeEventListener('blur', this.sendEvent);
			window.removeEventListener('focus', this.sendEvent);
			this.followContainer.removeEventListener('mousemove', this.sendEvent);
			window.removeEventListener('scroll', this.sendEvent);
		}
	}

	getKeyMap(e) {
		let commandKey = e.metaKey;
		let ctrlKey = e.ctrlKey;
		let altKey = e.ctrlKey;
		let shiftKey = e.shiftKey;
		let key = e.key;
		let shortCut = '';

		let isKeyMeta = e.key === 'Shift' || e.key === 'Meta' || e.key === 'Ctrl' || e.key === 'Alt';

		if (key && (shiftKey || ctrlKey || commandKey || altKey) && !isKeyMeta) {
			shortCut += commandKey ? 'Cmd+' : '';
			shortCut += shiftKey ? 'Shift+' : '';
			shortCut += ctrlKey ? 'Ctrl+' : '';
			shortCut += altKey ? 'Alt+' : '';
			shortCut += key;
		}

		return shortCut;
	}

	prepareEventObject(e, customEvent, customData) {
		let dateNow = Date.now();
		let type = customEvent ? customEvent : e.type;
		let tag = e.target.tagName ? e.target.tagName : 'window';

		let object = {
			objectId: e.target.id ? e.target.id : null,
			tag: tag,
			type: type,
			timeSpent: this.getEventTimeMs(dateNow),
			startTime: this.timestart,
			eventTime: dateNow,
			offsetX: e.clientX ? e.clientX - this.followContainer.offsetLeft : null,
			offsetY: e.clientY ? e.clientY - this.followContainer.offsetTop : null,
			isBackspace: !!(e.keyCode && e.keyCode === 8),
			isDelete: !!(e.keyCode && e.keyCode === 46),
			isShiftDelete: !!(e.shiftKey && e.keyCode === 46),
			isShiftBackspace: !!(e.shiftKey && e.keyCode === 8),
			isCtrlX: !!(e.ctrlKey && e.keyCode === 88) || !!(e.metaKey && e.keyCode === 88),
			copyPastedData: customData ? customData : null,
			symbol: e.type === 'keyup' && e.key ? e.key : null,
			scrollTop: window.pageYOffset,
			scrollLeft: window.pageXOffset,
			value: type === 'keyup' ? e.target.value : '',
			shortCut: this.getKeyMap(e),
			// e: e
		};

		if (this.newObjectCb) {
			this.newObjectCb(object);
		}

		return object;
	}

	sendEvent = (e, customEvent, customData) => {
		let preparedObject = this.prepareEventObject(e, customEvent, customData);

		if (this.sendRequests) {
			let xhr = new XMLHttpRequest();

			xhr.open('POST', this.apiUrl, true);
			xhr.send(JSON.stringify(preparedObject)); // (1)

			xhr.onreadystatechange = function () { // (3)
				if (xhr.readyState != 4) return;

				if (xhr.status != 200) {
					// alert(xhr.status + ': ' + xhr.statusText);
				} else {
					// alert(xhr.responseText);
				}

			}
		}
	};

	getEventTimeMs(dateNow) {
		return dateNow - this.timestart;
	}

	pasteHandler = (e) => {
		if (e.clipboardData && e.clipboardData.getData) {
			let pastedText = "";

			if (window.clipboardData && window.clipboardData.getData) { // IE
				pastedText = window.clipboardData.getData('Text');
			} else if (e.clipboardData && e.clipboardData.getData) {
				pastedText = e.clipboardData.getData('text/plain');
			}

			this.sendEvent(e, 'paste', pastedText);
		}
	};
}
