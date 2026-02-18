from django.contrib import admin
from .models import TournamentRegistration

@admin.register(TournamentRegistration)
class TournamentRegistrationAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'belt_rank', 'weight', 'created_at']
    list_filter = ['belt_rank', 'gender', 'poomsae', 'sparring', 'board_breaking']
    search_fields = ['first_name', 'last_name', 'email', 'school_name']
    date_hierarchy = 'created_at'