from __future__ import annotations
import re
from datetime import date
from typing import Optional
from dateutil import parser as date_parser

class ScholarshipCleaner:
    GPA_PATTERNS = [
        re.compile(
            r"(?:minimum|required|at least)\s+gpa"
            r"\s*(?:of|:)?\s*(\d(?:\.\d{1,2})?)",
            re.IGNORECASE,
        ),
        re.compile(
            r"gpa\s*(?:of|:)?\s*(\d(?:\.\d{1,2})?)",
            re.IGNORECASE,
        ),
    ]

    EXACT_DATE_PATTERNS = [
        re.compile(
            r"\b\d{1,2}\s+"
            r"(?:January|February|March|April|May|June|July|"
            r"August|September|October|November|December)"
            r"\s+\d{4}\b",
            re.IGNORECASE,
        ),
        re.compile(
            r"\b(?:January|February|March|April|May|June|July|"
            r"August|September|October|November|December)"
            r"\s+\d{1,2},?\s+\d{4}\b",
            re.IGNORECASE,
        ),
        re.compile(r"\b\d{4}-\d{1,2}-\d{1,2}\b"),
        re.compile(r"\b\d{1,2}[./-]\d{1,2}[./-]\d{4}\b"),
    ]

    EDUCATION_LEVEL_RULES = [
        (
            "phd",
            [
                "doctoral candidate",
                "doctoral candidates",
                "doctoral degree",
                "doctorate",
                "phd",
                "postdoctoral",
            ],
        ),
        (
            "masters",
            [
                "master's degree",
                "masters degree",
                "master studies",
                "postgraduate",
                "graduates",
                "graduate degree",
            ],
        ),
        (
            "bachelors",
            [
                "bachelor's degree",
                "bachelors degree",
                "undergraduate",
                "first degree",
            ],
        ),
    ]

    FIELD_RULES = {
        "stem": [
            "stem",
            "engineering",
            "computer science",
            "mathematics",
            "natural sciences",
            "technology",
        ],
        "arts": [
            "fine art",
            "design",
            "film",
            "music",
            "performing art",
        ],
        "architecture": [
            "architecture",
            "urban design",
        ],
        "development studies": [
            "development policy",
            "development studies",
            "development-related",
        ],
    }

    @staticmethod
    def clean_text(value: str) -> str:
        if not value:
            return ""
        lines = [
            re.sub(r"\s+", " ", line).strip()
            for line in value.splitlines()
        ]
        return "\n".join(line for line in lines if line)

    def extract_gpa(self, text: str) -> Optional[float]:
        for pattern in self.GPA_PATTERNS:
            match = pattern.search(text)
            if not match:
                continue
            value = float(match.group(1))
            if 0 <= value <= 4:
                return value
        return None

    def extract_deadline(
        self, deadline_text: str,
    ) -> Optional[date]:
        if not deadline_text:
            return None
        for pattern in self.EXACT_DATE_PATTERNS:
            match = pattern.search(deadline_text)
            if not match:
                continue
            try:
                parsed = date_parser.parse(
                    match.group(0),
                    dayfirst=True,
                    fuzzy=False,
                )
                return parsed.date()
            except (ValueError, OverflowError):
                continue
        return None

    def detect_education_level(self, text: str) -> str:
        lowered = text.lower()
        matched_levels: list[str] = []
        for level, keywords in self.EDUCATION_LEVEL_RULES:
            if any(keyword in lowered for keyword in keywords):
                matched_levels.append(level)
        return ", ".join(matched_levels)

    def detect_fields(self, text: str) -> str:
        lowered = text.lower()
        matched_fields: list[str] = []
        for field, keywords in self.FIELD_RULES.items():
            if any(keyword in lowered for keyword in keywords):
                matched_fields.append(field)
        # DAAD often explicitly states "all academic disciplines".
        if "all academic disciplines" in lowered:
            return "all fields"
        return ", ".join(matched_fields)

    @staticmethod
    def detect_disability_support(text: str) -> bool:
        lowered = text.lower()
        return any(
            phrase in lowered
            for phrase in [
                "disability",
                "disabled applicants",
                "chronic illness",
                "additional costs incurred",
            ]
        )

    @staticmethod
    def choose_official_link(record: dict) -> str:
        """
        Keep the DAAD detail page as the stable record URL.
        External application links vary by programme and country,
        while the DAAD detail record provides the authoritative
        programme description.
        """
        return record["source_url"]

    def clean(self, record: dict) -> dict:
        page_text = self.clean_text(record.get("page_text", ""))
        eligibility = self.clean_text(record.get("eligibility", ""))
        deadline_text = self.clean_text(
            record.get("deadline_text", "")
        )

        return {
            "title": self.clean_text(record.get("title", ""))[:200],
            "organization": self.clean_text(
                record.get("organization", "DAAD")
            )[:200],
            "description": self.clean_text(
                record.get("description", "")
            ),
            "eligibility": eligibility,
            "minimum_gpa": self.extract_gpa(
                f"{eligibility}\n{page_text}"
            ),
            "eligible_education_level": (
                self.detect_education_level(
                    f"{eligibility}\n{page_text}"
                )[:200]
            ),
            "eligible_field": self.detect_fields(page_text)[:200],
            "province_restriction": "",
            "income_requirement_max": None,
            "gender_requirement": "",
            "disability_requirement": (
                self.detect_disability_support(page_text)
            ),
            "ethnicity_requirement": "",
            "benefits": self.clean_text(
                record.get("benefits", "")
            ),
            "required_documents": self.clean_text(
                record.get("required_documents", "")
            ),
            "deadline": self.extract_deadline(deadline_text),
            "deadline_text": deadline_text,
            "official_link": self.choose_official_link(record),
            "source": self.clean_text(
                record.get("source", "DAAD")
            )[:100],
            "source_identifier": self.clean_text(
                record.get("source_identifier", "")
            )[:100],
            "country": self.clean_text(
                record.get("country", "Germany")
            )[:100],
            "is_active": True,
        }
