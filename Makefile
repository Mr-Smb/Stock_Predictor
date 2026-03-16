.PHONY: install train serve test clean web-dev web-build

install:
	poetry install --with talib

train:
	poetry run python src/training/train_model.py

serve:
	poetry run uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload

test:
	poetry run pytest tests/

eda:
	poetry run jupyter notebook notebooks/

web-dev:
	cd web && npm run dev

web-build:
	cd web && npm run build

clean:
	rm -rf data/processed/ experiments/ logs/ **/__pycache__ .poetry

lint:
	poetry run black src/ tests/
	poetry run isort src/ tests/

