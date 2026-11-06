import os
import httpx
from dotenv import load_dotenv

load_dotenv()

N8N_WEBHOOK_URL = os.getenv("N8N_ORDER_WEBHOOK_URL")
N8N_WEBHOOK_SECRET = os.getenv("N8N_WEBHOOK_SECRET")


async def trigger_order_created(order_id: int, event_id: str):

    # Validate environment variables
    if not N8N_WEBHOOK_URL:
        raise ValueError("N8N_ORDER_WEBHOOK_URL is missing in .env")

    if not N8N_WEBHOOK_SECRET:
        raise ValueError("N8N_WEBHOOK_SECRET is missing in .env")

    payload = {
        "event": "order.created",
        "event_id": event_id,
        "order_id": order_id
    }

    headers = {
        "X-Webhook-Secret": N8N_WEBHOOK_SECRET
    }

    async with httpx.AsyncClient(timeout=15) as client:

        response = await client.post(
            N8N_WEBHOOK_URL,
            json=payload,
            headers=headers
        )

        print("N8N STATUS CODE:", response.status_code)
        print("N8N RESPONSE:", response.text)

        response.raise_for_status()

        # Don't assume n8n returns JSON
        return {
            "status_code": response.status_code,
            "response": response.text
        }