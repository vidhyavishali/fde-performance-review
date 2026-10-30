from models.ReviewPeriod import review_periods

from db.database import get_connection
# from table review_periods create a function to get all review periods from the database
def get_all_review_periods() -> list[review_periods]:
    connection = get_connection()
    if connection is None:
        raise RuntimeError("Database connection could not be established.")
    cursor = connection.cursor()
    # if review_periods table does not exist, throw Error
    try:
        cursor.execute("SELECT * FROM review_periods")
    except Exception as e:
        raise RuntimeError(f"Error fetching review periods: {e}") from e
    rev_periods = cursor.fetchall()
    cursor.close()
    connection.close()
    print("data "+str(rev_periods))
    return [review_periods(**rp) for rp in rev_periods]

def get_review_period(period_id: int) -> review_periods:
    connection = get_connection()
    if connection is None:
        raise RuntimeError("Database connection could not be established.")
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT * FROM review_periods WHERE id = %s", (period_id,))
    except Exception as e:
        raise RuntimeError(f"Error fetching review period: {e}") from e
    rev_period = cursor.fetchone()
    cursor.close()
    connection.close()
    if rev_period is None:
        return None
    return review_periods(**rev_period)

def update_review_period(rev_period: review_periods):
    connection = get_connection()
    if connection is None:
        raise RuntimeError("Database connection could not be established.")
    cursor = connection.cursor()
    try:
        cursor.execute(
            "UPDATE review_periods SET status = %s WHERE id = %s",
            (rev_period.status, rev_period.id)
        )
        connection.commit()
    except Exception as e:
        raise RuntimeError(f"Error updating review period: {e}") from e
    finally:
        cursor.close()
        connection.close()

def get_open_review_period() -> review_periods:
    connection = get_connection()
    if connection is None:
        raise RuntimeError("Database connection could not be established.")
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT * FROM review_periods WHERE status = 'Open' LIMIT 1")
    except Exception as e:
        raise RuntimeError(f"Error fetching open review period: {e}") from e
    open_period = cursor.fetchone()
    cursor.close()
    connection.close()
    if open_period is None:
        return None
    return review_periods(**open_period)

