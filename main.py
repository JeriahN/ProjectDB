import os
from ffmpeg import FFmpeg
from flask import Flask, request, session, jsonify, send_file
from werkzeug.utils import secure_filename
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from flask_session import Session
from flask_cors import CORS
from itsdangerous import URLSafeTimedSerializer, BadSignature
from pymongo import MongoClient
from werkzeug.security import check_password_hash, generate_password_hash
from dotenv import load_dotenv
from jose import jwt
from pathlib import Path
from flask import send_from_directory
from gridfs import GridFS


database_dir = "data/"

load_dotenv()

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3030",
    "http://localhost:5000",
    "http://localhost:5001",
]

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=CORS_ORIGINS)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.secret_key = os.getenv("SECRET_KEY")
app.config["CORS_HEADERS"] = "Content-Type"
app.config["DEBUG"] = True
app.config["UPLOAD_FOLDER"] = "data/Uploads/"
flask_port = 5001
Session(app)

app.logger.debug("Flask Configuration Set Up!")

serializer = URLSafeTimedSerializer(app.secret_key)

app.logger.debug("itsdangerous Configuration Set Up!")

client = MongoClient(os.getenv("DB_HOST"), int(os.getenv("DB_PORT")))
db = client[os.getenv("DB_NAME")]
user_collection = db["userauth"]
fs = GridFS(db)

app.logger.debug("Database Configuration Set Up")


app.logger.info("Server started!")


def verify_token(request):
    token = request.headers.get("Authorization")

    if not token:
        return jsonify({"message": "Token missing"}), 401

    try:
        serializer.loads(token)
    except BadSignature:
        return jsonify({"message": "Invalid Token"}), 401

    return None


def verify_json_token(request):
    token = request.json.get("token")

    if not token:
        return jsonify({"message": "Token missing"}), 401

    try:
        serializer.loads(token)
    except BadSignature:
        return jsonify({"message": "Invalid Token"}), 401

    return None


def authenticate_user(username, password):
    user = user_collection.find_one({"username": username})
    if user and check_password_hash(user["password_hash"], password):
        return True
    return False


@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username")
    password = request.json.get("password")

    app.logger.info(f"User {username} attempted to log in")

    if authenticate_user(username, password):
        session_data = {"username": username, "logged_in": True}
        token = jwt.encode(session_data, app.config["SECRET_KEY"], algorithm="HS256")
        app.logger.info(f"User {username} logged in successfully")
        return jsonify({"message": "Login successful", "token": token})
    else:
        session["logged_in"] = False
        app.logger.error(f"User {username} failed to log in")
        return jsonify({"message": "Invalid credentials"}), 401


@app.route("/register", methods=["POST"])
def register():
    username = request.json.get("username")
    password = request.json.get("password")

    app.logger.info(f"User {username} attempted to register")

    if user_collection.find_one({"username": username}):
        app.logger.error(f"User {username} already exists")
        return jsonify({"message": "User already exists"}), 409

    user_collection.insert_one(
        {"username": username, "password_hash": generate_password_hash(password)}
    )

    app.logger.info(f"User {username} registered successfully")
    return jsonify({"message": "User registered successfully"}), 201


def list_directory(path):
    directory = {"name": path.name, "type": "folder", "children": []}
    for item in path.iterdir():
        if item.is_file():
            file_extension = item.suffix.lstrip(".")
            directory["children"].append(
                {"name": item.name, "type": "file", "file_type": file_extension}
            )
        elif item.is_dir():
            directory["children"].append(list_directory(item))
    return directory


@app.route("/directory", methods=["POST"])
def list_user_directory():
    token = request.json.get("token")
    app.logger.info(f"User requested directory listing")
    app.logger.debug(f"Token: {token}")
    app.logger.debug(f"Request JSON: {request.json}")

    username = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])[
        "username"
    ]

    password = request.json.get("password")

    app.logger.info(f"User {username} requested directory listing")

    if not authenticate_user(username, password):
        app.logger.error(f"User {username} failed to authenticate")
        return jsonify({"message": "Invalid credentials"}), 401

    user_dir = Path(database_dir) / username
    app.logger.debug(f"User directory: {user_dir}")

    if not user_dir.exists():
        user_dir.mkdir(parents=True)
        app.logger.info(f"User {username} directory created")

    directory = list_directory(user_dir)

    app.logger.info(f"User {username} directory listing successful")
    return jsonify(directory), 200


