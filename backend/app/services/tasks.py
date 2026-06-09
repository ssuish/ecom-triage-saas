import enum
import json
from typing import Any

from google.cloud import tasks_v2

from app.settings import settings


class JobType(str, enum.Enum):
    AI_TRIAGE = "AI_TRIAGE"
    OUTBOUND_EMAIL = "OUTBOUND_EMAIL"


_JOB_PATH = {
    JobType.AI_TRIAGE: "workers/triage",
    JobType.OUTBOUND_EMAIL: "workers/email",
}

_QUEUE_SETTING = {
    JobType.AI_TRIAGE: lambda: settings.CLOUD_TASKS_TRIAGE_QUEUE,
    JobType.OUTBOUND_EMAIL: lambda: settings.CLOUD_TASKS_EMAIL_QUEUE,
}


def _queue_path(client: tasks_v2.CloudTasksClient, queue_name: str) -> str:
    return client.queue_path(
        settings.GCP_PROJECT_ID,
        settings.CLOUD_TASKS_LOCATION,
        queue_name,
    )


def enqueue_job(job_type: JobType, payload: dict[str, Any]) -> None:
    """
    Enqueue an HTTP task on Cloud Tasks. No-op when CLOUD_TASKS_ENABLED is False.
    Caller is responsible for ensuring payload matches the worker's expected schema.
    """
    if not settings.CLOUD_TASKS_ENABLED:
        return

    path = _JOB_PATH[job_type]
    url = f"{settings.WORKER_BASE_URL.rstrip('/')}/{path}"
    queue_name = _QUEUE_SETTING[job_type]()

    client = tasks_v2.CloudTasksClient()
    parent = _queue_path(client, queue_name)

    http_request: dict[str, Any] = {
        "http_method": tasks_v2.HttpMethod.POST,
        "url": url,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload).encode(),
    }

    if settings.TASKS_INVOKER_SA_EMAIL and settings.TASKS_OIDC_AUDIENCE:
        http_request["oidc_token"] = {
            "service_account_email": settings.TASKS_INVOKER_SA_EMAIL,
            "audience": settings.TASKS_OIDC_AUDIENCE,
        }

    task = {"http_request": http_request}
    client.create_task(
        request={
            "parent": parent,
            "task": task,
        }
    )
