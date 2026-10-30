from typing import Optional


import psycopg
from fastapi import APIRouter, FastAPI, HTTPException, Path, Query, Request
from models.Employee import Employee
import services.EmployeeService as empService
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from models.PerformanceReview import performance_review_create
import services.PerformanceReviewService as prService
import services.EmployeeService as employee_service
import services.ReviewPeriodService as review_period_service
from models.ErrorResponse import ErrorResponse
from models.PerformanceReview import Review
from models.ReviewPeriod import review_periods as ReviewPeriod


app = FastAPI(title="Employee Performance Review Management System API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(psycopg.OperationalError)
async def database_unavailable_handler(request: Request, exc: psycopg.OperationalError):
    error = ErrorResponse(code="DATABASE_UNAVAILABLE", message="Database is unavailable. Try again later.")
    return JSONResponse(status_code=503, content=error.model_dump())


@app.exception_handler(prService.ReviewNotFoundError)
async def review_not_found_handler(request: Request, exc: prService.ReviewNotFoundError):
    error = ErrorResponse(code="REVIEW_NOT_FOUND", message=str(exc))
    return JSONResponse(status_code=404, content=error.model_dump())

@app.exception_handler(prService.ReviewAlreadyExistsError)
async def review_already_exists_handler(request: Request, exc: prService.ReviewAlreadyExistsError):
    error = ErrorResponse(code="REVIEW_ALREADY_EXISTS", message=str(exc))
    return JSONResponse(status_code=400, content=error.model_dump())



router = APIRouter(prefix="/api")


def _optional_id(value: Optional[str], name: str) -> Optional[int]:
    # Swagger UI sends blank filters as "" instead of omitting them.
    if value is None or value.strip() == "":
        return None
    try:
        parsed = int(value)
    except ValueError:
        raise HTTPException(status_code=422, detail=f"{name} must be an integer")
    if parsed < 1:
        raise HTTPException(status_code=422, detail=f"{name} must be >= 1")
    return parsed


@router.get(
    "/reviews",
    response_model=list[Review],
    summary="List submitted performance reviews",
    description=(
        "Return reviews for the HR review register; optionally filter by the numeric employee primary key "
        "and review period primary key. An empty result is []."
    ),
    tags=["Mandatory - Reviews"],
    operation_id="listReviews",
    responses={503: {"model": ErrorResponse, "description": "Database is unavailable."}},
)
def list_reviews(
    employee_id: Optional[str] = Query(
        None, description="employees.id (numeric DB key), not the EMP101-style code", examples=["1"]
    ),
    period_id: Optional[str] = Query(None, description="review_periods.id (numeric DB key)", examples=["1"]),
):
    return prService.list_reviews(
        employee_id=_optional_id(employee_id, "employee_id"),
        period_id=_optional_id(period_id, "period_id"),
    )

@app.get("/employees", response_model=list[Employee], tags=["Employees"])
def get_employees():
    try:
        return empService.get_all_employees()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch employees"
        )

@router.get(
    "/reviews/{id}",
    response_model=Review,
    summary="Get one submitted review by ID",
    description="Optional classroom extension powering the read-only Review Details screen.",
    tags=["Optional - Review Details"],
    operation_id="getReviewById",
    responses={
        404: {"model": ErrorResponse, "description": "Review not found"},
        503: {"model": ErrorResponse, "description": "Database is unavailable."},
    },
)
def get_review(id: int = Path(..., ge=1, description="Numeric primary key of performance_reviews.id", examples=[101])):
    return prService.get_review(id)



@router.post("/performance-reviews",
             response_model=dict, 
             summary="Create a new performance review", 
             description="Create a new performance review", 
             tags=["Mandatory - Reviews"],operation_id="createPerformanceReview",
             responses={400: {"model": ErrorResponse, "description": "Invalid payload"},
                        503: {"model": ErrorResponse, "description": "Database is unavailable."}}
             )
def create_performance_review(payload: performance_review_create):
    prService.save_performance_review(payload)
    return {"message": "Performance review created successfully"}

@router.get("/employees")
def get_employees():
    employees = employee_service.get_all_employees()
    return {"employees": employees}

@router.get("/review-periods")
def get_review_periods():
    rev_periods = review_period_service.get_All_Review_Periods()
    return {"review_periods": rev_periods}


@router.put("/review-periods/{id}",
            response_model=dict,
            summary="Update review period status",
            description="Update the status of a review period",
            tags=["Mandatory - Review Periods"],
            operation_id="updateReviewPeriod",
            responses={400: {"model": ErrorResponse, "description": "Invalid payload"},
                       503: {"model": ErrorResponse, "description": "Database is unavailable."}}
            )
def update_review_period(id: int, payload: ReviewPeriod):
    review_period_service.update_review_period(id, payload)
    return {"message": "Review period updated successfully"}

app.include_router(router)


