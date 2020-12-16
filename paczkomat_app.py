from flask import Flask, render_template, url_for, redirect, send_file, make_response, abort, session
from flask import request, jsonify
from flask import logging
from datetime import timedelta
from uuid import uuid4
from const import *
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, create_refresh_token, set_refresh_cookies, set_access_cookies, create_refresh_token, unset_jwt_cookies, jwt_refresh_token_required, get_jwt_identity
import redis
import os
import hashlib
from flask_cors import CORS, cross_origin

app = Flask(__name__, static_url_path="")
log = logging.create_logger(app)
db = redis.Redis(host="redis-db", port=6379, decode_responses=True)
cors = CORS(app)

app.config["JWT_COOKIE_CSRF_PROTECT"] = False
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = SECRET_KEY
app.config["JWT_SECRET_KEY"] = os.environ.get(SECRET_KEY)
app.config["JWT_SESSION_COOKIE"] = False
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = TOKEN_EXPIRES_IN_SECONDS
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = TOKEN_EXPIRES_IN_SECONDS * 4
app.config["JWT_TOKEN_LOCATION"] = JWT_TOKEN_LOCATION
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=5)
app.config["SESSION_REFRESH_EACH_REQUEST"] = True
app.config['CORS_SUPPORTS_CREDENTIALS'] = True


jwt = JWTManager(app)

@app.before_first_request
def paczkomaty():
    paczkomaty = ['WAW006', 'OLN01A', 'KRA003', 'OLS06A']
    for paczkomat in paczkomaty:
        db.hset('paczkomaty', paczkomat, paczkomat)

@app.route("/", methods=[GET])
def index():
    return render_template("paczkomat/index.html")

@app.route("/paczkomat", methods=[POST])
def paczkomat():
    paczkomat_id = request.form.get(PACZKOMAT_FIELD_ID)
    log.debug(f'id paczkomatu {paczkomat_id}')
    session.permanent = True
    session['paczkomat'] = paczkomat_id
    if db.hexists('paczkomaty', paczkomat_id):
        log.debug('paczkomat istnieje w bazie')
        return render_template("paczkomat/paczkomat.html", paczkomat=paczkomat_id)
    else:
        return {'message': 'Nie ma takiego paczkomatu'}, 404

@app.route("/send", methods=[GET])
def send():
    try:
        paczkomat = session['paczkomat']
    except:
        return render_template("paczkomat/index.html")
    return render_template("paczkomat/send.html", paczkomat=paczkomat)
    
@app.route("/check_pack_id", methods=[POST])
def check_pack_id():
    pack_id = request.form.get(PACK_ID_FIELD_ID)
    log.debug(pack_id)
    if db.hexists(pack_id, 'status'):
        log.debug('ok')
        return {'message': 'Paczka znajduje się w bazie danych.'}, 200
    else:
        return {'message': 'Brak paczki o podanym id w bazie danych.'}, 404

@app.route("/put_in", methods=[POST])
def put_in():
    pack_id = request.form.get(PACK_ID_FIELD_ID)
    log.debug(pack_id)
    try:
        paczkomat = session['paczkomat']
    except:
        return render_template("paczkomat/index.html")
    try:
        if db.hget(pack_id, 'status') == NEW:
            db.hset(pack_id, 'status', WAITING)
            db.hset(paczkomat, pack_id, pack_id)
            return {'message': 'Udało się włożyć paczkę.'}, 200
        else:
            return {'message': 'Nieprawidłowy status paczki.'}, 400
    except:
        return {'message': 'Nie udało się włożyć paczki.'}, 404

@cross_origin(origins=["https://localhost:8082/"], supports_credentials=True)
@app.route("/confirm_token", methods=[POST])
@jwt_required
def confirm_token():
    token = get_jwt_identity()

@app.route("/take_out", methods=[GET])
def take_out():
    try:
        paczkomat = session['paczkomat']
    except:
        return render_template("paczkomat/index.html")
    return render_template("paczkomat/take_out.html", paczkomat=paczkomat)


@app.errorhandler(400)
def bad_request(error):
    return render_template("errors/400.html", error=error, loggedin=False)

@app.errorhandler(401)
def page_unauthorized(error):
    return render_template("errors/401.html", error=error, loggedin=False)

@app.errorhandler(403)
def forbidden(error):
    return render_template("errors/403.html", error=error, loggedin=False)

@app.errorhandler(404)
def page_not_found(error):
    return render_template("errors/404.html", error=error, loggedin=False)
    
@app.errorhandler(500)
def internal_server_error(error):
    return render_template("errors/500.html", error=error, loggedin=False)

