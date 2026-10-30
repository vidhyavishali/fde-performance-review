from repositories import ReviewPeriodRepository as rpRepo

from models.ErrorResponse import ErrorResponse
from models.ReviewPeriod import review_periods as ReviewPeriod



def check_review_period_open(period_id: int): 
   rev_period: ReviewPeriod = rpRepo.get_review_period(period_id)
   if rev_period is None:
        error = ErrorResponse(code="REVIEW_PERIOD_NOT_FOUND", message="Review period not found")
        raise Exception(error.message)
   if not rev_period.status.upper() == "open".upper():
        error = ErrorResponse(code="REVIEW_PERIOD_NOT_OPEN", message="The review period is not open for submissions")
        raise Exception(error.message)

def get_All_Review_Periods() -> list[ReviewPeriod]: 
    return rpRepo.get_all_review_periods()  

def get_Open_Review_Period() -> ReviewPeriod:
    open_period = rpRepo.get_open_review_period();
    if open_period is None:
        error = ErrorResponse(code="OPEN_REVIEW_PERIOD_NOT_FOUND", message="No open review period found")
        raise Exception(error.message)
    return open_period

def update_review_period(period_id: int, payload: ReviewPeriod):
    rev_period: ReviewPeriod = rpRepo.get_review_period(period_id)
    if rev_period is None:
        error = ErrorResponse(code="REVIEW_PERIOD_NOT_FOUND", message="Review period not found")
        raise Exception(error.message)
    if hasattr(payload, "status"):
        rev_period.status = payload.status
    openReviewPeriod = get_Open_Review_Period()
    openReviewPeriod.status = "Closed"
    rpRepo.update_review_period(openReviewPeriod)
    rpRepo.update_review_period(rev_period)
