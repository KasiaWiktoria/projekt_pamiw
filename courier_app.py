from flask import Flask, render_template, url_for, redirect, send_file, make_response, abort, session
from flask import request, jsonify
from flask import logging
from datetime import timedelta
from uuid import uuid4
from const import *
from flask_jwt_extended import JWTManager, get_jti, jwt_required, create_access_token, create_refresh_token, set_refresh_cookies, set_access_cookies, create_refresh_token, unset_jwt_cookies, jwt_refresh_token_required, get_jwt_identity
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
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = PACZKOMAT_TOKEN_EXPIRES_IN_SECONDS
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = TOKEN_EXPIRES_IN_SECONDS * 4
app.config["JWT_TOKEN_LOCATION"] = JWT_TOKEN_LOCATION
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=5)
app.config["SESSION_REFRESH_EACH_REQUEST"] = True
app.config['CORS_SUPPORTS_CREDENTIALS'] = True


jwt = JWTManager(app)

@app.route("/", methods=[GET])
def index():
    return render_template("courier/index.html", loggedin=active_session())

@app.before_request
def refresh_session():
    session.modified = True
    '''
    if active_session():
        refresh()
    '''

@app.route("/logged_in_user")
def get_courier_name():
    try:
        user = session['courier_name']
        return { 'user': user }, 200
    except:
        return {'message': 'Prawdopodobnie nie jesteś zalogowany'}, 401



@app.route("/user/<string:courier_name>", methods=[GET,POST])
def check_user(courier_name):
    
    if db.hexists("kurier-" + courier_name, LOGIN_FIELD_ID):
        return {"message":"Courier is in the database.", "status" : 200}, 200
    else:
        return {"message": "There is no courier with this courier_name.", "status" : 404}, 404


@app.route("/registration", methods=[GET,POST])
def register():
    log.debug('cosss')
    if request.method == POST:
        login = request.form[LOGIN_FIELD_ID]
        password = request.form[PASSWD_FIELD_ID]
        name = request.form[NAME_FIELD_ID]
        surname = request.form[SURNAME_FIELD_ID]
        bdate = request.form[BDATE_FIELD_ID]
        pesel = request.form[PESEL_FIELD_ID]
        country = request.form[COUNTRY_FIELD_ID]
        postal_code = request.form[POSTAL_CODE_FIELD_ID]
        city = request.form[CITY_FIELD_ID]
        street = request.form[STREET_FIELD_ID]
        house_nr = request.form[HOUSE_NR_FIELD_ID] 

        registration_status = add_user(login, password, name, surname, bdate, pesel, country, postal_code, city, street, house_nr)

        return { "registration_status": registration_status }, 200
    else:
        return render_template("courier/registration.html", loggedin=active_session()) 

def add_user(login, password, name, surname, bdate, pesel, country, postal_code, city, street, house_nr):
    log.debug("Login: " + login + ", name: " + name + ", city: " + city)
    try:
        password = password.encode("utf-8")
        hashed_password = hashlib.sha512(password).hexdigest()
        db.hset("kurier-" + login, LOGIN_FIELD_ID, login.encode("utf-8"))
        db.hset("kurier-" + login, PASSWD_FIELD_ID, hashed_password)
        db.hset("kurier-" + login, NAME_FIELD_ID, name.encode("utf-8"))
        db.hset("kurier-" + login, SURNAME_FIELD_ID, surname.encode("utf-8"))
        db.hset("kurier-" + login, BDATE_FIELD_ID, bdate.encode("utf-8"))
        db.hset("kurier-" + login, PESEL_FIELD_ID, pesel.encode("utf-8"))
        db.hset("kurier-" + login, COUNTRY_FIELD_ID, country.encode("utf-8"))
        db.hset("kurier-" + login, POSTAL_CODE_FIELD_ID, postal_code.encode("utf-8"))
        db.hset("kurier-" + login, CITY_FIELD_ID, city.encode("utf-8"))
        db.hset("kurier-" + login, STREET_FIELD_ID, street.encode("utf-8"))
        db.hset("kurier-" + login, HOUSE_NR_FIELD_ID, house_nr.encode("utf-8"))
        log.debug("kurier-" + login)

        return "OK"
    except Exception:
        return "Rejected!"

@app.route("/login", methods=[GET, POST])
def login():
    if request.method == POST:
        courier_name = request.form[LOGIN_FIELD_ID]
        password = request.form[PASSWD_FIELD_ID]

        if db.hexists("kurier-" + courier_name, LOGIN_FIELD_ID):
            log.debug("Użytkownik " + courier_name + " jest w bazie danych.")
            if check_passwd(courier_name,password):
                log.debug("Hasło jest poprawne.")
                hash_ = uuid4().hex 
                db.hset("kurier-" + courier_name, COURIER_SESSION_ID, hash_)
                session.permanent = True
                session['courier_name'] = courier_name
                
                log.debug(f'hash: {hash_}')
                response = make_response(jsonify({ 'logged_in': 'OK'}))
                response.set_cookie(COURIER_SESSION_ID, hash_,  max_age=300, secure=True, httponly=True)

                return response
            else:
                response = make_response("Błędny login lub hasło", 400)
                return response
        else:
            response = make_response("Błędny login lub hasło", 400)
            return response
        
    else:
        if active_session():
            return render_template("errors/already-logged-in.html", loggedin=active_session(), user= session['courier_name'])
        return render_template("courier/login.html", loggedin=active_session())

