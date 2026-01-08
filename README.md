# 🔴 Pokedex Favorites - Fullstack Web App

A modern Pokedex application that allows users to browse, search, view detailed statistics, and **vote** for their favorite Pokémon. Built with a decoupled architecture (Client-Server), connected to a PostgreSQL database, and deployed on Vercel.

🔗 **Live Demo:** [(https://pokedex-favorites-8mjk.vercel.app/)]

---

## 🛠️ Tech Stack

**Frontend:**
* ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white) **React.js (Vite)**
* ![CSS](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white) **Modern CSS / Tailwind**
* ![Axios](https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white) **Axios** (API Consumption)

**Backend:**
* ![NodeJS](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) **Node.js & Express**
* ![Postgres](https://img.shields.io/badge/-PostgreSQL-336791?logo=postgresql&logoColor=white) **PostgreSQL** (Database)
* **node-postgres (pg)** (Driver)

**Infrastructure & Deployment:**
* ![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?logo=supabase&logoColor=white) **Supabase** (Managed Database)
* ![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white) **Vercel** (Frontend & Backend Deployment)

---

## ✨ Key Features

1.  **Browse & Pagination:** Efficiently browse hundreds of Pokémon with server-side pagination.
2.  **Real-time Search:** Filter Pokémon by name instantly.
3.  **Voting System:** Users can vote/unvote their favorite Pokémon.
    * *Smart Prevention:* Uses visitor identification to prevent spam/duplicate votes from the same user.
4.  **Detailed Stats:** View HP, Attack, Defense, and other base stats visually.
5.  **Responsive Design:** Fully optimized for Desktop and Mobile view.

---

## 📂 Project Structure (Monorepo)

This project uses a monorepo structure separating the client and server logic.

```bash
├── client/          # Frontend (React + Vite)
│   ├── src/
│   ├── vercel.json  # Frontend Proxy Configuration
│   └── ...
├── server/          # Backend (Express API)
│   ├── index.js     # Main Server Logic
│   ├── vercel.json  # Backend Serverless Configuration
│   └── ...
└── README.md
```

🚀 How to Run LocallyFollow these steps to run the project on your local machine.

1. Clone the Repository
```bash
git clone https://github.com/GregoriusPatrick/pokedex-favorites.git
cd pokedex-favorites
```

2. Setup Backend (Server)
```bash
cd server
npm install
```
Create a .env file in the server folder:
```bash
DATABASE_URL=postgresql://postgres.yunqvwqtfeqhbqtobrvj:sWTsAiXCMnBaPpz6@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
PORT=3000
```
```bash
Run the server:
npm start # Server will run on http://localhost:3000
```

3. Setup Frontend (Client)
Open a new terminal:
```bash
cd client
npm install
```

Note: Make sure to adjust the API URL in the frontend code if running locally without the Vercel proxy.
Run the client:npm run dev # Client will run on http://localhost:5173


## 👤 Author
**Gregorius Patrick**

**Computer Science Student at Binus University**
