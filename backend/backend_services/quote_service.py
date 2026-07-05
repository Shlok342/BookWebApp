import asyncio
import json
import random
import urllib.request
from pathlib import Path

# 1. Load your local quotes safely
json_path = Path(__file__).parent / "hard_coded_quotes.json"

with open(json_path, "r", encoding="utf-8") as file:
    local_quotes = json.load(file)

# 2. Define the Quote Service
class QuoteService:

    async def get_quote(self):
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
                "author": data[0].get("a", "Unknown"),
            }

        except Exception as e:
            print("Online quote fetch failed, picking a random local fallback. Error:", e)
            
            # Use random.choice to pull a random key from your hard_coded_quotes.json
            random_key = random.choice(list(local_quotes.keys()))
            return local_quotes[random_key]
