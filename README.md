# LowBand Meet — Setup & Usage

## 1. Run it locally
```
cd lowband-meet
npm install
npm start
```
Server starts at http://localhost:3000

## 2. How the 2nd person joins
- Both people open the same URL and type the **same Room ID** in the top bar, then click "Join".
- On your own machine, you'd open http://localhost:3000 in one browser tab/window (or one device),
  and the other person needs the URL to reach YOUR server over the network — localhost only works
  for you. See hosting options below for how to make it reachable by someone else.
- Once both are in the same room, WebRTC signaling happens automatically via the server
  (offer/answer/ICE exchange), and a peer-to-peer audio/video + whiteboard connection forms directly
  between browsers. The server is only used for signaling and whiteboard event relay — not for
  carrying audio/video.

## 3. Do you need to host it?
Yes — for anyone other than you on the same machine to join, the server must be reachable by them.
Options, easiest to most robust:

### A. Quick test with a teammate (no deployment) — use a tunnel
Run locally, then expose it temporarily:
```
npm start
# in a second terminal:
npx localtunnel --port 3000
# or: ngrok http 3000  (requires ngrok account)
```
You'll get a public URL like https://xxxx.loca.lt — send that to the other person. Good for quick
demos, not for production (free tunnels are unstable and not for real users).

### B. Deploy to a cheap always-on host (recommended for real use)
Any Node-hosting platform works since this is just `npm install && npm start`:
- Render.com, Railway.app, Fly.io, Heroku, a $5 DigitalOcean droplet, or your own VPS.
- Push these files to GitHub, connect the repo, set start command `node server.js`, and the
  platform gives you a public HTTPS URL. Share that URL + a room name with the other person.

### C. Docker container (optional, not required)
You do NOT have to use a container — plain Node is enough. If you prefer containers anyway:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```
Build & run:
```
docker build -t lowband-meet .
docker run -p 3000:3000 lowband-meet
```
Then deploy that container to any container host (Render, Fly.io, AWS ECS, a VPS with Docker, etc.)
and share the resulting public URL.

## 4. Important: HTTPS is required for camera/mic in production
Browsers only allow `getUserMedia` over `https://` or `http://localhost`. Local testing on
localhost is fine without HTTPS. Any public deployment (tunnel or real host) must serve over HTTPS —
the platforms in option B give you HTTPS automatically; if you self-host on a VPS, put it behind
Nginx/Caddy with a free Let's Encrypt certificate, or use Cloudflare in front of it.

## 6. Screen Sharing
Click **"🖥️ Share Screen"** in the top bar. Your browser will prompt you to pick a screen, window,
or tab — once selected, your video track switches from camera to actual screen content for everyone
already in the call. The same 100kbps SDP bandwidth cap from the camera feed still applies, and
capture is throttled to ~5fps at up to 960x540, so it stays cheap on data but will look soft/laggy
on fast-moving content — fine for slides, docs, code, slow-moving UI demos.

- Viewers automatically see a green dot light up on the **"Screen Share"** tab and get auto-switched
  to it.
- Click **"🖥️ Stop Sharing"** (or use your browser's native "Stop sharing" bar) to revert back to
  your camera feed.
- The **Whiteboard** tab is unaffected and still syncs independently via lightweight coordinate
  events — you can draw while NOT screen sharing, or switch back and forth between the two tabs at
  any time.

## 7. Quick checklist
1. `npm install && npm start` locally to verify it runs.
2. Choose a hosting option (A for a quick test, B for something persistent).
3. Make sure the public URL is HTTPS.
4. Share the URL + agreed Room ID with the other person.
5. Both click Join — camera/mic permission prompts appear, video tiles populate, and the
   whiteboard syncs live via lightweight coordinate events (not video), keeping bandwidth low.
