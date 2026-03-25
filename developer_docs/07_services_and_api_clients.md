# 07 - Frontend API Services

When the React frontend needs data (or needs to change data), it relies on the `/frontend/src/services` directory. These are Axios wrapper classes that keep our React components clean from messy HTTP logic.

## How it works
All HTTP requests route through an **Axios Interceptor** configured in `api.js` or directly inside the service file.
1.  **Auth Token Injection:** Every outgoing request intercepts the call, checks `localStorage` for a JWT, and attaches it as `Authorization: Bearer <token>`.
2.  **Base URL Mapping:** Points automatically to the backend URL defined by `VITE_API_URL`.

## Core Service Map

### `authService.js` (The Core Monolith)
This file (or set of exports) is the most critical service cluster. It exports multiple distinct service objects:

*   **`authService`**
    *   `login(email, password)`: Post request to get the JWT.
    *   `verifyOTP(regNo, otp)`: Finishes the Account Activation phase.
    *   *Storage Methods:* Syntactic sugar functions to safely `getToken()`, `setToken()`, and `logout()` the active user from localStorage.

*   **`academicService`**
    *   `getStudentDashboard()`: Aggregates the homepage data.
    *   `getStudentProfile(id)`: Gets metadata.
    *   `getStudentModules()`: Fetches the modules a student is actively enrolled in for the current semester.

*   **`resourceService`**
    *   `getBulkResources([moduleIds])`: A highly optimized endpoint allowing the frontend to send an array of IDs resulting in a single DB query, rather than pinging the API 10 times for 10 modules.

### `socketService.js`
While strictly not a traditional HTTP service, this handles the WebSocket connections.
*   Uses a Singleton pattern so that multiple components don't accidentally establish 5 different socket connections simultaneously.
*   Automatically disconnects if the user logs out.

### `noticeService.js` (Optional/External)
*   Fetches recent announcements pushed by the Union or Faculty for the dashboard.
*   `getAll()`: Promisified fetch of active notices.

## Best Practice Example
When fetching data inside a React Component, do **not** use raw `fetch()` or `axios.get()`. Use the predefined services instead:

```javascript
// BAD ❌
const res = await axios.get(`${import.meta.env.VITE_API_URL}/academic/dashboard`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

// GOOD ✅
const res = await academicService.getStudentDashboard()
```
