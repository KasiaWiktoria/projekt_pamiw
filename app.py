from flask import Flask, render_template, abort, url_for, redirect, send_file, make_response, session
from flask import request, jsonify, logging
from datetime import timedelta
from uuid import uuid4
from errors import NotFoundError, NotAuthorizedError 
from const import *
from flask_restplus import Api, Resource, fields
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, create_refresh_token, set_refresh_cookies, set_access_cookies, create_refresh_token, unset_jwt_cookies, jwt_refresh_token_required, get_jwt_identity
import redis
import os
import hashlib
from flask_cors import CORS, cross_origin
from authlib.integrations.flask_client import OAuth
from functools import wraps
from flask_socketio import SocketIO, join_room, leave_room, emit, send

app = Flask(__name__, static_url_path="")
log = logging.create_logger(app)
db = redis.Redis(host="redis-db", port=6379, decode_responses=True)
cors = CORS(app, supports_credentials=True)
oauth = OAuth(app)
socket_io = SocketIO(app)

api_app = Api(app = app, version = "0.1", title = "PAX app API", description = "REST-full API for PAXapp")
client_app_namespace = api_app.namespace("app", description = "Main API")


auth0 = oauth.register(
    "pax-app-auth0-2020",
    api_base_url=OAUTH_BASE_URL,
    client_id=OAUTH_CLIENT_ID,
    client_secret=OAUTH_CLIENT_SECRET,
    access_token_url=OAUTH_ACCESS_TOKEN_URL,
    authorize_url=OAUTH_AUTHORIZE_URL,
    client_kwargs={"scope": OAUTH_SCOPE})


app.config["JWT_COOKIE_CSRF_PROTECT"] = False
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = os.environ.get(SECRET_KEY)
app.config["JWT_SECRET_KEY"] = os.environ.get(SECRET_KEY)
app.config["JWT_SESSION_COOKIE"] = False
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = TOKEN_EXPIRES_IN_SECONDS
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = TOKEN_EXPIRES_IN_SECONDS
app.config["JWT_TOKEN_LOCATION"] = JWT_TOKEN_LOCATION
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=5)
app.config["SESSION_REFRESH_EACH_REQUEST"] = True
app.config['CORS_SUPPORTS_CREDENTIALS'] = True
app.config["PROPAGATE_EXCEPTIONS"] = False


jwt = JWTManager(app)

'''
@socket_io.on("connect")
def handle_on_connect():
    log.debug("Connected -> OK")
    emit("connection response", {"data": "Correctly connected"})


@socket_io.on("disconnect")
def handle_on_disconnect():
    log.debug("Disconnected -> Bye")
'''

@client_app_namespace.route("/")
class MainPage(Resource):

    @api_app.doc(responses = {200: "OK"})
    def get(self):
        return make_response(render_template("index.html", loggedin=active_session()))

@app.before_request
def refresh_session():
    session.modified = True
    '''
    if active_session():
        refresh()
    '''
def active_session():
    log.debug(request.cookies.get(SESSION_ID))
    hash_ = request.cookies.get(SESSION_ID)
    try:
        session['username']
    except:
        return False

    if hash_ is not None:
        return True
    else:
        return False

@client_app_namespace.route("/logged_in_user")
class User(Resource):

    @api_app.doc(responses = {200: "Logged in.", 401: "Not logged in."})
    def get(self):
        try:
            user = session['username']
            return { 'user': user }, 200
        except:
            return {'message': 'Prawdopodobnie nie jesteś zalogowany'}, 401

'''
@client_app_namespace.route('/get_access_token')
class Token(Resource):

    @api_app.doc(responses = {200: "OK"})
    def get(self):
        user = session['username']
        access_token = create_access_token(identity=user)
        return { 'access_token': access_token}
'''

@client_app_namespace.route("/send")
class SendFormPage(Resource):
    
    @api_app.doc(responses = {200: 'OK', 401: 'Unauthorized'})
    @cross_origin(origins=["https://localhost:8081"])
    def get(self):
        if active_session():
            try:
                username = session['username']
                log.debug("Username of actually logged in user: " + username)
                return make_response(render_template('send.html', loggedin=active_session(), user= session['username']))
            except:
                log.debug('nie udało się wczytać nazwy użytkownika')
                return page_unauthorized(NotAuthorizedError)
                #raise NotAuthorizedError
        else:
            log.debug('niezalogowany')
            return page_unauthorized(NotAuthorizedError)
            #abort(401)
            #client_app_namespace.abort(401, status = "Unauthorized user.", statusCode = "401")