@app.route("/download/<path:file_path>", methods=["POST"])
def download_file(file_path):
    token = request.json.get("token")
    app.logger.info(f"User requested file download")
    app.logger.debug(f"Token: {token}")
    app.logger.debug(f"Request JSON: {request.json}")
    username = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])[
        "username"
    ]
    password = request.json.get("password")
    app.logger.info(f"User {username} requested file download")
    if not authenticate_user(username, password):
        app.logger.error(f"User {username} failed to authenticate")
        return jsonify({"message": "Invalid credentials"}), 401
    user_dir = Path(database_dir) / username
    app.logger.debug(f"User directory: {user_dir}")
    if not user_dir.exists():
        app.logger.error(f"User {username} directory does not exist")
        return jsonify({"message": "User directory does not exist"}), 404
    return send_from_directory(user_dir, file_path, as_attachment=True)


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        app.logger.error("No file part in the request")
        return (
            jsonify(
                {
                    "message": "No file part in the request",
                    "status": "error",
                    "form": request.form.to_dict(),
                }
            ),
            400,
        )

    file = request.files["file"]

    token = request.form.get("token")
    app.logger.info(f"User requested file upload")
    app.logger.debug(f"Token: {token}")
    app.logger.debug(f"Request JSON: {request.form.to_dict()}")
    username = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])[
        "username"
    ]

    password = request.form.get("password")
    app.logger.info(f"User {username} requested file upload")
    if not authenticate_user(username, password):
        app.logger.error(f"User {username} failed to authenticate")
        return jsonify({"message": "Invalid credentials"}), 401

    path = request.form.get("path").lstrip("/")
    if not path:
        path = "/"
    app.logger.debug(f"Path: {path}")

    filename = secure_filename(file.filename)
    app.logger.debug(f"Filename: {filename}")

    user_dir = Path(database_dir) / username
    app.logger.debug(f"User directory: {user_dir}")

    if not user_dir.exists():
        user_dir.mkdir(parents=True)
        app.logger.info(f"User {username} directory created")

    file_path = f"{user_dir}/{path}"
    file_path = file_path.rstrip("/")

    app.logger.debug(f"File Path: {file_path}")

    if not Path(file_path).exists():
        Path(file_path).mkdir(parents=True)
        app.logger.info(f"Path {file_path} created")

    file.save(f"{file_path}/{filename}")
    app.logger.info(f"File {filename} uploaded successfully")

    return jsonify({"message": "File uploaded successfully"}), 200


@app.route("/delete", methods=["POST"])
def delete_file():
    token = request.json.get("token")
    app.logger.info(f"User requested file deletion")
    app.logger.debug(f"Token: {token}")
    app.logger.debug(f"Request JSON: {request.json}")
    username = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])[
        "username"
    ]
    password = request.json.get("password")
    app.logger.info(f"User {username} requested file deletion")
    if not authenticate_user(username, password):
        app.logger.error(f"User {username} failed to authenticate")
        return jsonify({"message": "Invalid credentials"}), 401
    user_dir = Path(database_dir) / username
    app.logger.debug(f"User directory: {user_dir}")
    if not user_dir.exists():
        app.logger.error(f"User {username} directory does not exist")
        return jsonify({"message": "User directory does not exist"}), 404
    file_path = request.json.get("file_path")
    app.logger.debug(f"File Path: {file_path}")
    file = Path(user_dir) / file_path
    if not file.exists():
        app.logger.error(f"File {file_path} does not exist")
        return jsonify({"message": "File does not exist"}), 404
    file.unlink()
    app.logger.info(f"File {file_path} deleted successfully")
    return jsonify({"message": "File deleted successfully"}), 200


class FileChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        app.logger.info(f"File {event.src_path} has been modified")

    def on_created(self, event):
        app.logger.info(f"File {event.src_path} has been created")

    def on_deleted(self, event):
        app.logger.info(f"File {event.src_path} has been deleted")


def start_server():
    app.run(host="0.0.0.0", port=5001)


if __name__ == "__main__":
    event_handler = FileChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, path="data/", recursive=True)
    observer.start()

    try:
        start_server()
    except KeyboardInterrupt:
        observer.stop()
        observer.join()
