
# 🗺️ Map Pins

Map Pins is a tool for generating and visualizing map pins from CSV data. It is available as both an Electron desktop application and a self-hosted web version.

[https://nalmeida.github.io/map-pins/](https://nalmeida.github.io/map-pins/)

## Features
- Generate map pin images from CSV files
- Visualize and export maps
- Electron desktop app for offline use
- [Web version for easy access](https://nalmeida.github.io/map-pins/)

## Electron App
The Electron version allows you to run Map Pins as a desktop application. It provides a user-friendly interface for generating and exporting map pins.

### Getting Started (Electron)
1. Clone this repository:
	```bash
	git clone https://github.com/nalmeida/map-pins.git
	cd map-pins
	```
2. Install dependencies:
	```bash
	npm install
	```
3. Start the Electron app:
	```bash
	npm start
	```

#### Electron Builder

To package the Electron app:
- Local Dev: `npm run dev`
- Windows: `npm run build:win`
- macOS: `npm run build:win`

## Self-Hosted Web Version

You can run Map Pins as a web app locally or host it on your own server. The web version is available at [https://nalmeida.github.io/map-pins/](https://nalmeida.github.io/map-pins/).

### Running Locally
1. Open `web/index.html` in your browser.
2. Or serve the `web/` directory using a static file server:
	```bash
	cd web
	python3 -m http.server 8080
	# Then visit http://localhost:8080
	```

## CSV Format
Your CSV file should contain the necessary data for generating map pins. Example:
```
Format:
map_id,lat,long,name

Example:
mapa_sp,-23.5505, -46.6333, São Paulo
mapa_sp,-23.5574, -46.6398, Bela Vista
mapa_rj,-22.9068, -43.1729, Rio de Janeiro
mapa_rj,-22.9038, -43.1818, Copacabana

The first column is the map ID. Multiple lines with the same ID will appear on the same map.
```

Sample file: [dados.csv](./dados.csv)
