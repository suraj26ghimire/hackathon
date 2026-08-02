from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

class ChatbotView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        query = request.data.get('query', '').lower()
        response = "I am a simple scholarship bot. I can help you find scholarships based on your profile!"
        
        if "document" in query or "documents" in query:
            response = "Most scholarships require a Transcript, Citizenship/ID, and an Application Letter."
        elif "gpa" in query:
            response = "Some scholarships require a minimum GPA of 3.0 or 3.2, but many are need-based with no strict GPA."
        elif "close" in query or "deadline" in query:
            response = "You can check the upcoming deadlines in your dashboard or the scholarships page."
        elif "merit" in query:
            response = "A merit scholarship is awarded based on academic, athletic, or artistic achievement."
            
        return Response({"response": response})
