#!/usr/bin/env bash
set -e

# Wait for DB (optional simple loop)
# until python manage.py showmigrations >/dev/null 2>&1; do
#   echo "Waiting for DB..."
#   sleep 1
# done

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
exec gunicorn bluebank.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --log-level info