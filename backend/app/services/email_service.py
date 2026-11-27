from email.message import EmailMessage
import smtplib
from urllib.parse import quote

from fastapi import HTTPException

from app.config import get_settings


def send_security_email(to_email: str, subject: str, text: str, html: str | None = None) -> None:
    """Send a security email. Fail closed when SMTP has not been configured."""
    settings = get_settings()
    if not all((settings.SMTP_SERVER, settings.SMTP_USERNAME, settings.SMTP_PASSWORD,
                settings.SMTP_FROM_EMAIL)):
        raise HTTPException(status_code=503, detail="Email delivery is not configured")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = to_email
    message.set_content(text)
    if html:
        message.add_alternative(html, subtype="html")
    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=15) as smtp:
            smtp.ehlo()
            if settings.SMTP_USE_TLS:
                smtp.starttls()
                smtp.ehlo()
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException) as exc:
        raise HTTPException(status_code=503, detail="Could not send email. Please try again later") from exc


def security_link(path: str, token: str) -> str:
    return f"{get_settings().FRONTEND_URL.rstrip('/')}{path}?token={quote(token)}"
