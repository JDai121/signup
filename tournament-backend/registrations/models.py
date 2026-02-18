from django.db import models

class TournamentRegistration(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    BELT_CHOICES = [
        ('white', 'White Belt'),
        ('yellow', 'Yellow Belt'),
        ('green', 'Green Belt'),
        ('blue', 'Blue Belt'),
        ('red', 'Red Belt'),
        ('black', 'Black Belt'),
        ('black-dan2', 'Black Belt (2nd Dan)'),
        ('black-dan3', 'Black Belt (3rd Dan)'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
    ]
    
    # Personal Info
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    
    # Address
    street = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)
    
    # Martial Arts Info
    belt_rank = models.CharField(max_length=20, choices=BELT_CHOICES)
    weight = models.IntegerField()
    school_name = models.CharField(max_length=200)
    
    # Events
    poomsae = models.BooleanField(default=False)
    board_breaking = models.BooleanField(default=False)
    sparring = models.BooleanField(default=False)
    
    # Waiver
    agreed_to_waiver = models.BooleanField(default=False)
    
    # Payment Fields (NEW)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def calculate_total_amount(self):
        """Calculate total based on selected events"""
        event_count = sum([self.poomsae, self.board_breaking, self.sparring])
        
        if event_count == 0:
            return 0
        elif event_count <= 2:
            return 100  # Base price for 1-2 events
        else:
            return 125  # $100 + $25 for 3rd event
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.email}"