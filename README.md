# Student Information Management System — Three-Tier Cloud Architecture

A complete, working implementation of the CA2 Problem 1 activity:

```
User (Browser) → Netlify (Frontend) → Render (Backend/API) → MongoDB Atlas (Database)
```

- **Presentation Tier** — `frontend/` — plain HTML/CSS/JS, deployed on **Netlify**
- **Application Tier** — `backend/` — Node.js + Express REST API, deployed on **Render**
- **Database Tier** — **MongoDB Atlas** (cloud-hosted MongoDB)

Full CRUD (Create, Read, Update, Delete, Search) on student records, with CORS, environment-variable-based secrets, and input validation, as required by the problem statement.

---

## 1. Project Structure

```
project/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB Atlas connection
│   ├── controllers/
│   │   └── studentController.js # CRUD logic
│   ├── models/
│   │   └── Student.js           # Mongoose schema
│   ├── routes/
│   │   └── studentRoutes.js     # REST endpoints
│   ├── server.js                # Express app entry point
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js                # calls the Render API
│   └── netlify.toml
│
└── README.md
```

---

## 2. Set Up MongoDB Atlas (Database Tier)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a **free M0 cluster**.
3. Under **Database Access**, create a database user with a username/password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) — required since Render's IPs are dynamic.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/studentDB?retryWrites=true&w=majority
   ```
6. Keep this string handy — you'll paste it into Render's environment variables (never into code).

---

## 3. Deploy the Backend on Render (Application Tier)

1. Push the `backend/` folder to a GitHub repository.
2. Go to https://render.com → **New → Web Service** → connect your GitHub repo.
3. Configure:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Under **Environment**, add:
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | your Atlas connection string from step 2 |
   | `FRONTEND_URL` | your Netlify URL (see step 4 — you can update this after deploying the frontend) |
   | `PORT` | `5000` (Render overrides this automatically, safe to leave) |
5. Deploy. Render will give you a public URL such as:
   ```
   https://student-api.onrender.com
   ```
6. Test it: open `https://student-api.onrender.com/` in a browser — you should see:
   ```json
   { "success": true, "message": "Student Management API is running" }
   ```

### Backend REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/students` | Add a new student |
| GET | `/api/students` | Get all students (supports `?search=` query) |
| GET | `/api/students/:id` | Get one student by `studentId` |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |

---

## 4. Deploy the Frontend on Netlify (Presentation Tier)

1. **Before deploying**, open `frontend/script.js` and update this line with your actual Render URL:
   ```js
   const API_BASE_URL = "https://YOUR-RENDER-BACKEND-URL.onrender.com/api/students";
   ```
2. Push the `frontend/` folder to GitHub (same repo or a separate one), or drag-and-drop the `frontend/` folder directly into Netlify's dashboard (**Sites → Add new site → Deploy manually**).
3. If deploying via Git: **New site from Git** → select repo → set **Base directory** to `frontend`, **Publish directory** to `frontend`.
4. Netlify will give you a URL such as:
   ```
   https://student-management-system.netlify.app
   ```
5. Go back to Render and set the `FRONTEND_URL` environment variable to this exact URL, then redeploy the backend so CORS allows requests from it.

---

## 5. Run Locally (optional, before deploying)

**Backend:**
```bash
cd backend
cp .env.example .env
# edit .env with your local/Atlas MongoDB URI
npm install
npm run dev        # requires nodemon (npm i -g nodemon), or use npm start
```

**Frontend:**
Just open `frontend/index.html` in a browser, or serve it with any static server (e.g. VS Code Live Server on port 5500 — already whitelisted in CORS). Temporarily point `API_BASE_URL` in `script.js` to `http://localhost:5000/api/students` while testing locally.

---

## 6. Testing Checklist (matches the problem statement's Testing Requirements)

- [ ] Add Student — fill the form, submit, confirm "Student added successfully"
- [ ] View Students — table loads and lists all records
- [ ] Search Student — search box filters by name/ID/department
- [ ] Update Student — click Edit, change semester, save, confirm change
- [ ] Delete Student — click Delete, confirm removal from table and MongoDB Atlas

---

## 7. Security Notes

- MongoDB connection string is **only** stored as a Render environment variable — never in frontend code or committed to Git.
- CORS on the backend is restricted to the deployed Netlify origin (plus localhost for dev), not `*`.
- Input is validated both in the Mongoose schema (backend) and the HTML form (frontend).
- `.env` is git-ignored; only `.env.example` (with placeholder values) is committed.

---

## 8. Customizing the Scenario

Per the assignment note, you can swap the **problem domain** (e.g., turn this into a "Library Book Management System" or "Employee Directory") as long as the **platforms stay the same**: Netlify (frontend) + Render (backend) + MongoDB Atlas (database). To do that, just rename the model fields in `Student.js`, adjust the controller/routes, and update the form fields in `index.html` accordingly — the architecture and deployment steps remain identical.
