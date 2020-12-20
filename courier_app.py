from flask import Flask, render_template, url_for, redirect, send_file, make_response, abort, session
from flask import request, jsonify
from flask import logging
from datetime import timedelta
from errors import UnauthorizedUserError 
from flask_restplus import Api, Resource, fields
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
cors = CORS(app, supports_credentials=True)

api_app = Api(app = app, version = "0.1", title = "PAX app API", description = "REST-full API for PAXapp")

courier_app_namespace = api_app.namespace("courier", description = "Main API")

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

@courier_app_namespace.route("/")
class MainPage(Resource):

    @api_app.doc(responses = {200: "OK"})
    def get(self):
        return make_response(render_template("courier/index.html", loggedin=active_session()))

@app.before_request
def refresh_session():
    session.modified = True

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

@courier_app_namespace.route("/logged_in_user")
class User(Resource):

    @api_app.doc(responses = {200: "Logged in.", 401: "Not logged in."})
    def get(self):
        try:
            user = session['courier_name']
            return { 'user': user }, 200
        except:
            return {'message': 'Prawdopodobnie nie jesteś zalogowany'}, 401


@courier_app_namespace.route("/user/<string:courier_name>")
class CheckingUser(Resource):

    @api_app.doc(responses = {200: 'User in the database.', 404: 'User not found.'})
    def get(self, courier_name):
        if db.hexists(courier_name, LOGIN_FIELD_ID):
            return {"message":"User is in the database.", "status" : 200}, 200
        else:
            return {"message": "There is no user with this courier_name.", "status" : 404}, 404


@courier_app_namespace.route("/registration")
class Registration(Resource):

    def __init__(self, args):
        super().__init__(args)

    @api_app.doc(responses = {200: 'OK'})
    def get(self):
        return make_response(render_template("courier/registration.html", loggedin=active_session())) 


    register_model = api_app.model('register model',
            {
                'login': fields.String(required = True, description = "User's login", help = "login cannot be null"),
                'password': fields.String(required = True, description = "User's password", help = "password cannot be null"),
                'name': fields.String(required = True, description = "User's name", help = "name cannot be null"),
                'surname': fields.String(required = True, description = "User's surname", help = "surname cannot be null"),
                'bdate': fields.String(required = True, description = "User's bdate", help = "bdate cannot be null"),
                'pesel': fields.String(required = True, description = "User's pesel", help = "pesel cannot be null"),
                'country': fields.String(required = True, description = "User's country", help = "country cannot be null"),
                'postal_code': fields.String(required = True, description = "User's postal code", help = "postal code cannot be null"),
                'city': fields.String(required = True, description = "User's city", help = "city cannot be null"),
                'street': fields.String(required = True, description = "User's street", help = "street cannot be null"),
                'house_nr': fields.String(required = True, description = "User's house number", help = "house_nr cannot be null")
            })


    @api_app.doc(responses = {200: 'OK', 400: 'Registration failed.'})
    @api_app.expect(register_model)
    def post(self):
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

        try:
            registration_status = self.add_user(login, password, name, surname, bdate, pesel, country, postal_code, city, street, house_nr)
            return { "registration_status": registration_status }, 200
        except:
            return { "registration_status": 400 }, 400

    def add_user(self, login, password, name, surname, bdate, pesel, country, postal_code, city, street, house_nr):
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
            log.debug(login)

            return "OK"
        except Exception:
            return "Rejected!"

