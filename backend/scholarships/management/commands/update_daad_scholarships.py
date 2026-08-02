from django.core.management.base import BaseCommand, CommandError
from scholarships.collectors.daad import (
    DAADCollector,
    DAADCollectorConfig,
)
from scholarships.services.scholarship_cleaner import (
    ScholarshipCleaner,
)
from scholarships.services.scholarship_importer import (
    ScholarshipImporter,
)

class Command(BaseCommand):
    help = "Scrape and import scholarships from the DAAD database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--pages",
            type=int,
            default=3,
            help="Maximum number of DAAD result pages",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=50,
            help="Maximum number of scholarships",
        )
        parser.add_argument(
            "--delay",
            type=float,
            default=1.0,
            help="Delay between requests in seconds",
        )
        parser.add_argument(
            "--all-providers",
            action="store_true",
            help=(
                "Include programmes from other organizations "
                "listed by DAAD"
            ),
        )
        parser.add_argument(
            "--country-id",
            type=str,
            default=None,
            help=(
                "Optional DAAD origin/country identifier. "
                "Leave empty to retrieve general results."
            ),
        )
        parser.add_argument(
            "--status",
            type=str,
            default=None,
            help="Optional DAAD applicant-status identifier",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Collect and clean data without saving it",
        )

    def handle(self, *args, **options):
        config = DAADCollectorConfig(
            country_id=options["country_id"],
            applicant_status=options["status"],
            daad_only=not options["all_providers"],
            max_pages=options["pages"],
            max_scholarships=options["limit"],
            delay_seconds=options["delay"],
        )

        collector = DAADCollector(config)
        cleaner = ScholarshipCleaner()
        importer = ScholarshipImporter()

        self.stdout.write("Discovering DAAD scholarships...")
        try:
            raw_records = collector.collect()
        except Exception as exc:
            raise CommandError(
                f"DAAD collection failed: {exc}"
            ) from exc

        self.stdout.write(
            f"Collected {len(raw_records)} raw records."
        )

        cleaned_records: list[dict] = []
        for raw_record in raw_records:
            try:
                cleaned = cleaner.clean(raw_record)
                if cleaned["title"]:
                    cleaned_records.append(cleaned)
            except Exception as exc:
                self.stderr.write(
                    self.style.WARNING(
                        "Could not clean "
                        f"{raw_record.get('source_url')}: {exc}"
                    )
                )

        self.stdout.write(
            f"Cleaned {len(cleaned_records)} records."
        )

        if options["dry_run"]:
            self.stdout.write(
                self.style.SUCCESS(
                    "Dry run completed; database unchanged."
                )
            )
            for record in cleaned_records[:5]:
                self.stdout.write(
                    "\n"
                    f"Title: {record['title']}\n"
                    f"Level: "
                    f"{record['eligible_education_level']}\n"
                    f"Deadline: "
                    f"{record['deadline'] or record['deadline_text']}\n"
                    f"URL: {record['official_link']}\n"
                )
            return

        statistics = importer.import_records(cleaned_records)

        self.stdout.write(
            self.style.SUCCESS(
                "\nDAAD import completed\n"
                f"Created: {statistics.created}\n"
                f"Updated: {statistics.updated}\n"
                f"Skipped: {statistics.skipped}\n"
                f"Failed: {statistics.failed}"
            )
        )
