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

# ── Help ──────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "  make build   Compile TypeScript + next build"
	@echo "  make test    Run Jest tests (spins up MySQL automatically)"
	@echo "  make schema  Apply sql/schema.sql to the validate MySQL"
	@echo "  make dev     Start dev server with hot reload"
	@echo "  make run     Build + start production container"
	@echo "  make logs    Tail production logs"
	@echo "  make stop    Stop production containers"
	@echo "  make clean   Remove all containers + volumes"
	@echo ""
