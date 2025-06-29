from app import create_app
import logging

app = create_app()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    app.logger.info("Starting development server...")
    app.run(host='0.0.0.0', port=5000)