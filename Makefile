export DOCKER_API_VERSION=1.41

.PHONY: build test dev run stop clean schema logs help

# ── Validation ────────────────────────────────────────────────────────────────

## Compile TypeScript + next build
build:
	docker compose -f docker-compose.validate.yml run --rm build

## Run Jest tests against a temporary MySQL container
test:
	docker compose -f docker-compose.validate.yml run --rm test

## Apply schema SQL to the validate MySQL container
schema:
	docker compose -f docker-compose.validate.yml up -d mysql
	docker compose -f docker-compose.validate.yml run --rm schema

# ── Development ───────────────────────────────────────────────────────────────

## Start dev server with hot reload (MySQL + Next.js dev mode)
dev:
	docker compose -f docker-compose.validate.yml up mysql dev

# ── Production ────────────────────────────────────────────────────────────────

## Build and start the production container
run:
	docker compose up -d --build
	@URL=$$(grep NEXTAUTH_URL .env | cut -d= -f2) && \
	echo "" && \
	echo "  ✅ Foodlist lancé : $$URL" && \
	echo "  👤 Créer le compte admin : $$URL/register" && \
	echo ""

## Tail production logs
logs:
	docker compose logs -f

## Stop production containers
stop:
	docker compose down

# ── Cleanup ───────────────────────────────────────────────────────────────────

## Stop and remove all containers + volumes (validate + production)
clean:
	docker compose -f docker-compose.validate.yml down -v
	docker compose down -v

# ── Docker Hub ────────────────────────────────────────────────────────────────

DOCKER_IMAGE ?= talset/foodlist
DOCKER_TAG   ?= latest

## Build and push Docker image to Docker Hub
docker-push:
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)
	@echo ""
	@echo "  ✅ Pushed $(DOCKER_IMAGE):$(DOCKER_TAG)"
	@echo ""

## Build and push multi-arch Docker image (amd64 + arm64)
docker-push-multi:
	docker buildx create --use --name foodlist-builder 2>/dev/null || true
	docker buildx build --platform linux/amd64,linux/arm64 \
		-t $(DOCKER_IMAGE):$(DOCKER_TAG) \
		--push .
	@echo ""
	@echo "  ✅ Pushed $(DOCKER_IMAGE):$(DOCKER_TAG) (amd64 + arm64)"
	@echo ""

# ── Help ──────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "  make build             Compile TypeScript + next build"
	@echo "  make test              Run Jest tests (spins up MySQL automatically)"
	@echo "  make schema            Apply sql/schema.sql to the validate MySQL"
	@echo "  make dev               Start dev server with hot reload"
	@echo "  make run               Build + start production container"
	@echo "  make logs              Tail production logs"
	@echo "  make stop              Stop production containers"
	@echo "  make clean             Remove all containers + volumes"
	@echo "  make docker-push       Build + push Docker image"
	@echo "  make docker-push-multi Build + push multi-arch image (amd64+arm64)"
	@echo ""
	@echo "  Override image: make docker-push DOCKER_IMAGE=myrepo/foodlist DOCKER_TAG=1.0.0"
	@echo ""
