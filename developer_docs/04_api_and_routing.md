# 04 - API & Routing Architecture

Understanding the data flow across the MERN stack is critical. FASNet employs a strictly RESTful API paradigm on the backend, complemented by a declarative, lazy-loaded routing system on the frontend.

## 1. Backend API (`backend/src/routes/*.js`)
Express handles API endpoints prefixing everything with `/api/v1/`.

### Core Namespaces
1.  **`/api/v1/auth`**
    *   Handles `POST /login`, `POST /request-activation`, `POST /verify-otp`.
2.  **`/api/v1/users` & `/api/v1/students`**
    *   CRUD operations for identity and demographics.
3.  **`/api/v1/academic`**
    *   Fetches dynamic dashboards (e.g., `GET /students/:id/dashboard`), modules, and enrolled records.
4.  **`/api/v1/resources`**
    *   Maps to `resourceController.js`. Includes upload integrations to Cloudinary. It has a custom rate-limiter built-in for heavy file transfers.
5.  **`/api/v1/system` & `/api/v1/settings`**
    *   Toggles maintenance modes, updates logos, and checks server health (`GET /health`).

### Middlewares
*   `protect`: Ensures a valid JWT is present in the `Authorization` header.
*   `restrictTo('admin', 'superadmin')`: Validates the `roles` array in the User document before proceeding.
*   `rateLimit`: Used globally to prevent DDoS, and strictly on Auth routes to block brute-forcing.

## 2. Frontend Routing (`frontend/src/App.jsx`)
React Router v6 drives the client experience. It uses a **Role-Based Wrapper Method** to protect routes.

### `ProtectedRoute` Component
Checks the browser's Redux/Local State via `authService.getToken()`. If absent, boots the user back to the `/login` screen. Inside, it instantiates global context providers (Toasts, IdleTimers).

### Layouts & Views
There is a strict visual hierarchy enforced by Layouts:
*   **Student Portals** inside `<LayoutWrapper>` load customized sub-routes like `/dashboard`, `/academics`, `/learning`. These are heavily nested with `Suspense` and `lazy()` imports to decrease initial bundle size.
*   **Superadmin Portals** utilize `<AdminLayout>` rendering a completely distinct sidebar navigation tree for `/admin/*` and direct `/students` management.
*   **Promoted Users** load the "Student Style" layout but parse the sidebar to inject Admin-specific links (`/admin/resources`, `/bulk-combination`). 

## 3. Real-Time Sockets (`socket.js`)
*   Socket.IO is implemented server-side.
*   When a Union Rep (Admin) broadcasts a `Notice`, it triggers an `emit('new_notice')`.
*   The `App.jsx` connects the client via `socketService.connect()`, which listens and updates state asynchronously, removing the need for infinite polling.
