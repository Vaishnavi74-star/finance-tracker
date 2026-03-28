# 💰 Finance Tracker App

🔗 Live Demo: https://finance-tracker-six-rosy.vercel.app

A full-stack **Finance Tracker Web Application** that helps users manage income, expenses, and financial insights in one place. Built with modern technologies, scalable backend, and responsive UI.

---

## 🚀 Features

- 📊 Track income and expenses
- 🧾 Categorize transactions
- 💼 Manage accounts
- 📈 Financial summaries
- 🔐 Authentication (JWT / OTP / OAuth ready)
- 📩 Email notifications
- 💳 Payment integration ready
- 🤖 AI integrations (LLM, Image Gen, Messaging)
- 🐳 Docker support

---

## 🏗️ Project Structure

```
finance-tracker/
│
├── backend/
│   ├── src/
│   ├── Dockerfile
│   ├── .env.example
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── .env
│
├── .github/workflows/
└── README.md
```

---

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS

**Backend**
- Node.js
- Express / Hono
- Prisma ORM
- PostgreSQL

**DevOps**
- Docker
- GitHub Actions

---

## ⚙️ Setup Instructions

### 1. Clone Repo

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
PORT=5000
```

Run:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:

```
VITE_API_URL=http://localhost:5000
```

Run:

```bash
npm run dev
```

---

## 🐳 Docker

```bash
docker-compose up --build
```

---

## 📦 API Features

- Auth (JWT / OTP / OAuth)
- Transactions CRUD
- Account management
- Notifications
- Integrations (AI / Payments / Messaging)

---

## 🚀 Deployment

- Frontend: Vercel  
- Backend: Render / Docker  

---

## 🤝 Contributing

1. Fork repo  
2. Create branch  
3. Commit changes  
4. Push  
5. Open PR  

---

## 📄 License

MIT License

---

## 👩‍💻 Author

Vaishnavi Deshpande

---

## ⭐ Support

Give a ⭐ if you like this project!

---

## 🔥 Future Improvements

- Budget planner  
- Analytics dashboard  
- Mobile app  
- AI insights  
