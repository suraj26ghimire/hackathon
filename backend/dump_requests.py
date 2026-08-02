import json
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        requests_data = []

        page.on("request", lambda request: requests_data.append({
            "url": request.url,
            "method": request.method,
        }))

        await page.goto("https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/")
        await page.wait_for_timeout(5000) # wait 5 seconds for ajax
        
        with open("network_requests.json", "w") as f:
            json.dump(requests_data, f, indent=2)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
