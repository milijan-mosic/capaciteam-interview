FROM python:3.11-alpine AS builder

ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apk add --no-cache make cmake
WORKDIR /
RUN pip install virtualenv

COPY . .
RUN make build

# ---------------------------------------------------------------- #

FROM python:3.11-alpine

WORKDIR /
COPY --from=builder . .
RUN make makemigrations
RUN make migrate
# RUN make fixtures

EXPOSE 8001
CMD ["make", "serve"]
