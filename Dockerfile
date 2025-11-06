# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend image
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# System deps needed for psycopg2/mysqlclient
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install python deps
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --upgrade pip
RUN pip install -r backend/requirements.txt

# Copy backend source
COPY backend/ ./backend

# Copy frontend build into backend static sources so collectstatic picks it up
# We will place build into backend/static_frontend
COPY --from=frontend-build /app/frontend/build ./backend/static_frontend

# Make entrypoint available
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT 8000
EXPOSE 8000

CMD ["/entrypoint.sh"]