@client_app_namespace.route("/user/<string:username>")
class CheckingUser(Resource):

    @api_app.doc(responses = {200: 'User in the database.', 404: 'User not found.'})
    def get(self, username):
        if db.hexists(username, LOGIN_FIELD_ID):
            return {"message":"User is in the database.", "status" : 200}, 200
        else:
            return {"message": "There is no user with this username.", "status" : 404}, 404


@client_app_namespace.route("/registration")
class Registration(Resource):

    def __init__(self, args):
        super().__init__(args)

    @api_app.doc(responses = {200: 'OK'})
    def get(self):
        return make_response(render_template("registration.html", loggedin=active_session())) 


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

@client_app_namespace.route("/login")
class Login(Resource):

    def __init__(self, args):
        super().__init__(args)

    @api_app.doc(responses = {200: 'OK'})
    def get(self):
        return make_response(render_template("login.html", loggedin=active_session()))

    login_model = api_app.model('login model',
            {
                'login': fields.String(required = True, description = "User's login", help = "login cannot be null"),
                'password': fields.String(required = True, description = "User's password", help = "password cannot be null")
            })

    @api_app.doc(responses = {200: 'OK', 400: 'Invalid authorization data.'})
    @api_app.expect(login_model)
    def post(self):
        username = request.form[LOGIN_FIELD_ID]
        password = request.form[PASSWD_FIELD_ID]

        if db.hexists(username, LOGIN_FIELD_ID):
            log.debug("Użytkownik " + username + " jest w bazie danych.")
            if self.check_passwd(username,password):
                log.debug("Hasło jest poprawne.")
                hash_ = uuid4().hex 
                db.hset(username, SESSION_ID, hash_)
                session.permanent = True
                session['username'] = username
                
                expires = timedelta( minutes = 5)
                access_token = create_access_token(identity=username, expires_delta=expires)
                refresh_token = create_refresh_token(identity=username, expires_delta=expires)

                response = make_response(jsonify({ 'logged_in': 'OK', 'access_token': access_token}))
                response.set_cookie(SESSION_ID, hash_,  max_age=300, secure=True, httponly=True)
                set_access_cookies(response, access_token)
                set_refresh_cookies(response, refresh_token)

                return response
            else:
                response = make_response("Błędny login lub hasło", 400)
                return response
        else:
            response = make_response("Błędny login lub hasło", 400)
            return response

    def check_passwd(self, username, password):
        password = password.encode("utf-8")
        passwd_hash = hashlib.sha512(password).hexdigest()
        return passwd_hash == db.hget(username, PASSWD_FIELD_ID)

@client_app_namespace.route("/logout")
class Logout(Resource):

    @api_app.doc(responses = {200: 'OK'})
    def get(self):
        if active_session():
            hash_ = request.cookies.get(SESSION_ID)
            session.pop('username', None)
            session.clear()
            response = make_response(render_template("index.html", loggedin=False))
            response.set_cookie(SESSION_ID, hash_, max_age=0, secure=True, httponly=True)
            unset_jwt_cookies(response)
            return response
        else:
            return make_response(render_template("index.html", loggedin=active_session()))

'''
@client_app_namespace.route("/waybills-list", methods=[GET])
class WaybillsList(Resource):

    @cross_origin(origins=["https://localhost:8081"])
    @api_app.doc(responses = {200: 'OK', 401: 'Unauthorized'})
    def get(self):
        if active_session():
            try:
                user = session['username']
                waybills = db.hvals(user + '-' + PACKNAMES)
                waybills_images = []
                for waybill in waybills:
                    waybills_images.append(db.hget(IMAGES_PATHS, waybill))
                return make_response(render_template('waybills-list.html', my_waybills = zip(waybills,waybills_images), loggedin=active_session(), user=user))
            except:
                raise NotAuthorizedError
        else:
            raise NotAuthorizedError
'''

@client_app_namespace.route("/waybills_list")
class PageWaybillsList(Resource):

    @cross_origin(origins=["https://localhost:8081"])
    @api_app.doc(responses = {200: 'OK', 401: 'Unauthorized'})
    def get(self):
        if active_session():
            try:
                user = session['username']
                return make_response(render_template('waybills-list.html', loggedin=active_session(), user=user))
            except:
                return page_unauthorized(NotAuthorizedError)
        else:
            return page_unauthorized(NotAuthorizedError)