@courier_app_namespace.route("/login")
class Login(Resource):

    def __init__(self, args):
        super().__init__(args)

    @api_app.doc(responses = {200: 'OK'})
    def get(self):
        return make_response(render_template("courier/login.html", loggedin=active_session()))

    login_model = api_app.model('login model',
            {
                'login': fields.String(required = True, description = "User's login", help = "login cannot be null"),
                'password': fields.String(required = True, description = "User's password", help = "password cannot be null")
            })

    @api_app.doc(responses = {200: 'OK', 400: 'Invalid authorization data.'})
    @api_app.expect(login_model)
    def post(self):
        courier_name = request.form[LOGIN_FIELD_ID]
        password = request.form[PASSWD_FIELD_ID]

        if db.hexists("kurier-" + courier_name, LOGIN_FIELD_ID):
            log.debug("Użytkownik " + courier_name + " jest w bazie danych.")
            if self.check_passwd(courier_name,password):
                log.debug("Hasło jest poprawne.")
                hash_ = uuid4().hex 
                db.hset("kurier-" + courier_name, COURIER_SESSION_ID, hash_)
                session.permanent = True
                session['courier_name'] = courier_name
                
                expires = timedelta( minutes = 5)
                access_token = create_access_token(identity=courier_name, expires_delta=expires*10)
                refresh_token = create_refresh_token(identity=courier_name, expires_delta=expires*4)

                response = make_response(jsonify({ 'logged_in': 'OK', 'access_token': access_token}))
                response.set_cookie(COURIER_SESSION_ID, hash_,  max_age=300, secure=True, httponly=True)
                set_access_cookies(response, access_token)
                set_refresh_cookies(response, refresh_token)

                return response
            else:
                response = make_response("Błędny login lub hasło", 400)
                return response
        else:
            response = make_response("Błędny login lub hasło", 400)
            return response

    def check_passwd(self, courier_name, password):
        password = password.encode("utf-8")
        passwd_hash = hashlib.sha512(password).hexdigest()
        return passwd_hash == db.hget("kurier-" + courier_name, PASSWD_FIELD_ID)

@courier_app_namespace.route("/logout")
class Logout(Resource):

    @api_app.doc(responses = {200: 'OK'})
    def get(self):
        if active_session():
            hash_ = request.cookies.get(COURIER_SESSION_ID)
            session.pop('courier_name', None)
            session.clear()
            response = make_response(render_template("courier/index.html", loggedin=False))
            response.set_cookie(COURIER_SESSION_ID, hash_, max_age=0, secure=True, httponly=True)
            unset_jwt_cookies(response)
            return response
        else:
            return make_response(render_template("courier/index.html", loggedin=active_session()))


@courier_app_namespace.route("/waybills-list/<int:start>", methods=[GET])
class WaybillsList(Resource):

    @api_app.doc(responses = {200: 'OK', 401: 'Unauthorized'})
    def get(self,start):
        if active_session():
            try:
                log.debug('wyświetlenie listy')
                user = session['courier_name']
                waybills = db.hvals(user + '-' + PACKNAMES)
                n_of_waybills = len(waybills)
                if start >= 0:
                    limit = start + WAYBILLS_PER_PAGE
                    next_start = limit
                    previous_start = start - WAYBILLS_PER_PAGE
                    log.debug(f'wszystkich paczek: {n_of_waybills}')
                    if limit >= n_of_waybills:
                        limit = n_of_waybills
                        next_start = None
                    if previous_start < 0:
                        previous_start = None
                    log.debug(f'start: {start}, limit: {limit}')
                    log.debug(f'previous: {previous_start}, next: {next_start}')
                    waybills_to_send = waybills[start:limit] 
                    waybills_images = []
                    for waybill in waybills_to_send:
                        waybills_images.append(db.hget(IMAGES_PATHS, waybill))
                    return make_response(render_template('courier/waybills-list.html', 
                                        my_waybills = zip(waybills,waybills_images), 
                                        previous_start=previous_start, next_start=next_start,
                                        loggedin=active_session(), user=user))
                else:
                    log.debug('Numer strony nie może być liczbą ujemną.')
                    abort(404)
            except:
                log.debug('chyba nie jest przekazywany user')
                raise UnauthorizedUserError
        else:
            raise UnauthorizedUserError

@courier_app_namespace.route("/pick_up")
class PickUpService(Resource):

    @api_app.doc(responses = {200: 'OK', 401: 'Unauthorized'})
    def get(self):
        if active_session():
            try:
                user = session['courier_name']
                return make_response(render_template('courier/pick_up.html', loggedin=active_session(), user=user)) 
            except:
                raise UnauthorizedUserError
        else:
            raise UnauthorizedUserError

@courier_app_namespace.route("/get_packs")
class GetPacksService(Resource):

    @api_app.doc(responses = {200: 'OK', 401: 'Unauthorized'})
    def get(self):
        if active_session():
            try:
                user = session['courier_name']
                return make_response(render_template('courier/get_packs.html', loggedin=active_session(), user=user)) 
            except:
                raise UnauthorizedUserError
        else:
            raise UnauthorizedUserError

@courier_app_namespace.route("/from_paczkomat")
class PaczkomatService(Resource):

    @api_app.doc(responses = {200: 'OK', 401: 'Unauthorized'})
    def get(self):
        if active_session():
            try:
                user = session['courier_name']
                return make_response(render_template('courier/from_paczkomat.html', loggedin=active_session(), user=user)) 
            except:
                raise UnauthorizedUserError
        else:
            raise UnauthorizedUserError
