from rest_framework import serializers
from .models import TournamentRegistration

class TournamentRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentRegistration
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        # Ensure at least one event is selected
        if not (data.get('poomsae') or data.get('board_breaking') or data.get('sparring')):
            raise serializers.ValidationError("At least one event must be selected")
        
        # Ensure waiver is agreed
        if not data.get('agreed_to_waiver'):
            raise serializers.ValidationError("You must agree to the waiver")
        
        return data