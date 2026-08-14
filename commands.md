# ChromaDB Deployment & Setup Guide (Google Cloud & Local)

This document provides step-by-step commands to install, run, and deploy **ChromaDB** on Google Cloud (GCP Compute Engine / VM) as well as locally.

---

## 1. Quick Answers

- **Do I need to install Python or Chroma in Google Cloud?**  
  - **With Docker (Recommended)**: NO Python installation needed on the host VM. Docker handles everything in a single command.
  - **Without Docker**: YES, you need Python 3.10+ and `pip install chromadb`.

- **How does backend connect to ChromaDB?**  
  Set the environment variable in your `backend/.env`:
  ```env
  CHROMA_URL=http://localhost:8000
  ```
  *(Or if ChromaDB is on a separate GCP VM: `CHROMA_URL=http://YOUR_CHROMA_VM_IP:8000`)*

---

## 2. Option A: Run ChromaDB on Google Cloud VM using Docker (RECOMMENDED)

Docker is the simplest, most reliable way to run ChromaDB in production.

### Step A1: Install Docker on GCP VM
```bash
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

### Step A2: Run ChromaDB container with persistent storage
```bash
# Create persistent storage folder
mkdir -p ~/schooliq/backend/rag_data/chroma

# Run ChromaDB Docker container
docker run -d \
  --name chromadb \
  --restart always \
  -p 8000:8000 \
  -v ~/schooliq/backend/rag_data/chroma:/chroma/chroma \
  -e IS_PERSISTENT=TRUE \
  -e ANONYMIZED_TELEMETRY=FALSE \
  chromadb/chroma:latest
```

### Step A3: Verify ChromaDB is running
```bash
curl http://localhost:8000/api/v1/heartbeat
# Returns: {"nanosecond heartbeat": ...}
```

---

## 3. Option B: Run ChromaDB on Google Cloud VM using Python & PM2

If you prefer installing Python directly on your GCP VM:

### Step B1: Install Python 3 & pip
```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv
```

### Step B2: Install ChromaDB in a Python virtual environment
```bash
cd ~/schooliq/backend
python3 -m venv chroma_env
source chroma_env/bin/activate
pip install --upgrade pip
pip install chromadb
```

### Step B3: Run ChromaDB with PM2 (Persistent Background Process)
```bash
# Install PM2 globally if not installed
sudo npm install -g pm2

# Create persistent storage folder
mkdir -p ./rag_data/chroma

# Start ChromaDB with PM2
pm2 start "chroma run --path ./rag_data/chroma --host 0.0.0.0 --port 8000" --name "chromadb"

# Save PM2 process list so it restarts automatically on server reboot
pm2 save
pm2 startup
```

---

## 4. Book Structure & Textbook Ingestion

### Folder Structure for Textbooks
Place your textbook PDFs in `backend/books/`:
```text
backend/books/
  ├── CBSE/
  │    └── 10/
  │         └── Science/
  │              ├── Chap-1.pdf
  │              └── Chap-2.pdf
  └── Stateboard/
       └── 6/
            └── Maths/
                 └── Chap-1.pdf
```

### Run Ingestion Script
```bash
cd ~/schooliq/backend
node src/modules/rag/ingest/ingestAllBooks.js
```
*This command automatically:*
1. Parses PDFs and extracts chapter structures.
2. Embeds text chunks via **Gemini Embedding API** (`text-embedding-004`).
3. Stores vector chunks and metadata in **ChromaDB** (`http://localhost:8000`).
4. Automatically updates the in-memory curriculum discovery cache.

---

## 5. GCP Firewall Configuration (If ChromaDB is on a separate VM)

If ChromaDB is hosted on a separate Google Cloud instance from the backend:

1. Open **Google Cloud Console** $\rightarrow$ **VPC Network** $\rightarrow$ **Firewall Rules**.
2. Click **Create Firewall Rule**:
   - **Name**: `allow-chromadb-8000`
   - **Targets**: All instances in the network
   - **Source IP Ranges**: `0.0.0.0/0` (or backend VM internal IP)
   - **Protocols & Ports**: `tcp:8000`
3. Update `CHROMA_URL` in backend `.env`:
   ```env
   CHROMA_URL=http://<YOUR_CHROMA_VM_IP>:8000
   ```

---

## 6. Useful Maintenance Commands

```bash
# View ChromaDB Docker logs
docker logs -f chromadb

# Stop & restart ChromaDB Docker
docker restart chromadb

# View ChromaDB PM2 status (Option B)
pm2 status chromadb
pm2 logs chromadb

# Reset ChromaDB data completely (DANGER: Deletes all ingested textbook vector chunks)
rm -rf ~/schooliq/backend/rag_data/chroma/*
```
