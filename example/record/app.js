var logger = new Shadower.VisualLoging(document.getElementById('divLog'));

var shadowInstance = new Shadower.Follow(
    {
        followContainerId: 'myFormContainer', // главный контейре в котором все происходит
        id: [  // массив ид полей за которыми следим
            'followTextarea',
            'firstInput'
        ],
        followWindowEvents: true, // следить за мышкой у уходом со страницы, короче глобальные эвенты
        apiUrl: 'http://ya.ru/', // куда отправлять запросы
        // смотри dataexample.json  такой объект будет тебе отправляться при каждом евенте.
        sendRequests: false, // отправлять или нет
        pasteEvent: true, // следить за вставкой текста
        followEvents: [
            'click',
            'focus',
            'blur',
            'keyup',
            'contextmenu',
        ],
        newObjectCb: function (object) { // колбек каждого события, возвращает каждый раз новое событие
            if (logger) {
                logger.appendNew(object);
            }
        }
    }
);

// это кнопка записи старт стоп
// можно запускать сразу без кнопки вызвав метод
// shadowInstance.start(); или остановить запись shadowInstance.stop();
var recButton = document.getElementById('record');

recButton.addEventListener('click', function () {
    if (shadowInstance.isRecord()) {
        shadowInstance.stop();
        recButton.className = 'sh-button';
    } else {
        recorded = [];
        shadowInstance.start();
        recButton.className = 'sh-button active';
    }
});


