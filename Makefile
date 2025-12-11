.PHONY: help install dev build start clean docker-up docker-down docker-logs db-migrate db-seed db-studio

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pnpm install

dev: ## Start development servers
	pnpm dev

build: ## Build all packages
	pnpm build

start: ## Start production servers
	pnpm start

clean: ## Clean build artifacts and dependencies
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf services/*/node_modules
	rm -rf apps/*/.next
	rm -rf packages/*/dist
	rm -rf services/*/dist

docker-up: ## Start Docker services
	docker compose up -d

docker-down: ## Stop Docker services
	docker compose down

docker-logs: ## View Docker logs
	docker compose logs -f

db-migrate: ## Run database migrations
	cd apps/web && pnpm prisma migrate dev

db-seed: ## Seed database with demo data
	cd apps/web && pnpm prisma db seed

db-studio: ## Open Prisma Studio
	cd apps/web && pnpm prisma studio

setup: install docker-up db-migrate db-seed ## Complete setup (install, docker, migrate, seed)
	@echo "✅ Setup complete! Run 'make dev' to start development."
