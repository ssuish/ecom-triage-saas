import logging

import resend

from app.logging_config import log_event
from app.settings import settings

logger = logging.getLogger(__name__)

resend.api_key = settings.RESEND_API_KEY


def send_confirmation_email(
    to: str,
    customer_name: str,
    ticket_id: str,
    subject: str,
    magic_link: str,
) -> None:
    """Send ticket confirmation email with magic link. Logs email_send_failed on error."""
    import html as html_module

    safe_name = html_module.escape(customer_name)
    safe_subject = html_module.escape(subject)
    safe_link = html_module.escape(magic_link)
    html = f"""
    <p>Hi {safe_name},</p>
    <p>We received your support request: <strong>{safe_subject}</strong></p>
    <p>You can track your ticket status at any time using this link:</p>
    <p><a href="{safe_link}">{safe_link}</a></p>
    <p>We'll be in touch soon.</p>
    <p>— The Triage Support Team</p>
    """
    try:
        resend.Emails.send(
            {
                "from": settings.FROM_EMAIL,
                "to": [to],
                "subject": f"We received your request: {subject}",
                "html": html,
            }
        )
    except Exception:
        log_event(
            logger,
            logging.ERROR,
            "email_send_failed",
            ticket_id=ticket_id,
            type="confirmation",
        )


def send_reply_email(
    to: str,
    customer_name: str,
    subject: str,
    agent_reply: str,
    magic_link: str,
    ticket_id: str = "n/a",
) -> None:
    """Send agent reply email. Logs email_send_failed on error."""
    import html as html_module

    safe_name = html_module.escape(customer_name)
    safe_subject = html_module.escape(subject)
    safe_reply = html_module.escape(agent_reply)
    safe_link = html_module.escape(magic_link)
    html = f"""
    <p>Hi {safe_name},</p>
    <p>Our team has responded to your request: <strong>{safe_subject}</strong></p>
    <blockquote>{safe_reply}</blockquote>
    <p>View your full ticket status: <a href="{safe_link}">{safe_link}</a></p>
    <p>— The Triage Support Team</p>
    """
    try:
        resend.Emails.send(
            {
                "from": settings.FROM_EMAIL,
                "to": [to],
                "subject": f"Response to your request: {subject}",
                "html": html,
            }
        )
    except Exception:
        log_event(
            logger,
            logging.ERROR,
            "email_send_failed",
            ticket_id=ticket_id,
            type="reply",
        )
