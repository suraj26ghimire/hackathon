from __future__ import annotations
import logging
import re
import time
from dataclasses import dataclass
from typing import Optional
from urllib.parse import parse_qs, urlencode, urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup, Tag
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)

@dataclass
class DAADCollectorConfig:
    country_id: Optional[str] = None
    applicant_status: Optional[str] = None
    daad_only: bool = True
    max_pages: int = 5
    max_scholarships: Optional[int] = 100
    delay_seconds: float = 1.0
    timeout_seconds: int = 30

class DAADCollector:
    """
    Collect scholarship records from the public DAAD scholarship database.
    Pipeline: Search page -> discover ?detail= identifiers -> visit detail pages -> extract heading-based sections -> return normalized dictionaries
    The collector does not write to Django models.
    """
    BASE_URL = "https://www2.daad.de"
    SEARCH_URL = (
        "https://www2.daad.de/deutschland/stipendium/"
        "datenbank/en/21148-scholarship-database/"
    )

    DETAIL_ID_PATTERN = re.compile(r"[?&]detail=(\d+)")
    WHITESPACE_PATTERN = re.compile(r"\s+")
    DATE_PATTERN = re.compile(
        r"\b("
        r"\d{1,2}[./-]\d{1,2}[./-]\d{4}"
        r"|"
        r"\d{4}[./-]\d{1,2}[./-]\d{1,2}"
        r"|"
        r"\d{1,2}\s+"
        r"(?:January|February|March|April|May|June|July|August|"
        r"September|October|November|December)"
        r"\s+\d{4}"
        r"|"
        r"(?:January|February|March|April|May|June|July|August|"
        r"September|October|November|December)"
        r"\s+\d{1,2},?\s+\d{4}"
        r")\b",
        re.IGNORECASE,
    )

    SECTION_ALIASES = {
        "objective": ["objective"],
        "who_can_apply": [
            "who can apply?",
            "who can apply",
            "target group",
        ],
        "what_can_be_funded": [
            "what can be funded?",
            "what can be funded",
        ],
        "duration": [
            "duration of the funding",
            "funding duration",
            "duration",
        ],
        "value": [
            "value",
            "funding",
            "scholarship benefits",
        ],
        "selection": [
            "selection",
            "selection criteria",
        ],
        "requirements": [
            "what requirements must be met?",
            "what requirements must be met",
            "application requirements",
        ],
        "language_skills": [
            "language skills",
            "language requirements",
        ],
        "deadline": [
            "application deadline",
            "deadline",
        ],
        "documents": [
            "application documents",
            "documents to be submitted",
            "required documents",
        ],
        "application_location": [
            "application location",
            "where to apply",
        ],
        "contact": [
            "contact and consulting",
            "contact",
        ],
    }

    def __init__(
        self,
        config: Optional[DAADCollectorConfig] = None,
    ) -> None:
        self.config = config or DAADCollectorConfig()
        self.session = self._build_session()

    def _build_session(self) -> requests.Session:
        session = requests.Session()
        retry = Retry(
            total=3,
            connect=3,
            read=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"],
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        session.headers.update(
            {
                "User-Agent": (
                    "ScholarMatchHackathon/1.0 "
                    "(educational scholarship discovery project)"
                ),
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": (
                    "text/html,application/xhtml+xml,"
                    "application/xml;q=0.9,*/*;q=0.8"
                ),
            }
        )
        return session

    def _get(self, url: str) -> requests.Response:
        response = self.session.get(
            url,
            timeout=self.config.timeout_seconds,
        )
        response.raise_for_status()
        return response

    @staticmethod
    def _clean_text(value: Optional[str]) -> str:
        if not value:
            return ""
        return re.sub(r"\s+", " ", value).strip()

    @staticmethod
    def _normalized_heading(value: str) -> str:
        value = value.lower().strip()
        value = value.replace("’", "'")
        value = re.sub(r"\s+", " ", value)
        return value.rstrip(":")

    def _build_search_url(self, page: int) -> str:
        params = {
            "page": page,
            "q": "",
            "subjectGrps": "",
        }
        if self.config.country_id:
            params["origin"] = self.config.country_id
        if self.config.applicant_status:
            params["status"] = self.config.applicant_status
        if self.config.daad_only:
            params["daad"] = "1"
        return f"{self.SEARCH_URL}?{urlencode(params)}"

    def _canonical_detail_url(self, detail_id: str) -> str:
        return f"{self.SEARCH_URL}?detail={detail_id}"

    def discover_detail_urls(self) -> list[str]:
        import json
        
        js_url = "https://www2.daad.de/bundles/daadstipendiendatenbanklsh/data/a/js/scholarships.js"
        logger.info("Downloading DAAD scholarships database from %s", js_url)
        
        response = self._get(js_url)
        match = re.search(r'TAFFY\((.*?)\);', response.text, re.DOTALL)
        if not match:
            logger.error("Could not find TAFFY database in scholarships.js")
            return []
            
        try:
            data = json.loads(match.group(1))
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse DAAD database JSON: %s", exc)
            return []
            
        urls: list[str] = []
        for item in data:
            if self.config.daad_only and str(item.get("isDaad", "")) != "1":
                continue
                
            if self.config.country_id:
                try:
                    if int(self.config.country_id) not in item.get("origin", []):
                        continue
                except ValueError:
                    pass
                    
            if self.config.applicant_status:
                try:
                    if int(self.config.applicant_status) not in item.get("status", []):
                        continue
                except ValueError:
                    pass
            
            sap_prog_id = item.get("sapProgid")
            if not sap_prog_id:
                continue
                
            urls.append(self._canonical_detail_url(str(sap_prog_id)))
            
            if (
                self.config.max_scholarships is not None
                and len(urls) >= self.config.max_scholarships
            ):
                break
                
        return urls

    def _find_main_content(self, soup: BeautifulSoup) -> Tag:
        """
        Prefer semantic containers but fall back to the document body.
        """
        selectors = [
            "main",
            '[role="main"]',
            ".content",
            ".main-content",
            "#content",
            "body",
        ]
        for selector in selectors:
            element = soup.select_one(selector)
            if isinstance(element, Tag):
                return element
        raise ValueError("Could not find DAAD page content")

    def _extract_title_and_organization(
        self,
        main: Tag,
    ) -> tuple[str, str]:
        heading = main.find("h2")
        if not heading:
            return "", "DAAD"

        full_title = self._clean_text(heading.get_text(" ", strip=True))

        # Typical heading:
        # "Study Scholarships ... • DAAD"
        for separator in [" • ", " | "]:
            if separator in full_title:
                title, organization = full_title.rsplit(separator, 1)
                return (
                    self._clean_text(title),
                    self._clean_text(organization),
                )
        return full_title, "DAAD"

    def _get_section_key(self, heading_text: str) -> Optional[str]:
        normalized = self._normalized_heading(heading_text)
        for key, aliases in self.SECTION_ALIASES.items():
            for alias in aliases:
                normalized_alias = self._normalized_heading(alias)
                if normalized == normalized_alias:
                    return key
        return None

    def _extract_heading_sections(self, main: Tag) -> dict[str, str]:
        """
        Extract text appearing after each h3/h4 heading and before
        the next heading. This avoids dependence on fragile CSS
        class names.
        """
        sections: dict[str, list[str]] = {}
        current_section: Optional[str] = None

        for element in main.descendants:
            if not isinstance(element, Tag):
                continue

            if element.name in {"h2", "h3", "h4"}:
                heading_text = self._clean_text(
                    element.get_text(" ", strip=True)
                )
                key = self._get_section_key(heading_text)
                current_section = key
                if key and key not in sections:
                    sections[key] = []
                continue

            if current_section and element.name in {
                "p",
                "li",
                "dd",
                "td",
            }:
                text = self._clean_text(element.get_text(" ", strip=True))
                if text and text not in sections[current_section]:
                    sections[current_section].append(text)

        return {
            key: "\n".join(values).strip()
            for key, values in sections.items()
        }

    def _extract_all_page_text(self, main: Tag) -> str:
        return self._clean_text(main.get_text(" ", strip=True))

    def _extract_source_identifier(self, detail_url: str) -> str:
        query = parse_qs(urlparse(detail_url).query)
        return query.get("detail", [""])[0]

    def _extract_external_links(
        self,
        main: Tag,
        page_url: str,
    ) -> list[str]:
        links: list[str] = []
        for anchor in main.find_all("a", href=True):
            href = urljoin(page_url, anchor["href"])
            parsed = urlparse(href)
            if parsed.scheme not in {"http", "https"}:
                continue
            if href not in links:
                links.append(href)
        return links

    def scrape_detail(self, detail_url: str) -> dict:
        response = self._get(detail_url)
        soup = BeautifulSoup(response.text, "html.parser")
        main = self._find_main_content(soup)

        title, organization = self._extract_title_and_organization(main)
        sections = self._extract_heading_sections(main)
        page_text = self._extract_all_page_text(main)

        description_parts = [
            sections.get("objective", ""),
            sections.get("what_can_be_funded", ""),
            sections.get("duration", ""),
        ]
        eligibility_parts = [
            sections.get("who_can_apply", ""),
            sections.get("requirements", ""),
            sections.get("language_skills", ""),
            sections.get("selection", ""),
        ]

        return {
            "source": "DAAD Scholarship Database",
            "source_identifier": self._extract_source_identifier(
                detail_url
            ),
            "source_url": detail_url,
            "title": title,
            "organization": organization or "DAAD",
            "country": "Germany",
            "description": "\n\n".join(
                value for value in description_parts if value
            ),
            "eligibility": "\n\n".join(
                value for value in eligibility_parts if value
            ),
            "benefits": sections.get("value", ""),
            "required_documents": sections.get("documents", ""),
            "deadline_text": sections.get("deadline", ""),
            "application_location": sections.get(
                "application_location",
                "",
            ),
            "page_text": page_text,
            "external_links": self._extract_external_links(
                main,
                detail_url,
            ),
        }

    def collect(self) -> list[dict]:
        detail_urls = self.discover_detail_urls()
        scholarships: list[dict] = []

        logger.info(
            "Found %s DAAD scholarship detail URLs",
            len(detail_urls),
        )

        for position, detail_url in enumerate(detail_urls, start=1):
            try:
                logger.info(
                    "Scraping DAAD scholarship %s/%s",
                    position,
                    len(detail_urls),
                )
                record = self.scrape_detail(detail_url)
                if record["title"]:
                    scholarships.append(record)
                else:
                    logger.warning(
                        "Skipping record without title: %s",
                        detail_url,
                    )
            except requests.RequestException as exc:
                logger.exception(
                    "Request failed for %s: %s",
                    detail_url,
                    exc,
                )
            except Exception as exc:
                logger.exception(
                    "Parsing failed for %s: %s",
                    detail_url,
                    exc,
                )

            time.sleep(self.config.delay_seconds)

        return scholarships