'''
@courier_app_namespace.route("/check_pack_id")
class CheckPack(Resource):

    def post(self):
        pack_id = request.form.get(PACK_ID_FIELD_ID)
        log.debug(pack_id)
        if db.hexists(pack_id, 'status'):
            log.debug('ok')
            return {'message': 'Paczka znajduje się w bazie danych.'}, 200
        else:
            return {'message': 'Brak paczki o podanym id w bazie danych.'}, 404
'''

@courier_app_namespace.route("/pick_up_pack")
class StatusChange(Resource):

    def __init__(self, args):
        super().__init__(args)

    pack_model = api_app.model('pack model',
            {
                'pack_id': fields.String(required = True, description = "pack id", help = "pack id cannot be null"),
            })

    @api_app.doc(responses = {200: 'OK', 400: 'Status changed before.', 404: 'Pack not found'})
    @api_app.expect(pack_model)
    def post(self):
        pack_id = request.form.get(PACK_ID_FIELD_ID)
        try:
            user = session['courier_name']
            if db.hexists(pack_id, 'status'):
                pack_status = db.hget(pack_id, 'status')
                log.debug('Status paczki: {}'.format(pack_status))
                if pack_status == NEW:
                    self.save_pack(user, pack_id)
                    return {'message': 'odebrano poprawnie'}, 200
                else:
                    return {'message':'Status paczki został już zmieniony.'}, 400
            else:
                return {'message':'Niepoprawny identyfikator paczki.'}, 404
        except:
            return {'message':'Nie udało się pobrać nazwy użytkownika.'}, 404


    def save_pack(self, user, pack_id):

        db.hset(pack_id, 'status', HANDED_OVER)
        db.hset(pack_id, 'tmp_owner', session['courier_name'])
        db.hset(user + '-'+ PACKNAMES, pack_id, pack_id)

        log.debug("Picked up pack [name: {}].".format(pack_id))


@courier_app_namespace.route("/check_paczkomat")
class CheckPaczkomat(Resource):

    def __init__(self, args):
        super().__init__(args)

    paczkomat_model = api_app.model('pack model',
            {
                'paczkomat_id': fields.String(required = True, description = "paczkomat id", help = "paczkomat id cannot be null"),
            })

    @api_app.doc(responses = {200: 'OK', 404: 'Paczkomat not found'})
    @api_app.expect(paczkomat_model)
    def post(self):
        paczkomat_id = request.form.get(PACZKOMAT_FIELD_ID)
        log.debug(f'id paczkomatu {paczkomat_id}')
        session.permanent = True
        if db.hexists('paczkomaty', paczkomat_id):
            log.debug('paczkomat istnieje w bazie')
            return {'message': 'Poprawny kod paczkomatu.', 'status': 200}, 200
        else:
            return {'message': 'Nie ma takiego paczkomatu'}, 404



@courier_app_namespace.route("/generate_token")
class Token(Resource):

    @api_app.doc(responses = {200: 'OK', 404: 'Courier not found'})
    def get(self):
        try:
            user = session['courier_name']
            expires = timedelta( minutes = 1)
            access_token = create_access_token(identity=user, expires_delta=expires)
            token = get_jti(access_token)
            
            response = make_response(jsonify({'token': token}), 200,)
            response.headers["Content-Type"] = "application/json"
            set_access_cookies(response, access_token)
            return response
        except:
            return make_response(jsonify({'msg': 'nie udało się potwierdzić tożsamości kuriera'}), 404)


@app.errorhandler(400)
def bad_request(error):
    return make_response(render_template("courier/errors/400.html", error=error, loggedin=active_session()))
'''
@app.errorhandler(401)
def page_unauthorized(error):
    return make_response(render_template("courier/errors/401.html", error=error, loggedin=active_session()))
'''
@app.errorhandler(UnauthorizedUserError)
def page_unauthorized(error):
    return make_response(render_template("courier/errors/401.html", error=error, loggedin=active_session()))

@app.errorhandler(403)
def forbidden(error):
    return make_response(render_template("courier/errors/403.html", error=error, loggedin=active_session()))

@app.errorhandler(404)
def page_not_found(error):
    return make_response(render_template("courier/errors/404.html", error=error, loggedin=active_session()))
    
@app.errorhandler(500)
def internal_server_error(error):
    return make_response(render_template("courier/errors/500.html", error=error, loggedin=active_session()))



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)