# Deployment Guide - Smart Form Extractor

## 🚀 Frontend Deployment (Netlify / Vercel)

### Option 1: Netlify (Recommended)

1. **Push to GitHub:**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/smart-form-extractor.git
git push -u origin main
```

2. **Deploy on Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click Deploy

3. **Environment Variables:**
   - Go to Site settings → Environment
   - Add `VITE_OLLAMA_API_URL=https://your-ollama-server.com`

### Option 2: Vercel

1. **Deploy directly:**

```bash
npm install -g vercel
vercel
```

2. \*\*Or link GitHub repository at [vercel.com](https://vercel.com)

---

## 🖥️ Backend Deployment (Ollama Server)

### Option 1: Railway.app (Free Tier Available)

1. **Create Railway account** at [railway.app](https://railway.app)

2. **Create Docker deployment:**

```bash
docker run -d \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  --name ollama \
  ollama/ollama:latest

ollama pull mistral
```

3. **Push to GitHub:**

```bash
git add Dockerfile .dockerignore
git commit -m "Add Ollama Docker config"
git push
```

4. **Deploy on Railway:**
   - Connect GitHub repo
   - Railway auto-detects Dockerfile
   - Set PORT to 11434
   - Domain automatically assigned

### Option 2: Render.com

1. **Create account** at [render.com](https://render.com)
2. **New Web Service → GitHub repository**
3. **Settings:**
   - Runtime: Docker
   - Build command: `docker build .`
   - Start command: `ollama serve`
4. **Environment Variables:**
   - `OLLAMA_HOST=0.0.0.0:10000`

### Option 3: AWS EC2 (Budget-Friendly)

1. **Launch EC2 instance:**
   - Ubuntu 22.04 LTS
   - t3.medium (1-2 GB RAM minimum)
   - Security: Allow port 11434

2. **SSH into instance:**

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install Ollama:**

```bash
curl https://ollama.ai/install.sh | sh
ollama pull mistral
ollama serve
```

4. **Keep running in background:**

```bash
nohup ollama serve > ollama.log 2>&1 &
```

---

## 📋 Backend API Server (Node.js Proxy)

If you want a custom backend to handle requests:

### Create `server.js`:

```javascript
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

app.post("/api/extract-fields", async (req, res) => {
  try {
    const { base64Pdf } = req.body;

    // Send to Ollama for processing
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        prompt: `Extract form fields from this PDF: ${base64Pdf}. Return JSON with fields, labels, and bbox coordinates.`,
        stream: false,
      }),
    });

    const data = await response.json();
    res.json(JSON.parse(data.response));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Deploy on Railway/Render:

```bash
npm install express cors node-fetch
npm run build
```

---

## 🔐 Production Environment Variables

Create `.env.production`:

```
VITE_OLLAMA_API_URL=https://your-ollama.railway.app
VITE_API_URL=https://your-api.railway.app
VITE_APP_NAME=Smart Form Extractor
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - run: npm install
      - run: npm run build

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: "./dist"
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 📦 Docker Setup (Both Frontend & Backend)

### `Dockerfile` (Frontend):

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### `docker-compose.yml`:

```yaml
version: "3.8"
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      VITE_OLLAMA_API_URL: http://ollama:11434

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      OLLAMA_HOST: 0.0.0.0:11434

volumes:
  ollama_data:
```

**Deploy:**

```bash
docker-compose up -d
```

---

## 🚀 Quick Deployment Checklist

- [ ] Update `package.json` with correct metadata
- [ ] Create production build: `npm run build`
- [ ] Test build locally: `npm run preview`
- [ ] Set up environment variables
- [ ] Push to GitHub
- [ ] Connect to Netlify/Vercel
- [ ] Deploy backend (Ollama server)
- [ ] Update frontend API URLs
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS headers

---

## 💰 Cost Estimates

| Service     | Free Tier              | Paid Plan         |
| ----------- | ---------------------- | ----------------- |
| **Netlify** | $0/month (generous)    | $19+/month        |
| **Vercel**  | $0/month (generous)    | $20+/month        |
| **Railway** | $5/month               | $5+ pay-as-you-go |
| **Render**  | Limited                | $7+/month         |
| **AWS EC2** | 1 year free (t2.micro) | $5-20+/month      |

---

## 🔗 Useful Links

- [Netlify Docs](https://docs.netlify.com)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Ollama Cloud](https://ollama.ai)
- [Docker Hub](https://hub.docker.com)
