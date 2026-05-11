from flask import Flask
from app.models import db
from app.route import setup_routes
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os
from dotenv import load_dotenv
from flask_migrate import Migrate

app = Flask(__name__)

load_dotenv()
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/online_training")

jwt = JWTManager(app)

db.init_app(app)
migrate = Migrate(app, db)
setup_routes(app)
CORS(app)

if __name__ == '__main__':
    app.run(debug=True)