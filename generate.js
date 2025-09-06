const fs = require('fs');
const http = require('http');
const csv = require('csv-parser');
const puppeteer = require('puppeteer');
const path = require('path');

const PIN_COLOR = '#F2496B';
const PIN_SIZE = 24;
const MAP_WIDTH = 700;
const MAP_HEIGHT = 350;
const SERVER_PORT = 3000;

function createMapHtml(points) {
	const markersScript = points.map(point => {
		return `
			(function() {
				const marker = L.marker([${point.lat}, ${point.lng}], { icon: customIcon }).addTo(map);
				marker.bindPopup('<h3>${point.name}</h3><hr><small>📍 ${point.lat}, ${point.lng}</small>');
			})();
		`;
	}).join('');

	const boundsArray = points.map(point => `[${point.lat}, ${point.lng}]`).join(',\n');

	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<title>Map</title>
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
			<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
			<style>
				body, html {
					margin: 0;
					padding: 0;
				}
				#map {
					width: ${MAP_WIDTH}px;
					height: ${MAP_HEIGHT}px;
				}
			</style>
		</head>
		<body>
			<div id="map"></div>
			<script>
				const map = L.map('map', {
					zoomControl: false,
					attributionControl: false
				}).setView([${points[0].lat}, ${points[0].lng}], 13);
				
				L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(map);

				const customIcon = L.divIcon({
					className: 'custom-pin',
					html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${PIN_SIZE}" height="${PIN_SIZE}" fill="${PIN_COLOR}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
					iconSize: [${PIN_SIZE}, ${PIN_SIZE}],
					iconAnchor: [${PIN_SIZE / 2}, ${PIN_SIZE}],
					popupAnchor: [0, -20]
				});

				${markersScript}
				
				const bounds = L.latLngBounds([${boundsArray}]);
				map.fitBounds(bounds, { padding: [20, 20] });
			</script>
		</body>
		</html>
	`;
}

async function generateMultipleMapsFromCsv(filePath, outputPath) {
	const points = [];
	let browser;
	let server;

	try {
		const stream = fs.createReadStream(filePath)
			.pipe(csv())
			.on('data', (data) => {
				// Primeira validação: verifica se a linha tem as chaves esperadas.
				// Isso cobre o caso de CSV sem cabeçalho ou com cabeçalho incorreto.
				if (!data.map_id || !data.lat || !data.lng) {
					const error = new Error('O CSV está faltando as colunas obrigatórias: map_id, lat, lng. Verifique a primeira linha do arquivo.');
					stream.destroy(error);
					return;
				}
				points.push(data);
			})
			.on('headers', (headers) => {
				// Validação de cabeçalhos
				const requiredHeaders = ['map_id', 'lat', 'lng', 'name'];
				const hasRequiredHeaders = requiredHeaders.every(header => headers.includes(header));
				if (!hasRequiredHeaders) {
					const error = new Error(`Cabeçalhos do CSV inválidos. As colunas obrigatórias são: ${requiredHeaders.join(', ')}.`);
					stream.destroy(error);
				}
			});


		await new Promise((resolve, reject) => {
			stream.on('end', () => {
				// Validação de conteúdo: verifica se o arquivo não está vazio.
				if (points.length === 0) {
					reject(new Error('Nenhum ponto válido encontrado no CSV ou o arquivo está vazio.'));
				} else {
					resolve();
				}
			});
			stream.on('error', reject);
		});

		// Se o código chegou até aqui, os dados são válidos.
		console.log(`Carregados ${points.length} pontos do CSV.`);


		if (points.length === 0) {
			const error = new Error('Nenhum ponto válido encontrado no CSV.');
			console.error(error.message);
			throw error;
		}

		const mapsData = points.reduce((acc, point) => {
			if (!acc[point.map_id]) {
				acc[point.map_id] = [];
			}
			acc[point.map_id].push({ lat: point.lat, lng: point.lng, name: point.name });
			return acc;
		}, {});

		// Esta é a parte corrigida
		const mapIds = Object.keys(mapsData);

		if (!fs.existsSync(outputPath)) {
			fs.mkdirSync(outputPath, { recursive: true });
		}

		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});

		for (const mapId of mapIds) {
			const mapPoints = mapsData[mapId];

			server = http.createServer((req, res) => {
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.end(createMapHtml(mapPoints));
			});

			await new Promise((resolve) => server.listen(SERVER_PORT, '127.0.0.1', () => {
				console.log(`Servidor iniciado para o mapa '${mapId}' em http://127.0.0.1:${SERVER_PORT}`);
				resolve();
			}));

			const page = await browser.newPage();
			await page.setCacheEnabled(false);

			await page.goto(`http://127.0.0.1:${SERVER_PORT}`, { waitUntil: 'networkidle0' });
			await page.setViewport({ width: MAP_WIDTH, height: MAP_HEIGHT });
			await new Promise(resolve => setTimeout(resolve, 5000));

			const mapElement = await page.$('#map');
			if (!mapElement) {
				const error = new Error(`Elemento do mapa (#map) não encontrado para '${mapId}'.`);
				console.error(error.message);
				await page.close();
				continue;
			}

			const fileName = path.join(outputPath, `${mapId.replace(/[^a-z0-9]/gi, '_')}.png`);
			await mapElement.screenshot({ path: fileName });

			console.log(`Mapa para '${mapId}' salvo como "${fileName}"`);
			await page.close();

			await new Promise((resolve) => server.close(() => resolve()));
		}

	} catch (error) {
		console.error('Ocorreu um erro durante a geração do mapa:', error);
		throw error;
	} finally {
		if (browser) {
			await browser.close();
		}
		if (server && server.listening) {
			await new Promise((resolve) => server.close(() => resolve()));
		}
		console.log('Processo de geração de mapas concluído.');
	}
}

module.exports = { generateMultipleMapsFromCsv };