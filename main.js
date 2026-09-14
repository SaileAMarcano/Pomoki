const { app, BrowserWindow } = require('electron');
const path = require('path');

function crearVentana() {
    const ventana = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1000,
        minHeight: 700,
        icon: path.join(__dirname, 'img/pksin.png'),
        title: 'POMOKI'
    });

    ventana.loadFile('index.html');
    ventana.setMenuBarVisibility(false);
}

app.whenReady().then(crearVentana);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});