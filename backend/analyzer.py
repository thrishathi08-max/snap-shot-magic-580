import csv
import io
import re
from collections import Counter
from typing import Any


# ============================================================
# SENTIMENT
# ============================================================

POSITIVE_WORDS = {
    "good", "great", "excellent", "amazing", "love", "lovely",
    "perfect", "easy", "fast", "helpful", "happy", "smooth",
    "quick", "nice", "brilliant", "faultless", "sturdy"
}

NEGATIVE_WORDS = {
    "bad", "poor", "slow", "late", "broken", "fail", "failed",
    "failing", "failure", "wrong", "missing", "cold", "difficult",
    "confusing", "problem", "problems", "error", "errors", "pain",
    "refund", "waiting", "wait", "declined", "cannot", "can't",
    "never", "damage", "damaged", "unhappy", "terrible"
}

URGENCY_WORDS = {
    "urgent", "immediately", "critical", "asap", "refund",
    "blocked", "cannot", "can't", "never", "failed", "broken"
}


def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-zA-Z']+", text.lower())


def analyze_sentiment(text: str) -> str:
    words = tokenize(text)

    positive_count = sum(word in POSITIVE_WORDS for word in words)
    negative_count = sum(word in NEGATIVE_WORDS for word in words)

    if negative_count > positive_count:
        return "negative"

    if positive_count > negative_count:
        return "positive"

    return "neutral"


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text: str) -> str:
    text = str(text or "").strip()
    text = re.sub(r"\s+", " ", text)
    return text


# ============================================================
# ISSUE DETECTION
# ============================================================

ISSUE_KEYWORDS = {
    "payment": {
        "payment", "pay", "card", "checkout",
        "declined", "transaction", "points", "loyalty"
    },

    "delivery": {
        "delivery", "delivered", "parcel", "package",
        "shipping", "arrived", "driver", "late"
    },

    "waiting": {
        "wait", "waiting", "queue", "delay",
        "delayed", "minutes", "slow"
    },

    "order_accuracy": {
        "wrong", "missing", "incorrect", "order",
        "item", "items", "drink", "side"
    },

    "food_quality": {
        "food", "cold", "temperature", "portion",
        "pasta", "meal", "dish"
    },

    "returns": {
        "return", "refund", "label",
        "returned", "warehouse"
    },

    "app_performance": {
        "app", "load", "loading", "mobile",
        "screen", "button", "slow", "performance"
    },

    "service_quality": {
        "staff", "server", "service",
        "helpful", "attentive", "bill"
    },
}

ISSUE_LABELS = {
    "payment": "Payment",
    "delivery": "Delivery",
    "waiting": "Waiting time",
    "order_accuracy": "Order accuracy",
    "food_quality": "Food quality",
    "returns": "Returns",
    "app_performance": "App performance",
    "service_quality": "Service quality",
}


def detect_issue(text: str) -> tuple[str, float]:
    words = set(tokenize(text))

    scores: dict[str, int] = {}

    for issue, keywords in ISSUE_KEYWORDS.items():
        scores[issue] = len(words.intersection(keywords))

    if not scores:
        return "General", 0.0

    best_issue = max(scores, key=scores.get)
    best_score = scores[best_issue]
    total_score = sum(scores.values())

    if best_score == 0:
        return "General", 0.0

    confidence = (best_score / total_score) * 100

    return ISSUE_LABELS[best_issue], round(confidence, 2)


# ============================================================
# PRIORITY SCORING
# ============================================================

def calculate_priority(
    sentiment: str,
    issue_confidence: float,
    text: str,
) -> int:

    score = 30

    if sentiment == "negative":
        score += 35
    elif sentiment == "positive":
        score -= 10

    score += round(issue_confidence * 0.25)

    words = set(tokenize(text))
    urgency_count = len(words.intersection(URGENCY_WORDS))

    score += min(urgency_count * 5, 20)

    return max(0, min(100, score))


def priority_level(score: int) -> str:
    if score >= 80:
        return "critical"

    if score >= 65:
        return "high"

    if score >= 45:
        return "medium"

    return "low"


# ============================================================
# CSV PARSING
# ============================================================

def parse_csv(contents: bytes) -> list[dict[str, Any]]:
    text = contents.decode("utf-8-sig")

    reader = csv.DictReader(io.StringIO(text))

    return [
        {
            str(key).strip(): value
            for key, value in row.items()
        }
        for row in reader
    ]


def get_feedback_text(row: dict[str, Any]) -> str:
    possible_columns = [
        "text",
        "feedback",
        "comment",
        "review",
        "message",
    ]

    for column in possible_columns:
        value = row.get(column)

        if value and str(value).strip():
            return normalize_text(str(value))

    return ""


# ============================================================
# MAIN ANALYSIS PIPELINE
# ============================================================

def analyze_feedback(
    contents: bytes,
    filename: str = "feedback.csv",
) -> dict[str, Any]:

    rows = parse_csv(contents)

    analyzed_feedback: list[dict[str, Any]] = []

    sentiment_counter = Counter()
    issue_counter = Counter()
    issue_negative_counter = Counter()
    issue_priority_scores: dict[str, list[int]] = {}

    for index, row in enumerate(rows, start=1):

        text = get_feedback_text(row)

        if not text:
            continue

        sentiment = analyze_sentiment(text)

        issue, confidence = detect_issue(text)

        priority_score = calculate_priority(
            sentiment,
            confidence,
            text,
        )

        priority = priority_level(priority_score)

        sentiment_counter[sentiment] += 1
        issue_counter[issue] += 1

        if sentiment == "negative":
            issue_negative_counter[issue] += 1

        issue_priority_scores.setdefault(issue, []).append(
            priority_score
        )

        analyzed_feedback.append(
            {
                "id": f"upload-{index}",
                "text": text,
                "sentiment": sentiment,
                "issue": issue,
                "issueConfidence": confidence,
                "priorityScore": priority_score,
                "priorityLevel": priority,
            }
        )

    total_processed = len(analyzed_feedback)

    negative_count = sentiment_counter.get("negative", 0)

    negative_share = (
        round((negative_count / total_processed) * 100, 2)
        if total_processed
        else 0
    )

    top_issue = (
        issue_counter.most_common(1)[0][0]
        if issue_counter
        else "Unclassified feedback"
    )

    # ========================================================
    # ISSUE SUMMARY
    # ========================================================

    issue_summary = []

    for issue, mentions in issue_counter.most_common():

        negative_mentions = issue_negative_counter.get(issue, 0)

        negative_pct = (
            round((negative_mentions / mentions) * 100, 2)
            if mentions
            else 0
        )

        scores = issue_priority_scores.get(issue, [])

        average_priority = (
            round(sum(scores) / len(scores))
            if scores
            else 0
        )

        issue_summary.append(
            {
                "issue": issue,
                "mentions": mentions,
                "negativePct": negative_pct,
                "priorityScore": average_priority,
                "priorityLevel": priority_level(
                    average_priority
                ),
            }
        )

    # ========================================================
    # RESULT
    # ========================================================

    return {
        "status": "success",
        "filename": filename,
        "rowsProcessed": total_processed,

        "negativeShare": negative_share,

        "sentiment": {
            "positive": sentiment_counter.get("positive", 0),
            "neutral": sentiment_counter.get("neutral", 0),
            "negative": sentiment_counter.get("negative", 0),
        },

        "topIssue": top_issue,

        "issues": issue_summary,

        "feedback": analyzed_feedback,
    }