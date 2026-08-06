# Makefile for TypeScript Web App Deployment
.DEFAULT_GOAL := help

# Variables
APP_NAME := kyoute
DIST_DIR := dist
SRC_DIR := src
BUILD_DIR := build

# Default target
.PHONY: all
all: clean install build

# Install dependencies
.PHONY: install
install:
	@echo "📦 Installing dependencies..."
	npm install

# Build TypeScript
.PHONY: build
build:
	@echo "🔨 Building TypeScript..."
	npm run build

# Development build with watch
.PHONY: dev
dev:
	@echo "👀 Starting development build with watch..."
	npm run watch

# Clean build artifacts
.PHONY: clean
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf $(BUILD_DIR) $(DIST_DIR)
	rm -rf node_modules/.cache

# Lint the code
.PHONY: lint
lint:
	@echo "🔍 Linting TypeScript code..."
	npm run lint

# Format the code
.PHONY: format
format:
	@echo "✨ Formatting code..."
	npm run format

# Run tests
.PHONY: test
test:
	@echo "🧪 Running tests..."
	npm test

# Local development server
.PHONY: serve
serve:
	@echo "🌐 Starting development server..."
	npm start

# Create distribution package
.PHONY: dist
dist: clean install build
	@echo "📦 Creating distribution package..."
	mkdir -p $(DIST_DIR)
	cp -r $(BUILD_DIR)/* $(DIST_DIR)/
	cp public/* $(DIST_DIR)/ 2>/dev/null || true
	cp package.json $(DIST_DIR)/
	cd $(DIST_DIR) && npm install --production

# Deploy to Vercel
.PHONY: deploy-vercel
deploy-vercel: dist
	@echo "🚀 Deploying to Vercel..."
	npx vercel --prod ./$(DIST_DIR)

# Deploy to Netlify
.PHONY: deploy-netlify
deploy-netlify: dist
	@echo "🚀 Deploying to Netlify..."
	netlify deploy --prod --dir=$(DIST_DIR)

# Deploy to GitHub Pages
.PHONY: deploy-ghpages
deploy-ghpages: dist
	@echo "🚀 Deploying to GitHub Pages..."
	npx gh-pages -d $(DIST_DIR)

# Deploy to AWS S3
.PHONY: deploy-s3
deploy-s3: dist
	@echo "🚀 Deploying to AWS S3..."
	aws s3 sync $(DIST_DIR)/ s3://$(S3_BUCKET)/ --delete

# Deploy with Docker
.PHONY: docker-build
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t $(APP_NAME) .

.PHONY: docker-run
docker-run:
	@echo "🐳 Running Docker container..."
	docker run -p 8080:80 $(APP_NAME)

# Quick deployment (choose your platform)
.PHONY: deploy
deploy: dist
	@echo "🚀 Deploying to Vercel (default)..."
	npx vercel --prod ./$(DIST_DIR)

# Help
.PHONY: help
help:
	@echo "Select a target to run:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : \
		| awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") print $$1}' \
		| sort \
		| fzf --header="Select Makefile Target" --preview="make -n {}" \
		| xargs -I {} make {}
