from rest_framework import serializers
from .models import Scholarship, Bookmark

class ScholarshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scholarship
        fields = '__all__'

class BookmarkSerializer(serializers.ModelSerializer):
    scholarship_details = ScholarshipSerializer(source='scholarship', read_only=True)

    class Meta:
        model = Bookmark
        fields = ('id', 'scholarship', 'created_at', 'scholarship_details')
        read_only_fields = ('user',)
