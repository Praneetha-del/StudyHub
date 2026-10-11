# StudyHub

StudyHub is an educational resource sharing and collaborative learning platform designed for students, teachers, and administrators.

## Project Structure

```text
StudyHub/
├── .gitignore
├── README.md
├── studyhub-frontend/
│   ├── package.json
│   ├── src/
│   ├── public/
│   ├── vercel.json
│   └── ...
└── studyhub-backend11orginal/
    ├── pom.xml
    ├── Dockerfile
    └── src/
        └── main/
            └── ...
```

- **`studyhub-frontend/`**: Modern Single Page Application built with React 18, Vite, and Tailwind CSS.
- **`studyhub-backend11orginal/`**: Monolithic REST API backend built with Java 21, Spring Boot 3, and Spring Security.

---

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Lucide React icons
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 3
- **Security**: Spring Security & JWT (JSON Web Tokens)
- **Database**: MongoDB (Spring Data MongoDB)
- **Cloud Storage**: Cloudinary (for documents, PDFs, presentations)
- **AI Integration**: Groq API (Chat completions)
- **Email Service**: Spring Mail (SMTP / Gmail)
- **Documentation**: SpringDoc OpenAPI / Swagger

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher) and npm
- Java JDK 21
- Apache Maven (v3.8+)
- MongoDB Atlas cluster or local MongoDB instance

---

### Backend Setup (`studyhub-backend11orginal`)

1. Navigate to the backend directory:
   ```bash
   cd studyhub-backend11orginal
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```env
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret_key_minimum_256_bits
   JWT_EXPIRATION=86400000
   JWT_REFRESH_EXPIRATION=604800000
   FRONTEND_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=openai/gpt-oss-120b
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_gmail_app_password
   ```

3. Compile and run:
   ```bash
   mvn clean package -DskipTests
   mvn spring-boot:run
   ```
   The backend server runs on `http://localhost:8080`.

---

### Frontend Setup (`studyhub-frontend`)

1. Navigate to the frontend directory:
   ```bash
   cd studyhub-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:5173`.

5. Build for production:
   ```bash
   npm run build
   ```

---

## Deployment

### Backend (Docker / Render)
The backend includes a multi-stage `Dockerfile` (Java 21 / Eclipse Temurin).
- Root directory for deployment: `studyhub-backend11orginal`
- Docker build context: `studyhub-backend11orginal`
- Environment variables: Configure `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, Cloudinary, Groq, and Mail variables in Render environment settings.

### Frontend (Vercel)
The frontend includes `vercel.json` configured with SPA rewrites.
- Root directory for deployment: `studyhub-frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: Set `VITE_API_URL` to your production backend URL (e.g. `https://studyhub-backend.onrender.com/api`).
