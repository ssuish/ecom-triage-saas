import pytest
from unittest.mock import MagicMock, patch
from app.services.tasks import enqueue_job, JobType


def test_job_type_values():
    assert JobType.AI_TRIAGE == "AI_TRIAGE"
    assert JobType.OUTBOUND_EMAIL == "OUTBOUND_EMAIL"


@patch("app.services.tasks.tasks_v2.CloudTasksClient")
def test_enqueue_job_calls_cloud_tasks_when_enabled(mock_client_cls, monkeypatch):
    from app.services import tasks as tasks_module

    monkeypatch.setattr(tasks_module.settings, "CLOUD_TASKS_ENABLED", True)
    monkeypatch.setattr(tasks_module.settings, "GCP_PROJECT_ID", "test-project")
    monkeypatch.setattr(tasks_module.settings, "TASKS_INVOKER_SA_EMAIL", "invoker@test.iam")
    monkeypatch.setattr(tasks_module.settings, "TASKS_OIDC_AUDIENCE", "https://api.example.com")

    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    mock_client.queue_path.return_value = "projects/test/locations/us-central1/queues/triage-queue"

    enqueue_job(JobType.AI_TRIAGE, {"ticket_id": "abc"})

    mock_client.create_task.assert_called_once()
    task = mock_client.create_task.call_args.kwargs["request"]["task"]
    assert "workers/triage" in task["http_request"]["url"]
    assert task["http_request"]["body"] == b'{"ticket_id": "abc"}'


@patch("app.services.tasks.tasks_v2.CloudTasksClient")
def test_enqueue_job_skips_when_disabled(mock_client_cls, monkeypatch):
    from app.services import tasks as tasks_module

    monkeypatch.setattr(tasks_module.settings, "CLOUD_TASKS_ENABLED", False)

    enqueue_job(JobType.AI_TRIAGE, {"ticket_id": "abc"})

    mock_client_cls.assert_not_called()
