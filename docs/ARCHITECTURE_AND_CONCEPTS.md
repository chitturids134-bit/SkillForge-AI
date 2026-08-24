# SkillForge AI — Architecture & Mandatory Engineering Concepts Reference

## 1. JavaScript Concepts Implementation

### A. Closures (`backend/utils/closureUtils.js`)
A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (lexical environment). In SkillForge AI:
- **Debounce Handler Factory** (`createDebounceHandler`): Encapsulates `timeoutId` within its outer lexical scope so that successive calls cancel existing timers without leaking global state.
- **Role Permission Checker** (`createRolePermissionChecker`): Encapsulates an instantiated `Set` of authorized roles within a closure scope to avoid re-parsing array references on every authorization check.

```javascript
export function createRolePermissionChecker(allowedRoles = []) {
  const allowedRolesSet = new Set(allowedRoles.map(r => String(r).toLowerCase())); // Closed scope
  return function(userRole) {
    return allowedRolesSet.has(String(userRole).toLowerCase());
  };
}
```

### B. JavaScript Event Loop Architecture
SkillForge AI relies on Node.js single-threaded event loop model for high-concurrency non-blocking I/O operations:
- **Call Stack**: Synchronous execution of Express routing, middleware verification, and intent classification.
- **Microtasks Queue**: Resolves high-priority Promises returned by Mongoose database queries (`User.findById`) and `fetch` API calls to Gemini LLM endpoints.
- **Macrotasks Queue**: Handles I/O socket events, HTTP network connections, and timers (`setTimeout` inside debounce closures).

### C. Variable & Function Hoisting
SkillForge AI follows strict ES6+ declaration semantics:
- Function declarations (`function foo() {}`) are hoisted with complete body definitions.
- ES module imports and `const` / `let` variables remain in the Temporal Dead Zone (TDZ) prior to declaration, preventing accidental reference errors or uninitialized variable bugs.

### D. Promises vs Callbacks
All asynchronous handlers across SkillForge AI use ES2022 `async / await` built on Promises:
- **Prevents Callback Hell**: Clean linear control flow for multi-step MongoDB operations (e.g., user lookup $ightarrow$ company profile update $ightarrow$ notification dispatch).
- **Centralized Error Propagation**: Unhandled rejections inside `async` Express route handlers are caught by global `errorMiddleware.js`.

---

## 2. Structured AI Output Validation & LLM API Integration

All AI responses (AI Mentor, Technical Interview Screening, ATS Resume Analysis) are processed server-side in backend service modules:
- Server-side validation schema (`validateAiEvaluationSchema`) verifies `overallScore`, `categories`, `strengths`, `weaknesses`, `recommendation`, and `summary` before MongoDB storage.
- If AI response parsing fails, HTTP `422 Unprocessable Entity` is returned without corrupting database documents.
- API keys (`GEMINI_API_KEY`) are stored exclusively in environment variables and never exposed to the client bundle.

---

## 3. Restful HTTP Status Codes Architecture

| Code | Meaning | Example Endpoint |
| :--- | :--- | :--- |
| **200 OK** | Successful retrieval / update | `GET /api/profile/me` |
| **201 Created** | Successful creation | `POST /api/auth/register` |
| **204 No Content** | Successful deletion | `DELETE /api/jobs/:id` |
| **400 Bad Request** | Missing required parameters | Invalid request payload |
| **401 Unauthorized** | Unauthenticated / Invalid JWT | Unauthenticated access attempt |
| **403 Forbidden** | Role or owner mismatch | Candidate modifying another user's interview |
| **404 Not Found** | Record absent in MongoDB | `GET /api/interviews/invalid_id` |
| **422 Unprocessable** | Malformed AI / validation failure | Failed AI structured schema validation |
| **500 Server Error** | Unexpected exception | Centralized error handler fallback |
