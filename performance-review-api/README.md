# Employee Performance Review Management System — API

FastAPI service backed by PostgreSQL (psycopg 3, plain SQL, no ORM). It serves the
[React frontend](../performance-review-react/README.md) at `http://localhost:8000`.

## Tech stack

- Python 3.11+
- FastAPI + Uvicorn
- Pydantic v2 for request/response models
- psycopg 3 (`dict_row` rows) for PostgreSQL
- python-dotenv for configuration
- pytest + httpx for API tests

## Endpoints

All routes are under `/api`. Interactive docs are at http://localhost:8000/docs once the server is running.

| Method | Path                          | Description                                                                 |
| ------ | ----------------------------- | --------------------------------------------------------------------------- |
| GET    | `/api/employees`              | All employees, wrapped as `{"employees": [...]}`.                            |
| GET    | `/api/review-periods`         | All review periods, wrapped as `{"review_periods": [...]}`.                  |
| PUT    | `/api/review-periods/{id}`    | Update a period's status. Making a period `Open` closes the currently open one. |
| GET    | `/api/reviews`                | List reviews, newest first. Optional `employee_id` and `period_id` filters.  |
| GET    | `/api/reviews/{id}`           | One review by ID; `404 REVIEW_NOT_FOUND` if it doesn't exist.                |
| POST   | `/api/performance-reviews`    | Submit a new review.                                                         |

### `GET /api/reviews`

```
GET /api/reviews?employee_id=1&period_id=1
```

- `employee_id` / `period_id` are the numeric database keys (`employees.id`, `review_periods.id`), not the `EMP101`-style code.
- `200` — JSON array of reviews (`[]` when nothing matches).
- `422` — a filter is not an integer or is below 1.

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

### `POST /api/performance-reviews`

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
- Only one review per employee per period — a duplicate returns `400 REVIEW_ALREADY_EXISTS`.
- `average_rating` is calculated by the API, not sent by the client.

`200` — `{"message": "Performance review created successfully"}`.

### `PUT /api/review-periods/{id}`

Send the full period with the new status:

```json
{ "id": 1, "name": "H1 2026", "start_date": "2026-01-01", "end_date": "2026-06-30", "status": "Open" }
```

### Errors

Known errors use one body shape:

```json
{ "code": "DATABASE_UNAVAILABLE", "message": "Database is unavailable. Try again later." }
```

| Status | Code                    | When                                       |
| ------ | ----------------------- | ------------------------------------------ |
| 400    | `REVIEW_ALREADY_EXISTS` | Employee already has a review for the period. |
| 404    | `REVIEW_NOT_FOUND`      | `GET /api/reviews/{id}` with an unknown id. |
| 503    | `DATABASE_UNAVAILABLE`  | PostgreSQL can't be reached.               |

## Database

`schema.sql` creates three tables:

| Table                 | Purpose                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| `employees`           | Employee code (`EMP101`), name, department, email, `Active`/`Inactive`. |
| `review_periods`      | Name (`H1 2026`), start/end dates, `Open`/`Closed`.                     |
| `performance_reviews` | Three 1–5 ratings, average, comments. Unique on `(employee_id, period_id)`. |

## Project layout

```
main.py                                   FastAPI app, routes, exception handlers
db/database.py                            .env loading + get_connection()
models/
  Employee.py                             Employee response model
  PerformanceReview.py                    Review response model, create payload
  ReviewPeriod.py                         Review period model
  ErrorResponse.py                        {code, message} error body
repositories/                             SQL, one module per table
services/                                 Business rules, one module per resource
schema.sql                                Table definitions
tests/test_reviews.py                     API tests for the reviews endpoints
```

## Setup

### 1. Python environment

From the repository root (`fde-performance-review/`):

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 2. Database

Create a PostgreSQL database, then create the tables:

```powershell
psql -d performance_review -f schema.sql
```

### 3. Configuration

Create `performance-review-api/.env`:

```
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/performance_review
```

The app and the tests won't start without `DATABASE_URL`. Don't commit this file.

## Run

From `performance-review-api/`:

```powershell
..\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

- API: http://localhost:8000/api
- Swagger UI: http://localhost:8000/docs

CORS is open to all origins so the Vite dev server (`http://localhost:5173`) can call it.

## Test

From `performance-review-api/`:

```powershell
..\.venv\Scripts\python.exe -m pytest -v
```

The tests run against the real database. They insert and then delete their own employees, review periods
and reviews, so the database user needs `SELECT`, `INSERT` and `DELETE` on `employees`, `review_periods` and
`performance_reviews`, plus `USAGE` on their id sequences.
