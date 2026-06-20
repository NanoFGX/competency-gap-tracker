# Deploy — Competency Gap Tracker (Hi-Fi Prototype)

## 1. Push to GitHub
```bash
git remote add origin https://github.com/NanoFGX/competency-gap-tracker.git
git push -u origin main
```

## 2. Deploy on Vercel
- Go to https://vercel.com/new and **Import** the `competency-gap-tracker` repo.
- Vercel auto-detects `vercel.json`:
  - Install: `npm install`
  - Build: `npm run build`
  - Output: `dist/client`
- Click **Deploy** → you get a live `*.vercel.app` URL.

## Run locally
```bash
npm install
npm run dev -- --host 127.0.0.1   # http://127.0.0.1:8080
```
Log in with a demo account on the login screen (Student / Recruiter quick-fill), then toggle light/dark in the sidebar footer.
