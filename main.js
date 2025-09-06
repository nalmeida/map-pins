const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { generateMultipleMapsFromCsv } = require('./generate');

const appVersion = app.getVersion();

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: false,
			contextIsolation: true
		}
	});

	mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

ipcMain.handle('select-file', async () => {
	const { filePaths } = await dialog.showOpenDialog({
		properties: ['openFile'],
		filters: [{ name: 'CSV Files', extensions: ['csv'] }]
	});
	return filePaths[0];
});

ipcMain.handle('select-folder', async () => {
	const { filePaths } = await dialog.showOpenDialog({
		properties: ['openDirectory']
	});
	return filePaths[0];
});

ipcMain.handle('start-generation', async (event, { csvPath, outputPath }) => {
	try {
		await generateMultipleMapsFromCsv(csvPath, outputPath);
		return { success: true, message: 'Maps generated!\n' + outputPath };
	} catch (error) {
		return { success: false, message: `Error: ${error.message}` };
	}
});

ipcMain.handle('get-app-version', () => {
	return appVersion;
});