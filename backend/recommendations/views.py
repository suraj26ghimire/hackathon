from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from scholarships.models import Scholarship
from scholarships.serializers import ScholarshipSerializer

class RecommendationView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        profile = request.user.profile
        scholarships = Scholarship.objects.all()
        
        recommendations = []
        for scholarship in scholarships:
            score = 0
            reasons = []
            missing = []
            
            # Education Match (30%)
            if not scholarship.eligible_education_level or (profile.education_level and profile.education_level.lower() in scholarship.eligible_education_level.lower()):
                score += 30
                reasons.append(f"✓ Eligible education level")
            else:
                missing.append("✗ Education level mismatch")
                
            # Field Match (25%)
            if not scholarship.eligible_field or (profile.field_of_study and profile.field_of_study.lower() in scholarship.eligible_field.lower()):
                score += 25
                reasons.append(f"✓ Eligible field of study")
            else:
                missing.append("✗ Field of study mismatch")
                
            # GPA (20%)
            if scholarship.minimum_gpa is None or (profile.gpa and profile.gpa >= scholarship.minimum_gpa):
                score += 20
                reasons.append(f"✓ GPA requirement met")
            else:
                missing.append(f"✗ GPA too low (requires {scholarship.minimum_gpa})")
                
            # Province (10%)
            if not scholarship.province_restriction or (profile.province and profile.province.lower() in scholarship.province_restriction.lower()):
                score += 10
                reasons.append("✓ Eligible province")
            else:
                missing.append("✗ Province mismatch")
                
            # Income (10%)
            if scholarship.income_requirement_max is None or (profile.family_income and profile.family_income <= scholarship.income_requirement_max):
                score += 10
                reasons.append("✓ Income requirement met")
            else:
                missing.append("✗ Income exceeds requirement")
                
            # Other Conditions (5%)
            condition_score = 5
            
            
            if scholarship.disability_requirement and not profile.disability_status:
                condition_score = 0
                missing.append("✗ Disability requirement not met")
                
            if condition_score == 5:
                score += condition_score
                reasons.append("✓ Additional conditions met")
            
            if scholarship.gender_requirement and profile.gender and scholarship.gender_requirement.lower() != profile.gender.lower():
                score = 0
                missing.append("✗ Gender requirement not met")
                
                
            sch_data = ScholarshipSerializer(scholarship).data
            
            recommendations.append({
                'scholarship': sch_data,
                'match_percentage': score,
                'reasons': reasons,
                'missing': missing
            })
            
        recommendations.sort(key=lambda x: x['match_percentage'], reverse=True)
        return Response(recommendations)