@client_app_namespace.route("/waybills_list/<int:start>")
class PaginatedWaybillsList(Resource):

    @api_app.param(START, "The data will be returned from this position.")
    @cross_origin(origins=["https://localhost:8081"])
    @api_app.doc(responses = {200: 'OK', 401: 'Unauthorized'})
    def get(self, start):
        if active_session():
            log.debug('Zalogowany użytkownik --> wyświetlenie listy')
            try:
                log.debug('wyświetlenie listy')
                user = session['username']
                waybills = db.hvals(user + '-' + PACKNAMES)
                n_of_waybills = len(waybills)
                if start >= 0:
                    limit = start + WAYBILLS_PER_PAGE
                    next_start = limit
                    next_url = f'https://localhost:8080/app/waybills_list/{next_start}'
                    previous_start = start - WAYBILLS_PER_PAGE
                    prev_url = f'https://localhost:8080/app/waybills_list/{previous_start}'
                    log.debug(f'wszystkich paczek: {n_of_waybills}')
                    if limit >= n_of_waybills:
                        limit = n_of_waybills
                        next_url = None
                    if previous_start < 0:
                        prev_url = None
                    log.debug(f'start: {start}, limit: {limit}')
                    log.debug(f'previous: {previous_start}, next: {next_start}')
                    waybills_to_send = waybills[start:limit] 

                    waybills_images = []
                    for waybill in waybills_to_send:
                        waybills_images.append(db.hget(IMAGES_PATHS, waybill))

                    pack_states = []
                    for waybill in waybills_to_send:
                        pack_states.append(db.hget(waybill, 'status'))
                        log.debug(f'paczki: {waybills_to_send}')
                    log.debug(f'pack_states: {pack_states}')
                    return make_response(jsonify({'waybills': waybills_to_send, 'waybills_images': waybills_images, 'pack_states': pack_states,'previous_page_url': prev_url, 'next_page_url': next_url }), 200)
                else:
                    log.debug('Numer strony nie może być liczbą ujemną.')
                    raise NotFoundError
            except:
                raise NotAuthorizedError
        else:
            log.debug('niezalogowany użytkownik')
            return page_unauthorized(401)



def authorization_required(fun):
    @wraps(fun)
    def authorization_decorator(*args, **kwds):
        if NICKNAME not in session:
            return redirect("/login")

        return fun(*args, **kwds)

    return authorization_decorator


@app.route("/auth0_login")
def login():
    return auth0.authorize_redirect(
        redirect_uri=OAUTH_CALLBACK_URL,
        audience="")

@app.route("/callback")
def oauth_callback():
    try:
        auth_access_token = auth0.authorize_access_token()
        log.debug(f'auth access token: {auth_access_token}')

    except Exception as e:
        log.debug(e)
    resp = auth0.get("userinfo")
    nickname = resp.json()["nickname"]

    session['username'] = nickname
    log.debug(f'nickname: {nickname}')

    return redirect("https://localhost:8080/")


'''
@app.route('/refresh', methods=['POST'])
@jwt_refresh_token_required
def refresh():
    current_user = get_jwt_identity()
    if current_user != None:
        expires = timedelta( minutes = 5)
        access_token = create_access_token(identity=current_user, expires_delta=expires)

        resp = jsonify({'refresh': True})
        set_access_cookies(resp, access_token)
        log.debug(access_token)
        return resp, 200
    else:
        return jsonify({'refresh': False})
'''

@app.errorhandler(400)
def bad_request(error):
    return make_response(render_template("errors/400.html", error=error, loggedin=active_session()))

@app.errorhandler(401)
def page_unauthorized(error):
    return make_response(render_template("errors/401.html", error=error, loggedin=active_session()))
'''
@app.errorhandler(NotAuthorizedError)
def page_unauthorized(error):
    log.debug('błąd')
    return make_response(render_template("errors/401.html", error=error, loggedin=active_session()))
'''
@app.errorhandler(403)
def forbidden(error):
    return make_response(render_template("errors/403.html", error=error, loggedin=active_session()))

@app.errorhandler(NotFoundError)
def not_found(error):
    return make_response(render_template("errors/404.html", error=error, loggedin=active_session()))

@app.errorhandler(404)
def page_not_found(error):
    return make_response(render_template("errors/404.html", error=error, loggedin=active_session()))
'''
@app.errorhandler(500)
def internal_server_error(error):
    return make_response(render_template("errors/500.html", error=error, loggedin=active_session()))
'''
@api_app.errorhandler
def default_error_handler(error):
    return make_response(render_template("errors/default.html", error=error, loggedin=active_session()))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
