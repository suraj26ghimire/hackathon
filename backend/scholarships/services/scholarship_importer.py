from __future__ import annotations
from dataclasses import dataclass
from django.db import transaction
from django.utils import timezone
from scholarships.models import Scholarship

@dataclass
class ImportStatistics:
    created: int = 0
    updated: int = 0
    skipped: int = 0
    failed: int = 0

class ScholarshipImporter:
    REQUIRED_FIELDS = [
        "title",
        "organization",
        "official_link",
        "source_identifier",
    ]

    def validate(self, record: dict) -> tuple[bool, list[str]]:
        errors: list[str] = []
        for field in self.REQUIRED_FIELDS:
            if not record.get(field):
                errors.append(f"Missing required field: {field}")
        return not errors, errors

    @transaction.atomic
    def import_records(
        self, records: list[dict],
    ) -> ImportStatistics:
        statistics = ImportStatistics()
        checked_at = timezone.now()

        for record in records:
            valid, errors = self.validate(record)
            if not valid:
                statistics.skipped += 1
                continue

            try:
                lookup = {
                    "source": record["source"],
                    "source_identifier": record[
                        "source_identifier"
                    ],
                }
                defaults = {
                    **record,
                    "last_checked_at": checked_at,
                }
                scholarship, created = (
                    Scholarship.objects.update_or_create(
                        **lookup,
                        defaults=defaults,
                    )
                )
                if created:
                    statistics.created += 1
                else:
                    statistics.updated += 1
            except Exception:
                statistics.failed += 1

        return statistics
