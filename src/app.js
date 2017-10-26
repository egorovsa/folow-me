var logger = new Shadower.VisualLoging(document.getElementById('divLog'));

var recorded = [];

var playerInstance = new Shadower.FollowPlayer({
	followContainerId: 'myFormContainer',
	shadowerNotificationId: 'shadowerNotification',
	records: [],
	startButtonId: 'start',
	pauseButtonId: 'pause',
	stopButtonId: 'stop',
	range: 'myRange',
	currentTimeMs: 0,
	speedRange: 'speedRange'
});

var shadowInstance = new Shadower.Folow(
	{
		followContainerId: 'myFormContainer',
		id: [
			'followTextarea',
			'firstInput'
		],
		followWindowEvents: true,
		apiUrl: 'http://ya.ru/',
		sendRequests: false,
		pasteEvent: true,
		followEvents: [
			'click',
			'focus',
			'blur',
			'keydown',
			'contextmenu',
		],
		newObjectCb: function (object) {
			recorded.push(object);

			if (logger) {
				logger.appendNew(object);
			}
		}
	}
);

var recButton = document.getElementById('record');

recButton.addEventListener('click', function () {
	if (shadowInstance.isRecord()) {
		shadowInstance.stop();
		recButton.innerHTML = 'REC';
		playerInstance.addRecord(recorded);
	} else {
		recorded = [];
		shadowInstance.start();
		recButton.innerHTML = 'STOP';
	}
});


// DATA EXAMPLE



