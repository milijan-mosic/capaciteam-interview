FROM python:3.11-alpine

ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apk add --no-cache \
    gcc \
    musl-dev \
    python3-dev \
    libffi-dev \
    libjpeg-turbo-dev \
    zlib-dev \
    make

WORKDIR /app

COPY requirements ./requirements
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements/dev.txt

EXPOSE 8001
CMD ["make", "serve"]
