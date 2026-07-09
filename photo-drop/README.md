# Photo Drop

Simple photo exchange website. Upload photos, view them, delete them. That's it.

## Deploy to Railway

1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Railway auto-detects Node.js and runs `npm start`
4. Add a **Volume** (Settings → Volumes → Mount) at `/app/uploads` so photos survive redeployments
5. Generate a domain under Settings → Networking → **Generate Domain**

## Run locally

```bash
npm install
npm start
# Open http://localhost:3000
```

## Notes

- 10MB max per file
- Up to 20 files per upload
- Photos stored on disk in `/uploads`
- **Important:** without a Railway Volume, uploaded photos are lost on every redeploy
