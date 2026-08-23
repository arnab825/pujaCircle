# Local Development Setup Guide - PujaCircle

## 1. System Requirements

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **OS**: macOS, Linux, or Windows (WSL recommended)

---

## 2. Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd pujaCircle
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

5. **Set up local environment files:**
   ```bash
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

---

## 3. Running Locally

- **Run Frontend with Standalone Mock API (Recommended for UI Engineers):**
  ```bash
  npm run frontend
  ```
  App will open on `http://localhost:5173`.

- **Run Frontend & Backend Concurrently:**
  ```bash
  npm run dev
  ```

- **Run Automated Mock API Tests:**
  ```bash
  npm run test:mock
  ```
