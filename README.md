# KULIO - Official Artist Website

This is a full-stack React application built with Vite, Express, and Tailwind CSS. It features integrations with Spotify, YouTube, and Bandsintown to showcase KULIO's music, videos, and tour dates.

## Prerequisites

- Node.js (v20 or higher)
- npm (v10 or higher)

## Local Setup

1. **Clone the repository** (or download the source code).

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the `.env.example` file to a new file named `.env` and fill in your API credentials:
   ```bash
   cp .env.example .env
   ```
   Keep `NODE_ENV` out of `.env`; set it only in the shell for production runs.
   You will need:
   - **Spotify**: Client ID, Client Secret, and Artist ID (from [Spotify for Developers](https://developer.spotify.com/dashboard))
   - **YouTube**: API Key and Channel ID (from [Google Cloud Console](https://console.cloud.google.com/))
   - **Bandsintown**: App ID (from [Bandsintown API](https://artists.bandsintown.com/support/api))

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3005`.

## Testing on Local Network

To access the application from other devices on your local network:
1. Ensure your computer and the testing device are on the same Wi-Fi network.
2. Find your computer's local IP address (e.g., `192.168.1.5`).
3. Set `HOST=0.0.0.0` in your shell or `.env`, then open the browser on your testing device and navigate to `http://<your-ip>:3005`.

## Building for Production

To create a production build:
```bash
npm run build
```
The optimized files will be in the `dist/` directory. You can start the production server with:
```bash
NODE_ENV=production npm start
```

## Features

- **Custom Cursor**: A dynamic, reactive cursor for desktop users.
- **Parallax Hero**: Immersive background effects that respond to mouse movement.
- **Scroll Reveal**: Smooth animations as you explore the site.
- **Real-time Data**: Live fetching of music, videos, and events.
- **Responsive Design**: Optimized for mobile, tablet, and desktop.
# gabbydoggy
