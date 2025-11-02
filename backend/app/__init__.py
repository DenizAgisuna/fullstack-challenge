from datetime import timedelta
import logging
from logging.config import dictConfig
from flask import Flask

from .config import get_config
from .extensions import db, migrate, jwt, cors
from .routes import api_bp


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__, instance_relative_config=True)

    dictConfig({
        'version': 1,
        'formatters': {
            'default': {
                'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
            }
        },
        'handlers': {
            'wsgi': {
                'class': 'logging.StreamHandler',
                'stream': 'ext://sys.stdout',
                'formatter': 'default'
            }
        },
        'root': {
            'level': 'INFO',
            'handlers': ['wsgi']
        },
        'loggers': {
            'flask.app': {
                'level': 'INFO',
                'handlers': ['wsgi'],
                'propagate': False
            },
            'app.auth_routes': {
                'level': 'INFO',
                'handlers': ['wsgi'],
                'propagate': False
            },
            'app.participant_routes': {
                'level': 'INFO',
                'handlers': ['wsgi'],
                'propagate': False
            }
        }
    })
    

    config = get_config()
    app.config.from_object(config)
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=config.JWT_ACCESS_TOKEN_EXPIRES)

    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    with app.app_context():
        from . import models  # noqa: F401

    app.register_blueprint(api_bp, url_prefix='/api')

    @app.shell_context_processor
    def _shell_context():
        from . import models

        return {'db': db, 'User': models.User, 'Participant': models.Participant}

    return app

