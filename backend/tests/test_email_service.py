import pytest
from unittest.mock import MagicMock, patch
from app.services.email import send_confirmation_email, send_reply_email


@patch("app.services.email.resend")
def test_send_confirmation_email_calls_resend(mock_resend):
    mock_resend.Emails.send.return_value = {"id": "email-123"}

    send_confirmation_email(
        to="user@example.com",
        customer_name="Jane",
        ticket_id="ticket-abc",
        subject="My issue",
        magic_link="https://app.example.com/ticket/ticket-abc?token=tok",
    )

    mock_resend.Emails.send.assert_called_once()
    call_kwargs = mock_resend.Emails.send.call_args[0][0]
    assert call_kwargs["to"] == ["user@example.com"]
    assert "Jane" in call_kwargs["html"]
    assert "https://app.example.com/ticket/ticket-abc?token=tok" in call_kwargs["html"]


@patch("app.services.email.resend")
def test_send_reply_email_calls_resend(mock_resend):
    mock_resend.Emails.send.return_value = {"id": "email-456"}

    send_reply_email(
        to="user@example.com",
        customer_name="Jane",
        subject="My issue",
        agent_reply="We've resolved your issue.",
        magic_link="https://app.example.com/ticket/ticket-abc?token=tok",
        ticket_id="ticket-abc",
    )

    call_kwargs = mock_resend.Emails.send.call_args[0][0]
    assert "We&#x27;ve resolved your issue." in call_kwargs["html"]


@patch("app.services.email.log_event")
@patch("app.services.email.resend")
def test_email_service_logs_on_resend_exception(mock_resend, mock_log_event):
    mock_resend.Emails.send.side_effect = Exception("Resend down")
    send_confirmation_email(
        to="u@u.com",
        customer_name="U",
        ticket_id="t",
        subject="S",
        magic_link="https://app.example.com/ticket/t?token=tok",
    )
    mock_log_event.assert_called_once()
    assert mock_log_event.call_args[0][2] == "email_send_failed"
    assert mock_log_event.call_args[1]["ticket_id"] == "t"
