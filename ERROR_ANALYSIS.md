# Error Analysis Report

## The Original Error

```
ObjectParameterError: Parameter "filter" to findOne() must be an object, got "test@test.com" (type string)
    at Query.findOne (backend\node_modules\mongoose\lib\query.js:2834:16)
    at Function.findOne (backend\node_modules\mongoose\lib\model.js:2194:13)
    at registerUser (backend\src\controllers\auth.controller.js:10:49)
```

## Where the error occurred

| Location | File | Line | Description |
|----------|------|------|-------------|
| **Root cause** | `backend/src/controllers/auth.controller.js` | ~10 | `findOne()` was called with a plain string (`"test@test.com"`) instead of an object filter. Mongoose requires the filter to be an object like `{ email: "test@test.com" }`. |

## Underlying bugs found alongside the error

| # | File | Problem | Fix |
|---|------|---------|-----|
| 1 | `auth.controller.js` | `findOne` was receiving a raw string instead of an object filter | Use `findOne({ email })` |
| 2 | `auth.controller.js` | `loginUser` was commented out and **not exported** | Restored `loginUser` and added it to `module.exports` |
| 3 | `auth.controller.js` | Used `fullname` (lowercase) but schema expects `fullName` (camelCase) | Changed to `fullName` to match `user.model.js` |
| 4 | `auth.controller.js` | No `try/catch` blocks — errors crashed the server | Added `try/catch` to both routes |
| 5 | `auth.routes.js` | Route handlers were empty (`router.post('/user/register', )`) | Wired them to `authcontroller.registerUser` / `authcontroller.loginUser` |

## Files changed

- `backend/src/controllers/auth.controller.js` — rewritten with all fixes
- `backend/src/routes/auth.routes.js` — restored the missing route handlers

## Verification

Both files pass `node --check` syntax validation.

## How to test

```bash
cd backend
npm start
```

- `POST /api/auth/user/register` with body:
  ```json
  { "fullName": "Test", "email": "test@test.com", "password": "123456" }
  ```
- `POST /api/auth/user/login` with body:
  ```json
  { "email": "test@test.com", "password": "123456" }
