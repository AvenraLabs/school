# Redis Setup & Installation Guide (Local & Google Cloud)

This guide provides step-by-step instructions for installing and running Redis for BullMQ background workers in your local development environment (Windows/Docker) and in Google Cloud (GCloud VM / Memorystore).

---

## 1. Local Development Setup (Windows)

You have 3 easy options to run Redis locally on Windows:

### Option A: Direct Windows Port (Memurai / Redis for Windows - Recommended for Fast Setup)
1. Download and run the Redis Windows installer or [Memurai for Windows](https://www.memurai.com/).
2. Run the installer (it automatically registers Redis as a Windows Service on port `6379`).
3. Start Redis in PowerShell / Command Prompt:
   ```powershell
   redis-server
   ```
4. Verify Redis is running:
   ```powershell
   redis-cli ping
   ```
   *Output should be:* `PONG`

---

### Option B: Using Docker (Fastest if Docker Desktop is installed)
Run a Redis container mapped to port `6379`:
```powershell
docker run -d --name schooliq-redis -p 6379:6379 redis:latest
```

To test:
```powershell
docker exec -it schooliq-redis redis-cli ping
```

---

### Option C: Using WSL2 (Windows Subsystem for Linux)
1. Open your WSL terminal (Ubuntu):
   ```bash
   sudo apt update
   sudo apt install redis-server -y
   ```
2. Start the Redis service:
   ```bash
   sudo service redis-server start
   ```
3. Verify:
   ```bash
   redis-cli ping
   # Output: PONG
   ```

---

## 2. Environment Configuration

Add the Redis connection settings to your `backend/.env` file:

```env
# Redis Configuration (BullMQ / Background Workers)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
# REDIS_PASSWORD=your_password_if_any
```

> **Note**: If `REDIS_HOST` is omitted, our background video service automatically falls back to an in-memory Node.js worker so everything continues working without Redis!

---

## 3. Google Cloud (GCloud) Production Setup

### Option 1: Install Redis directly on your GCloud Compute Engine VM
1. SSH into your GCloud VM:
   ```bash
   gcloud compute ssh your-vm-name --zone=your-zone
   ```
2. Install Redis Server:
   ```bash
   sudo apt update
   sudo apt install redis-server -y
   ```
3. Configure Redis as a systemd service:
   ```bash
   sudo systemctl enable redis-server
   sudo systemctl start redis-server
   ```
4. Check status:
   ```bash
   sudo systemctl status redis-server
   ```
5. In your production `.env` on the GCloud VM, set:
   ```env
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   ```

---

### Option 2: Google Cloud Memorystore for Redis (Managed Redis)
If scaling to multiple instances:
1. In Google Cloud Console, navigate to **Memorystore > Redis** and click **Create Instance**.
2. Copy the **Primary IP Address** provided by GCP (e.g. `10.0.0.3`).
3. Update your production `.env`:
   ```env
   REDIS_HOST=10.0.0.3
   REDIS_PORT=6379
   ```
