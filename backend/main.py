from fastapi import FastAPI, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware

from data import (
    get_cross_themes,
    get_decisions,
    get_feedback,
    get_issue_by_id,
    get_issues,
    get_metrics,
    get_sentiment_trend,
)


app = FastAPI(
    title="InsightFlow API",
    description="Backend API for turning messy human feedback into product decisions",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "InsightFlow API is running",
        "status": "ok",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/issues")
def issues_endpoint(
    industry: str = Query(default="all"),
    days: int = Query(default=30),
):
    return get_issues(industry)


@app.get("/issues/{issue_id}")
def issue_endpoint(issue_id: str):
    issue = get_issue_by_id(issue_id)

    if issue is None:
        return {
            "error": "Issue not found"
        }

    return issue


@app.get("/feedback")
def feedback_endpoint(
    industry: str = Query(default="all"),
    sentiment: str = Query(default="all"),
    rating: str = Query(default="all"),
    issue_id: str = Query(default="all"),
    search: str = Query(default=""),
    days: int = Query(default=90),
):
    return get_feedback(
        industry=industry,
        sentiment=sentiment,
        rating=rating,
        issue_id=issue_id,
        search=search,
        days=days,
    )


@app.get("/decisions")
def decisions_endpoint(
    industry: str = Query(default="all"),
):
    return get_decisions(industry)


@app.get("/insights/cross-domain")
def cross_domain_endpoint():
    return get_cross_themes()


@app.get("/sentiment/trend")
def sentiment_trend_endpoint(
    industry: str = Query(default="all"),
    days: int = Query(default=30),
):
    return get_sentiment_trend(days)


@app.get("/metrics")
def metrics_endpoint(
    industry: str = Query(default="all"),
    days: int = Query(default=30),
):
    return get_metrics(
        industry=industry,
        days=days,
    )


@app.post("/analyze")
async def analyze_endpoint(
    file: UploadFile = File(...),
    industry: str = Query(default="ecommerce"),
):
    contents = await file.read()

    return {
        "status": "success",
        "filename": file.filename,
        "industry": industry,
        "message": "Feedback file received successfully.",
        "rowsReceived": len(contents.splitlines()),
        "nextStep": "AI analysis pipeline can process this feedback.",
    }