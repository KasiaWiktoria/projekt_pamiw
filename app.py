from flask import Flask, render_template, url_for, redirect, send_file, make_response, abort, session
from flask import request, jsonify
from flask import logging
from datetime import timedelta
from uuid import uuid4
from const import *
from model.pack import *
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, create_refresh_token, set_refresh_cookies, set_access_cookies, create_refresh_token, unset_jwt_cookies
import redis
import os
import hashlib
from flask_cors import CORS, cross_origin

app = Flask(__name__, static_url_path="")
log = logging.create_logger(app)
db = redis.Redis(host="redis-db", port=6379, decode_responses=True)
cors = CORS(app)

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = SECRET_KEY
app.config["JWT_SECRET_KEY"] = os.environ.get(SECRET_KEY)
app.config["JWT_SESSION_COOKIE"] = False
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = TOKEN_EXPIRES_IN_SECONDS
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = TOKEN_EXPIRES_IN_SECONDS
app.config["JWT_TOKEN_LOCATION"] = JWT_TOKEN_LOCATION
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=5)
app.config["SESSION_REFRESH_EACH_REQUEST"] = True

jwt = JWTManager(app)

@app.route("/", methods=[GET])
def index():
    return render_template("index.html", loggedin=active_session())

@app.before_request
def refresh_session():
    session.modified = True

@app.route("/waybills-list", methods=[GET])
def list():
    if active_session():
        user = session['username']
        waybills = db.hvals(user + '-' + FILENAMES)
        waybills_images = db.hvals(user + '-' + IMAGES_PATHS)
        log.debug(waybills)
        log.debug(waybills_images)
        return render_template('waybills-list.html', my_waybills = zip(waybills,waybills_images), loggedin=active_session(), user=user)
    else:
        abort(401)

'''
@app.route("/<string:name>/", methods=[GET])
def set(name):
    try:    
        return render_template(name + '.html')
    except Exception:
        abort(404) 
'''

@app.route("/logged_in_user")
def get_username():
    try:
        user = session['username']
        return { 'user': user }, 200
    except:
        return {'message': 'Prawdopodobnie nie jesteś zalogowany'}, 401

@cross_origin(origins=["https://localhost:8081/"], supports_creditentials=True)
@app.route("/send", methods=[GET])
def send():
    if active_session():
        username = session['username']
        log.debug("Username of actually logged in user: " + username)
        return render_template('send.html', loggedin=active_session(), user= session['username'])
    else:
        abort(401)

@app.route("/user/<string:username>", methods=[GET,POST])
def check_user(username):
    
    if db.hexists(username, LOGIN_FIELD_ID):
        return {"message":"User is in the database.", "status" : 200}, 200
    else:
        return {"message": "There is no user with this username.", "status" : 404}, 404


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
        return render_template("registration.html", loggedin=active_session()) 

def add_user(login, password, name, surname, bdate, pesel, country, postal_code, city, street, house_nr):
    log.debug("Login: " + login + ", name: " + name + ", city: " + city)
    try:
        password = password.encode("utf-8")
        hashed_password = hashlib.sha512(password).hexdigest()
        db.hset(login, LOGIN_FIELD_ID, login.encode("utf-8"))
        db.hset(login, PASSWD_FIELD_ID, hashed_password)
        db.hset(login, NAME_FIELD_ID, name.encode("utf-8"))
        db.hset(login, SURNAME_FIELD_ID, surname.encode("utf-8"))
        db.hset(login, BDATE_FIELD_ID, bdate.encode("utf-8"))
        db.hset(login, PESEL_FIELD_ID, pesel.encode("utf-8"))
        db.hset(login, COUNTRY_FIELD_ID, country.encode("utf-8"))
        db.hset(login, POSTAL_CODE_FIELD_ID, postal_code.encode("utf-8"))
        db.hset(login, CITY_FIELD_ID, city.encode("utf-8"))
        db.hset(login, STREET_FIELD_ID, street.encode("utf-8"))
        db.hset(login, HOUSE_NR_FIELD_ID, house_nr.encode("utf-8"))
        log.debug(login)

        return "OK"
    except Exception:
        return "Rejected!"

@app.route("/login", methods=[GET, POST])
def login():
    if request.method == POST:
        username = request.form[LOGIN_FIELD_ID]
        password = request.form[PASSWD_FIELD_ID]

        if db.hexists(username, LOGIN_FIELD_ID):
            log.debug("Użytkownik " + username + " jest w bazie danych.")
            if check_passwd(username,password):
                log.debug("Hasło jest poprawne.")
                hash_ = uuid4().hex 
                db.hset(username, SESSION_ID, hash_)
                session.permanent = True
                session['username'] = username
                response = make_response(redirect("/" + username + "/waybills-list"))
                #response.set_cookie(SESSION_ID, hash_,  max_age=300, secure=True, httponly=True)

                expires = timedelta( minutes = 5)
                access_token = create_access_token(identity=username, expires_delta=expires)
                refresh_token = create_refresh_token(identity=username, expires_delta=expires)

                set_access_cookies(response, access_token)
                set_refresh_cookies(response, refresh_token)
                return response
            else:
                response = make_response("Błędny login lub hasło", 400)
                return response
        else:
            response = make_response("Błędny login lub hasło", 400)
            return response
        
    else:
        if active_session():
            return render_template("errors/already-logged-in.html", loggedin=active_session(), user= session['username'])
        return render_template("login.html", loggedin=active_session())

def check_passwd(username, password):
    password = password.encode("utf-8")
    passwd_hash = hashlib.sha512(password).hexdigest()
    return passwd_hash == db.hget(username, PASSWD_FIELD_ID)

@app.route("/logout", methods=[GET, POST])
def logout():
    if active_session():
        hash_ = request.cookies.get(SESSION_ID)
        session.pop('username', None)
        session.clear()
        response = make_response(render_template("index.html", loggedin=False))
        response.set_cookie(SESSION_ID, hash_, max_age=0, secure=True, httponly=True)
        unset_jwt_cookies(response)
        return response
    else:
        return render_template("index.html", loggedin=active_session())

def active_session():
    hash_ = request.cookies.get(SESSION_ID)

    if hash_ is not None:
        return True
    else:
        return False



@app.route("/test")
def test():
    return {'test' : 'json() działa!'}, 200



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
