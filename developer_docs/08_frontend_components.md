# 08 - Frontend Component Architecture

The frontend (`/frontend/src/components`) isolates reusable UI elements so they can be injected effortlessly into the main Views (`pages`).

## 1. Loaders & Spinners (`/loaders`)
FASNet uses premium, smooth loading animations rather than generic browser spinners.
*   **`UnifiedPageLoader.jsx`**: The full-screen translucent loading overlay used when fetching heavy backend data (like on first dashboard mount).
*   **`Loader.jsx` / `Loader.css`**: Smaller inline spinners for buttons or tiny widget regions.

## 2. Global Modals & Dialogs
*   **`ConfirmDialog.jsx` / `DeleteConfirmModal.jsx`**: Reusable popup modals. Whenever a user (especially a Union Rep) tries to delete a user or update a batch, they invoke these dialogs to prevent accidental misclicks.
*   **`AccountActivationModal.jsx`**: The multi-step wizard specifically triggered on the login screen for new students setting their passwords using OTP.
*   **`IdleWarningModal.jsx`**: Controlled by the `IdleTimerContext`, this modal pops up if the user is inactive for X minutes, warning them they will be logged out to save server resources & secure data.

## 3. Navigation Components
*   **`SideNav.jsx` / `TopNav.jsx`**: The persistent navigational shells. They dynamically evaluate the `user.roles` to determine which links to render (e.g., hiding Admin tabs from basic students).

## 4. Layout Wrappers (`/layouts`)
Layouts enforce the structure of independent pages without rewriting nested logic.
*   **`student/LayoutWrapper.jsx`**: Encases the child Dashboard/Learning pages with the Student SideNav and TopNav.
*   **`AdminLayout.jsx`**: Encases the Superadmin panel entirely, loading a completely different set of navigation structures.

## 5. Reusable UI Widgets & Micro-components
*   **`StatCard.jsx`**: Used heavily across `Dashboard` and `AcademicGrowth`. Standardizes the square "KPI" widget that takes an Icon, Value, and Title.
*   **`Dropdown.jsx`**: A customized `<select>` element with cohesive styling used extensively in the filtering mechanics (e.g., choosing a Semester on the Learning Page).
*   **`FluidGlass.jsx` / Custom UI**: Components injecting the generic glassmorphism tailwind CSS (`backdrop-blur bg-white/60...`) standardized to keep a universal, premium theme.

---
**Core Rule:** If you find yourself writing `className="fixed inset-0 bg-black/50..."` for a popup, stop! Check if a `ConfirmDialog` or common Modal component handles it already.
