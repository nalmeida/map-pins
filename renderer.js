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
		statusDiv.textContent = 'Please select the CSV file and the destination folder.';
		statusDiv.style.color = 'red';
		return;
	}

	statusDiv.textContent = 'Starting generation...';
	statusDiv.style.color = 'black';
	generateButton.disabled = true;

	const result = await window.electronAPI.startGeneration({ csvPath, outputPath });

	if (result.success) {
		statusDiv.innerHTML = '';
		statusDiv.style.color = 'green';

		const successMessage = document.createElement('span');
		successMessage.textContent = 'Maps generated!\n';

		const folderLink = document.createElement('a');
		folderLink.href = '#';
		folderLink.textContent = `Open folder: ${result.outputPath}`;

		folderLink.addEventListener('click', async (e) => {
			e.preventDefault();
			await window.electronAPI.openFolder(result.outputPath);
		});

		statusDiv.appendChild(successMessage);
		statusDiv.appendChild(folderLink);

	} else {
		statusDiv.innerHTML = '';
		statusDiv.style.color = 'red';
		statusDiv.textContent = `Failure: ${result.message}`;
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
