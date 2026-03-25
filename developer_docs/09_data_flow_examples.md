# 09 - Data Flow Architecture & Examples

To fully grasp how FASNet operates, it is helpful to trace the exact route data takes from the user clicking a button to the database saving a document.

Here are two core workflows dissecting the architecture.

---

## Example 1: The Student Academic Dashboard Load

*Scenario:* A student logs in and navigates to `/dashboard`. How do their grades and charts appear?

### 1. The Frontend Trigger (`App.jsx` -> `Dashboard/index.jsx`)
*   The student hits the `/dashboard` route.
*   The `ProtectedRoute` verifies `localStorage` contains a valid JWT token.
*   The component mounts and triggers a React `useEffect()`. 
*   It calls `academicService.getStudentDashboard(studentId)`.

### 2. The Interceptor (`api.js`)
*   Before the Axios request actually leaves the browser, the interceptor attaches the JWT token to the `Authorization: Bearer <token>` header.
*   It sends a `GET` request to `http://localhost:5000/api/v1/academic/student/:id/dashboard`.

### 3. The Backend Router (`academicRoutes.js`)
*   The Express router catches the route.
*   It pushes the request through the `protect` middleware.
*   `protect` verifies the JWT signature uses our secret key, decodes the User payload, and attaches `req.user`.

### 4. The Controller (`academicController.js`)
*   The controller `getStudentDashboardData` fires.
*   It queries Mongo via `Student.findById(req.params.id)`.
*   It identifies the student's current Level and Semester.
*   It queries `ModuleEnrollment.find({ student: id })`, heavily using `.populate()` to pull down the linked `Module` documents and the attached `Result` grades.
*   The controller formats calculating the total GPAs and Credits into JSON, appending them to a `success: true` response body.

### 5. Frontend Render
*   `academicService` resolves the Promise.
*   `Dashboard` sets its Local State with `setDashboardData(res.data)`.
*   The visual widgets (e.g., `<WelcomeBanner>` and `<DetailedPerformanceChart>`) re-render, transitioning from loading skeletons to data-filled interactive charts.

---

## Example 2: Union Rep Uploading a Past Paper

*Scenario:* A Union Rep uploads a heavy 15MB PDF Past Paper to a specific module.

### 1. The React Form (`AdminResources.jsx`)
*   The Rep selects the Module "CMBA 1113", Type "Past Paper", and attaches a local PDF.
*   They click "Upload". The client compiles the file into a `FormData()` object rather than raw JSON.
*   `resourceService.uploadResource(formData)` fires.

### 2. The File Parsing Middleware (`resourceRoutes.js` -> `multer`)
*   The Express route hits `upload.single('file')`.
*   Multer intercepts the data stream. It temporarily parks the incoming file chunks into the `/backend/uploads/` directory on the server disk.

### 3. The Cloudinary Pipeline (`cloudinary.js`)
*   The controller invokes a specialized Cloudinary uploader script (bypassing Mongo entirely for the binary blob).
*   The local file in `/uploads` is streamed to Cloudinary's servers.
*   Cloudinary processes the PDF, stores it permanently, and returns a secure HTTPS string (`secure_url`).
*   The backend script deletes the temporary local file via `fs.unlink()` to preserve server disk space.

### 4. MongoDB Record (`resourceController.js`)
*   Now that the file lives safely in the Cloud, the backend creates a lightweight Mongoose `Resource` document.
*   It saves the Title, Module ID, Upload Date, and critically, the `fileUrl` (Cloudinary link).

### 5. Socket Broadcast (`socket.js`)
*   Before returning `res.json()`, the backend invokes `io.emit('resource_uploaded', moduleCode)`.
*   Any connected student actively sitting on the "Learning" page for that module instantly sees a Toast notification "New Past Paper Uploaded" and their dashboard refreshes automatically without needing to press an F5 reload.
