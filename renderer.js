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

	// --- Validação 1: Campos Vazios ---
	if (!csvPath || !outputPath) {
		statusDiv.textContent = 'Please, select a CSV file and the destination folder.';
		statusDiv.style.color = 'red';
		return; // Sai da função, impedindo a execução
	}

	statusDiv.textContent = 'Generating...';
	statusDiv.style.color = 'black'; // Reseta a cor para o padrão
	generateButton.disabled = true;

	// Chama a função de geração no processo principal
	const result = await window.electronAPI.startGeneration({ csvPath, outputPath });

	if (result.success) {
		statusDiv.textContent = `Success: ${result.message}`;
		statusDiv.style.color = 'green';
	} else {
		statusDiv.textContent = `${result.message}`;
		statusDiv.style.color = 'red';
	}

	generateButton.disabled = false;
});

async function setAppVersion() {
	const versionDiv = document.getElementById('version');
	const version = await window.electronAPI.getAppVersion();
	if (version) {
		versionDiv.textContent = `v${version}`;
	}
}

document.addEventListener('DOMContentLoaded', () => {
	setAppVersion();
})
