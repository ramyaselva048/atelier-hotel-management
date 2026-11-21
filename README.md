# Atelier Hotel Management

A responsive hotel-management web application built for the **Hotel List Page (CRUD Form with Responsive UI)** assignment.

## Technology stack

- Frontend: React, Redux Toolkit, React Router, HTML and CSS
- Backend: Node.js and Express
- Database: PostgreSQL
- SQL: Native parameterized SQL queries (no ORM)
- Maps: Leaflet and OpenStreetMap
- SEO: React Helmet Async

## Assignment features

- Reusable hotel form for creating and editing hotel records
- Hotel image upload with preview
- Hotel name, description, latitude, longitude and nightly price fields
- Frontend and backend validation
- Hotel cards (not a table), with image, hotel name, price and description
- Search hotels by title/name
- Filter by minimum and maximum price
- Server-side pagination using `limit` and `offset`
- Edit and delete actions, with deletion confirmation and success notice
- Hotel detail page with full details and a map marker using saved coordinates
- Browser Geolocation API: optional current-location marker, with permission/error handling
- Dynamic page titles and meta descriptions using React Helmet Async
- Descriptive `alt` text for hotel images
- Single Page Application with reusable hotel-card and pagination components
- Local image storage on the Node.js server; image path stored in PostgreSQL

## Requirements

- Node.js 20 or newer (Node.js 24 is supported)
- PostgreSQL 14 or newer
- npm

## 1. Create the database

Create a PostgreSQL database named `hotel_management`, then execute:

```bash
psql -d hotel_management -f server/sql/schema.sql
```

You can also open `server/sql/schema.sql` in pgAdmin Query Tool and execute it against `hotel_management`.

## 2. Configure and start the backend

Open a terminal in the project folder:

```bash
cd server
```

Create your local environment file by copying the example:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

Edit `server/.env` with your own PostgreSQL credentials:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hotel_management
CLIENT_URL=http://localhost:5173
```

Do not share or commit your real `.env` file.

Install dependencies and start the API:

```bash
npm install
npm run dev
```

API health check: `http://localhost:5000/api/health`

Expected response:

```json
{"status":"ok","database":"connected"}
```

## 3. Start the frontend

Open a second terminal in the project folder:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/hotels` | List hotels with title/price filters and pagination |
| GET | `/api/hotels/:id` | Get one hotel |
| POST | `/api/hotels` | Create a hotel (multipart image upload) |
| PUT | `/api/hotels/:id` | Update a hotel (optional image replacement) |
| DELETE | `/api/hotels/:id` | Delete a hotel and its stored image |

List query parameters: `search`, `minPrice`, `maxPrice`, `limit`, `offset`.

## Image storage

Uploaded images are stored locally in `server/uploads`. Only the relative image path is stored in PostgreSQL. The upload limit is 5 MB and supported formats are JPG, PNG, WEBP and GIF.

## Notes

- Map tiles require an internet connection.
- Browser Geolocation requires user permission and a secure context; `localhost` is supported for local development. If permission is denied, the saved hotel map marker remains available.
- Authentication is not included because it is not specified in the supplied assignment brief.
- Never commit `.env`, database passwords, `node_modules`, or build output.
