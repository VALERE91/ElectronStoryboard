/* global ipc */
window.ipc = require('ipc');
document.addEventListener('DOMContentLoaded', function () {
    ipc.send('dom-ready');
});
