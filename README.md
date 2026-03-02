# ThyroSakhi App Wireframe

Frontend wireframe project built with Vite, React, TypeScript, shadcn-ui, and Tailwind CSS.

## Getting started

Prerequisite: Node.js 18+ and npm.

```sh
npm install
npm run dev
```

## Available scripts

- `npm run dev` - Start local development server.
- `npm run build` - Build for production.
- `npm run preview` - Preview production build locally.
- `npm run lint` - Run ESLint.
- `npm run test` - Run tests once.
- `npm run test:watch` - Run tests in watch mode.

## Tech stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-ui

## API Testing

### Endpoint

- **Method**: `POST`
- **Path**: `/analyze-voice`
- **Content-Type**: `multipart/form-data`

### Required form-data fields

- `file` (WAV audio)
- `fatigue` (boolean)
- `weight_gain` (boolean)
- `hair_fall` (boolean)

### curl example

```sh
curl -X POST "http://localhost:5000/analyze-voice" \
	-F "file=@sample.wav;type=audio/wav" \
	-F "fatigue=true" \
	-F "weight_gain=false" \
	-F "hair_fall=true"
```

### Sample JSON response

```json
{
	"average_pitch": 208.31,
	"pitch_variation": 34.12,
	"energy": 0.0471,
	"duration": 10.24,
	"risk_score": 1,
	"risk_level": "Low"
}
```

### Sample Moderate risk response

```json
{
	"average_pitch": 154.8,
	"pitch_variation": 38.7,
	"energy": 0.0312,
	"duration": 9.85,
	"risk_score": 2,
	"risk_level": "Moderate",
	"dietary_recommendations": [
		"Include iodine-rich foods (iodized salt, dairy)",
		"Add selenium sources like nuts and seeds",
		"Increase high-fiber vegetables",
		"Avoid excessive processed foods"
	]
}
```

### Sample Moderate risk response (hyperthyroid-like indicators)

```json
{
	"average_pitch": 176.4,
	"pitch_variation": 41.2,
	"energy": 0.0561,
	"duration": 8.93,
	"risk_score": 2,
	"risk_level": "Moderate",
	"dietary_recommendations": [
		"Maintain balanced calorie intake",
		"Include protein-rich foods",
		"Limit caffeine",
		"Stay hydrated"
	]
}
```

### Sample error response

```json
{
	"error": "Invalid boolean value for 'fatigue'. Use true/false."
}
```

```json
{
	"error": "Missing file field 'file' in multipart/form-data"
}
```
