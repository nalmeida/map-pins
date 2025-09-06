const selectCsvButton = document.getElementById('selectCsvButton');
const selectOutputButton = document.getElementById('selectOutputButton');
const generateButton = document.getElementById('generateButton');
const csvPathInput = document.getElementById('csvPath');
const outputPathInput = document.getElementById('outputPath');
const statusDiv = document.getElementById('status');

selectCsvButton.addEventListener('click', async () => {
	const filePath = await window.electronAPI.selectCsv();
	if (filePath) {
		csvPathInput.value = filePath;
	}
});

selectOutputButton.addEventListener('click', async () => {
	const folderPath = await window.electronAPI.selectOutputFolder();
	if (folderPath) {
		outputPathInput.value = folderPath;
	}
});

generateButton.addEventListener('click', async () => {
	const csvPath = csvPathInput.value;
	const outputPath = outputPathInput.value;

	if (!csvPath || !outputPath) {
		statusDiv.textContent = 'Por favor, selecione os caminhos de origem e destino.';
		return;
	}

	statusDiv.textContent = 'Iniciando a geração...';
	generateButton.disabled = true;

	const result = await window.electronAPI.startGeneration({ csvPath, outputPath });

	if (result.success) {
		statusDiv.textContent = `Sucesso: ${result.message}`;
	} else {
		statusDiv.textContent = `Falha: ${result.message}`;
		statusDiv.style.color = 'red';
	}

	generateButton.disabled = false;
});