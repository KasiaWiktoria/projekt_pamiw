from flask import Flask, render_template, url_for, redirect, send_file, make_response, abort
from flask import request, jsonify
from flask import logging
from const import *
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
import redis
import os
import hashlib

app = Flask(__name__, static_url_path="")
log = logging.create_logger(app)
db = redis.Redis(host="redis-db", port=6379, decode_responses=True)

app.config["JWT_SECRET_KEY"] = os.environ.get(SECRET_KEY)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = TOKEN_EXPIRES_IN_SECONDS

jwt = JWTManager(app)

GET = "GET"
POST = "POST"

'''
@app.before_first_request
def setup():
    log.setLevel(logging.DEBUG)
'''
@app.route("/", methods=[GET])
def index():
    return render_template("index.html")

@app.route("/login/waybills-list", methods=[GET])
def list(name):
    waybills = db.hvals(FILENAMES)
    return render_template('waybills-list.html', my_waybills = waybills)

@app.route("/<string:name>/", methods=[GET])
def set(name):
    return render_template(name + '.html')

@app.route("/login", methods=[POST])
def login():
    username = request.form["username"]
    access_token = create_access_token(identity=username)
    return {"access_token": access_token}

@app.errorhandler(400)
def bad_request(error):
    return render_template("errors/400.html", error=error)


@app.errorhandler(401)
def page_unauthorized(error):
    return render_template("errors/401.html", error=error)

@app.errorhandler(403)
def forbidden(error):
    return render_template("errors/403.html", error=error)

@app.errorhandler(404)
def page_not_found(error):
    return render_template("errors/404.html", error=error)
    
@app.errorhandler(500)
def internal_server_error(error):
    return render_template("errors/500.html", error=error)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
