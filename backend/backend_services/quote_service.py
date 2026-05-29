import urllib.request
import json 
import asyncio
async def get_quote():
    def _fetch_quote():
        req = urllib.request.Request(
            "https://zenquotes.io/api/today",
            headers={"User-Agent": "BookWebApp/1.0"},
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read().decode())

    try:
        data = await asyncio.to_thread(_fetch_quote)

        if not data or "q" not in data[0]:
            raise ValueError("Invalid API response")

        return {
            "quote": data[0].get("q", "No quote"),
            "author": data[0].get("a", "Unknown")
        }

    except Exception as e:
        print("Quote fetch failed:", e)  # 👈 useful for debugging
        return {
            "quote": "A reader lives a thousand lives before he dies.",
            "author": "George R.R. Martin"
        }