# Employee Performance Review Management System

Web app for running employee performance reviews: manage review periods, submit 1–5 star reviews for each
employee, and track how many reviews are done for the current period.

The repository has two parts:

| Part                                                    | Stack                               |
| ------------------------------------------------------- | ----------------------------------- |
| [`performance-review-api/`](performance-review-api)     | FastAPI, PostgreSQL (psycopg 3)     |
| [`performance-review-react/`](performance-review-react) | React 19, TypeScript, Vite          |

The frontend runs on `http://localhost:5173` and calls the API on `http://localhost:8000`.

## Contents

- [Quick start](#quick-start)
- [Frontend](#frontend)
  - [Screens](#screens)
  - [API calls per screen](#api-calls-per-screen)
  - [Frontend setup](#frontend-setup)
  - [Frontend layout](#frontend-layout)
- [Backend](#backend)
  - [Endpoints](#endpoints)
  - [Errors](#errors)
  - [Database](#database)
  - [Backend setup](#backend-setup)
  - [Tests](#tests)
  - [Backend layout](#backend-layout)

## Quick start

1. **Backend**: create the database and `.env` ([details](#backend-setup)), then start the API on port 8000:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   cd performance-review-api
   ..\.venv\Scripts\python.exe -m uvicorn main:app --reload
   ```

2. **Frontend**: in a second terminal, start the dev server on port 5173:

   ```bash
   cd performance-review-react
   npm install
   npm run dev
   ```

3. Open http://localhost:5173. The app opens on the Dashboard.

---

## Frontend

React + TypeScript single-page app in [`performance-review-react/`](performance-review-react).

**Tech stack:** React 19, TypeScript, Vite (with the React Compiler via Babel), plain CSS with one stylesheet per
component, ESLint.

### Screens

#### Dashboard

Summary of the current review cycle: employee counts, reviews submitted vs. pending for the open period,
a completion progress bar, the current period's dates, the latest reviews and the employees still waiting for one.

![Dashboard](performance-review-react/docs/screenshots/dashboard.png)

#### Employees

Card view of every employee with code, department, email and status. The search box filters by name,
employee ID or department as you type.

![Employees](performance-review-react/docs/screenshots/employees.png)

#### Review Periods

All review periods with their dates and status; open periods are listed first and highlighted.
**Make Active** opens a closed period and closes the one that was open.

![Review Periods](performance-review-react/docs/screenshots/review-periods.png)

#### Reviews

Table of submitted reviews with the three ratings, average and status. Filter by review period and/or employee,
then **Search**. Results are paged five at a time; **View** opens the review.

![Reviews](performance-review-react/docs/screenshots/reviews.png)

#### Review Details

Read-only view of one review: employee, period, overall rating, a star rating per criterion and the manager's
comments. **Back to List** returns to Reviews.

![Review Details](performance-review-react/docs/screenshots/review-details.png)

#### Submit Review

Form to review an active employee for a review period. All fields are required; ratings are 1–5 stars for
Quality of Work, Delivery & Ownership, and Teamwork & Collaboration. On success the form clears and shows a
confirmation; API errors (for example, a duplicate review) are shown above the buttons.

![Submit Review](performance-review-react/docs/screenshots/submit-review.png)

Submitting with missing fields shows a message next to each one:

![Submit Review validation](performance-review-react/docs/screenshots/submit-review-validation.png)

> **Reports**, **Settings** and **Logout** are in the side menu but are placeholders for now.

### API calls per screen

| Screen          | Endpoint(s)                                                                       |
| --------------- | --------------------------------------------------------------------------------- |
| Dashboard       | `GET /api/employees`, `GET /api/review-periods`, `GET /api/reviews?period_id=`    |
| Employees       | `GET /api/employees`                                                              |
| Review Periods  | `GET /api/review-periods`, `PUT /api/review-periods/{id}`                         |
| Reviews         | `GET /api/reviews?period_id=&employee_id=`                                        |
| Review Details  | `GET /api/reviews/{id}`                                                           |
| Submit Review   | `GET /api/employees`, `GET /api/review-periods`, `POST /api/performance-reviews`  |

The API base URL (`http://localhost:8000`) is currently written into each component's `fetch` call.

### Frontend setup

Prerequisites: Node.js 20+, and the backend running on `http://localhost:8000`.

From `performance-review-react/`:

```bash
npm install
npm run dev
```

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot reload |
| `npm run build`   | Type-check and build to `dist/`           |
| `npm run preview` | Serve the production build locally        |
| `npm run lint`    | Run ESLint                                |

### Frontend layout

```
performance-review-react/
  src/
    App.tsx                     Page switching (side-nav state) and layout
    components/
      navigation/               SideNav
      dashboard/                Dashboard
      employee/                 EmployeeListPage, EmployeeDropdown
      review_period/            ReviewPeriodPage, ReviewPeriodDropdown
      review_list/              ReviewListPage, ReviewTable, StatusBadge
      review_details/           ReviewDetailsPage
      review_form/              ReviewFormPage (Submit Review)
      star_rating/              StarRating input
      pagination/               Pagination control
    hooks/                      usePaginatedFetch
    interfaces/                 TypeScript types matching the API responses
  docs/screenshots/             Screenshots used in this README
```

---

## Backend

FastAPI service in [`performance-review-api/`](performance-review-api), backed by PostgreSQL with plain SQL
(no ORM).

**Tech stack:** Python 3.11+, FastAPI + Uvicorn, Pydantic v2, psycopg 3, python-dotenv, pytest + httpx.

### Endpoints

All routes are under `/api`. Interactive docs are at http://localhost:8000/docs once the server is running.

| Method | Path                          | Description                                                                  |
| ------ | ----------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/api/employees`              | All employees, wrapped as `{"employees": [...]}`.                             |
| GET    | `/api/review-periods`         | All review periods, wrapped as `{"review_periods": [...]}`.                   |
| PUT    | `/api/review-periods/{id}`    | Update a period's status. Making a period `Open` closes the currently open one. |
| GET    | `/api/reviews`                | List reviews, newest first. Optional `employee_id` and `period_id` filters.   |
| GET    | `/api/reviews/{id}`           | One review by ID; `404 REVIEW_NOT_FOUND` if it doesn't exist.                 |
| POST   | `/api/performance-reviews`    | Submit a new review.                                                          |

#### `GET /api/reviews`

```
GET /api/reviews?employee_id=1&period_id=1
```

- `employee_id` / `period_id` are the numeric database keys (`employees.id`, `review_periods.id`), not the
  `EMP101`-style code.
- `200`: JSON array of reviews (`[]` when nothing matches).
- `422`: a filter is not an integer or is below 1.

Each review looks like:

```json
{
  "id": 101,
  "employee_id": 1,
  "employee_code": "EMP101",
  "employee_name": "Arun Kumar",
  "period_id": 2,
  "period_name": "H2 2026",
  "quality_rating": 4,
  "delivery_rating": 5,
  "teamwork_rating": 4,
  "average_rating": 4.33,
  "comments": "Strong ownership and collaboration.",
  "status": "Completed",
  "created_at": "2026-10-25T09:30:00Z"
}
```

#### `POST /api/performance-reviews`

```json
{
  "employee_id": 1,
  "period_id": 2,
  "quality_rating": 4,
  "delivery_rating": 5,
  "teamwork_rating": 4,
  "comments": "Strong ownership and collaboration."
}
```

Rules enforced by `services/PerformanceReviewService.py`:

- All three ratings are required and must be between 1 and 5.
- The review period must exist and be `Open`.
- Only one review per employee per period; a duplicate returns `400 REVIEW_ALREADY_EXISTS`.
- `average_rating` is calculated by the API, not sent by the client.

`200`: `{"message": "Performance review created successfully"}`.

#### `PUT /api/review-periods/{id}`

Send the full period with the new status:

```json
{ "id": 1, "name": "H1 2026", "start_date": "2026-01-01", "end_date": "2026-06-30", "status": "Open" }
```

### Errors

Known errors use one body shape:

```json
{ "code": "DATABASE_UNAVAILABLE", "message": "Database is unavailable. Try again later." }
```

| Status | Code                    | When                                          |
| ------ | ----------------------- | --------------------------------------------- |
| 400    | `REVIEW_ALREADY_EXISTS` | Employee already has a review for the period. |
| 404    | `REVIEW_NOT_FOUND`      | `GET /api/reviews/{id}` with an unknown id.   |
| 503    | `DATABASE_UNAVAILABLE`  | PostgreSQL can't be reached.                  |

### Database

[`schema.sql`](performance-review-api/schema.sql) creates three tables:

| Table                 | Purpose                                                                     |
| --------------------- | --------------------------------------------------------------------------- |
| `employees`           | Employee code (`EMP101`), name, department, email, `Active`/`Inactive`.     |
| `review_periods`      | Name (`H1 2026`), start/end dates, `Open`/`Closed`.                         |
| `performance_reviews` | Three 1–5 ratings, average, comments. Unique on `(employee_id, period_id)`. |

### Backend setup

**1. Python environment.** From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

**2. Database.** Create a PostgreSQL database, then create the tables:

```powershell
psql -d performance_review -f performance-review-api/schema.sql
```

**3. Configuration.** Create `performance-review-api/.env`:

```
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/performance_review
```

The app and the tests won't start without `DATABASE_URL`. Don't commit this file.

**4. Run.** From `performance-review-api/`:

```powershell
..\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

- API: http://localhost:8000/api
- Swagger UI: http://localhost:8000/docs

CORS is open to all origins so the Vite dev server (`http://localhost:5173`) can call it.

### Tests

From `performance-review-api/`:

```powershell
..\.venv\Scripts\python.exe -m pytest -v
```

The tests run against the real database. They insert and then delete their own employees, review periods and
reviews, so the database user needs `SELECT`, `INSERT` and `DELETE` on `employees`, `review_periods` and
`performance_reviews`, plus `USAGE` on their id sequences.

### Backend layout

```
performance-review-api/
  main.py                       FastAPI app, routes, exception handlers
  db/database.py                .env loading + get_connection()
  models/
    Employee.py                 Employee response model
    PerformanceReview.py        Review response model, create payload
    ReviewPeriod.py             Review period model
    ErrorResponse.py            {code, message} error body
  repositories/                 SQL, one module per table
  services/                     Business rules, one module per resource
  schema.sql                    Table definitions
  tests/test_reviews.py         API tests for the reviews endpoints
```