def check_passwd(courier_name, password):
    password = password.encode("utf-8")
    passwd_hash = hashlib.sha512(password).hexdigest()
    return passwd_hash == db.hget("kurier-" + courier_name, PASSWD_FIELD_ID)

@app.route("/logout", methods=[GET, POST])
def logout():
    if active_session():
        hash_ = request.cookies.get(COURIER_SESSION_ID)
        session.pop('courier_name', None)
        session.clear()
        response = make_response(render_template("courier/index.html", loggedin=False))
        response.set_cookie(COURIER_SESSION_ID, hash_, max_age=0, secure=True, httponly=True)
        unset_jwt_cookies(response)
        return response
    else:
        return render_template("courier/index.html", loggedin=active_session())

@app.route("/waybills-list", methods=[GET])
def list():
    if active_session():
        user = session['courier_name']
        waybills = db.hvals(user + '-' + PACKNAMES)
        waybills_images = []
        for waybill in waybills:
            waybills_images.append(db.hget(IMAGES_PATHS, waybill))
        return render_template('courier/waybills-list.html', my_waybills = zip(waybills,waybills_images), loggedin=active_session(), user=user)
    else:
        abort(401)

@app.route("/pick_up", methods=[GET])
def pick_up():
    if active_session():
        user = session['courier_name']
        return render_template('courier/pick_up.html', loggedin=active_session(), user=user)
    else:
        abort(401)

@app.route("/get_packs", methods=[GET])
def get_packs():
    if active_session():
        user = session['courier_name']
        return render_template('courier/get_packs.html', loggedin=active_session(), user=user)
    else:
        abort(401)

@app.route("/from_paczkomat", methods=[GET])
def from_paczkomat():
    if active_session():
        user = session['courier_name']
        return render_template('courier/from_paczkomat.html', loggedin=active_session(), user=user)
    else:
        abort(401)

@app.route("/check_pack_id", methods=[POST])
def check_pack_id():
    pack_id = request.form.get(PACK_ID_FIELD_ID)
    log.debug(pack_id)
    if db.hexists(pack_id, 'status'):
        log.debug('ok')
        return {'message': 'Paczka znajduje się w bazie danych.'}, 200
    else:
        return {'message': 'Brak paczki o podanym id w bazie danych.'}, 404

@app.route("/pick_up_pack", methods=[POST])
def change_status():
    pack_id = request.form.get(PACK_ID_FIELD_ID)
    user = session['courier_name']
    if db.hexists(pack_id, 'status'):
        pack_status = db.hget(pack_id, 'status')
        log.debug('Status paczki: {}'.format(pack_status))
        if pack_status == NEW:
            save_pack(user, pack_id)
            return {'message': 'odebrano poprawnie'}, 200
        else:
            return {'message':'Status paczki został już zmieniony.'}, 400
    else:
        return {'message':'Niepoprawny identyfikator paczki.'}, 404


def save_pack(user, pack_id):

    db.hset(pack_id, 'status', HANDED_OVER)
    db.hset(user + '-'+ PACKNAMES, pack_id, pack_id)

    log.debug("Picked up pack [name: {}].".format(pack_id))


@app.route("/check_paczkomat", methods=[POST])
def check_paczkomat():
    paczkomat_id = request.form.get(PACZKOMAT_FIELD_ID)
    log.debug(f'id paczkomatu {paczkomat_id}')
    session.permanent = True
    if db.hexists('paczkomaty', paczkomat_id):
        log.debug('paczkomat istnieje w bazie')
        return {'message': 'Poprawny kod paczkomatu.', 'status': 200}, 200
    else:
        return {'message': 'Nie ma takiego paczkomatu'}, 404



@app.route("/generate_token", methods=[GET])
def generate_token():
    user = session['courier_name']
    #token = uuid4()
    expires = timedelta( minutes = 1)
    access_token = create_access_token(identity=user, expires_delta=expires)
    token = get_jti(access_token)
    
    response = make_response(jsonify({'token': token}), 200,)
    response.headers["Content-Type"] = "application/json"
    set_access_cookies(response, access_token)
    return response

def active_session():
    hash_ = request.cookies.get(COURIER_SESSION_ID)
    log.debug(hash_)
    try:
        session['courier_name']
    except:
        return False

    if hash_ is not None:
        return True
    else:
        return False


@app.errorhandler(400)
def bad_request(error):
    return render_template("errors/400.html", error=error, loggedin=active_session())

@app.errorhandler(401)
def page_unauthorized(error):
    return render_template("errors/401.html", error=error, loggedin=active_session())

@app.errorhandler(403)
def forbidden(error):
    return render_template("errors/403.html", error=error, loggedin=active_session())

@app.errorhandler(404)
def page_not_found(error):
    return render_template("errors/404.html", error=error, loggedin=active_session())
    
@app.errorhandler(500)
def internal_server_error(error):
    return render_template("errors/500.html", error=error, loggedin=active_session())


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)