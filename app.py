"""Aplikasi Flask manajemen stok darah."""
from flask import Flask

from darah.api import api_bp
from darah.db import init_db
from darah.layanan import lay_bp
from darah.pages import pages_bp


def create_app() -> Flask:
    app = Flask(__name__)
    init_db()
    app.register_blueprint(api_bp)
    app.register_blueprint(lay_bp)
    app.register_blueprint(pages_bp)
    return app


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=5007, debug=False)
