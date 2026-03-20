FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port
EXPOSE 8000

# Run migrations then start server
CMD ["sh", "-c", "python manage.py migrate && gunicorn tournament_project.wsgi:application --bind 0.0.0.0:8000"]
