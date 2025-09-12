#!/usr/bin/env sh




set -e

EXISTS=$(python manage.py shell -c "from django.contrib.auth import get_user_model; print(get_user_model().objects.filter(email='$DJANGO_SUPERUSER_EMAIL').exists())")

if [ "$EXISTS" = "True" ]; then
    echo "Superuser already exists"
else
    echo "Creating superuser..."
    python manage.py createsuperuser --noinput \
        --username "$DJANGO_SUPERUSER_USERNAME" \
        --email "$DJANGO_SUPERUSER_EMAIL" || true

    python manage.py shell -c "from django.contrib.auth import get_user_model; u=get_user_model().objects.get(email='$DJANGO_SUPERUSER_EMAIL'); u.set_password('$DJANGO_SUPERUSER_PASSWORD'); u.save()"
fi
