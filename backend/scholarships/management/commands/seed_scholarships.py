# import datetime
# from django.core.management.base import BaseCommand
# from scholarships.models import Scholarship

# class Command(BaseCommand):
#     help = 'Seed 30 sample scholarships into the database'

#     def handle(self, *args, **options):
#         Scholarship.objects.all().delete()
        
#         scholarships_data = [
#             {
#                 "title": f"Scholarship for BCA {i}",
#                 "organization": f"Tribhuvan University{i}",
#                 "description": f"A prestigious scholarship for outstanding BCA students {i}.",
#                 "eligibility": "Must be enrolled in BCA program.",
#                 "minimum_gpa": 3.5,
#                 "eligible_education_level": "bachelors",
#                 "eligible_field": "bca",
#                 "province_restriction": "Bagmati",
#                 "income_requirement_max": None,
#                 "gender_requirement": "",
#                 "disability_requirement": False,
#                 "benefits": "Full Scholarship",
#                 "required_documents": "Transcript, Citizenship, Recommendation Letter",
#                 "deadline": datetime.date.today() + datetime.timedelta(days=30),
#                 "official_link": "https://example.com"
#             } for i in range(1, 11)
#         ] + [
#             {
#                 "title": f"Women in STEM Grant {i}",
#                 "organization": f"Women Tech Nepal {i}",
#                 "description": f"Empowering women in STEM fields {i}.",
#                 "eligibility": "Female students in IT or Engineering.",
#                 "minimum_gpa": 3.0,
#                 "eligible_education_level": "bachelors",
#                 "eligible_field": "engineering",
#                 "province_restriction": "",
#                 "income_requirement_max": 500000.0,
#                 "gender_requirement": "female",
#                 "disability_requirement": False,
#                 "benefits": "NPR 50,000 per year",
#                 "required_documents": "Transcript, Citizenship",
#                 "deadline": datetime.date.today() + datetime.timedelta(days=15),
#                 "official_link": "https://example.com"
#             } for i in range(1, 11)
#         ] + [
#             {
#                 "title": f"Need-Based Rural Scholarship {i}",
#                 "organization": f"Nepal Education Trust {i}",
#                 "description": f"Supporting students from rural areas {i}.",
#                 "eligibility": "Students from rural districts with financial need.",
#                 "minimum_gpa": None,
#                 "eligible_education_level": "plus two",
#                 "eligible_field": "any",
#                 "province_restriction": "Karnali",
#                 "income_requirement_max": 200000.0,
#                 "gender_requirement": "",
#                 "disability_requirement": False,
#                 "benefits": "NPR 25,000 + Hostel",
#                 "required_documents": "Income Certificate, Citizenship",
#                 "deadline": datetime.date.today() + datetime.timedelta(days=45),
#                 "official_link": "https://example.com"
#             } for i in range(1, 11)
#         ]
        
#         for data in scholarships_data:
#             Scholarship.objects.create(**data)
            
#         self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(scholarships_data)} scholarships'))
