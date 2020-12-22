from flask import Flask, render_template, url_for, redirect, send_file, make_response, abort, session
from flask import request, jsonify
import json
from flask_restplus import Api, Resource, fields
from errors import UnauthorizedUserError 
from flask import logging
from datetime import timedelta
from uuid import uuid4
from const import *
from flask_jwt_extended import JWTManager, jwt_required, get_raw_jwt, create_access_token, create_refresh_token, set_refresh_cookies, set_access_cookies, create_refresh_token, unset_jwt_cookies, jwt_refresh_token_required, get_jwt_identity
import redis
import os
import hashlib
from flask_cors import CORS, cross_origin

app = Flask(__name__, static_url_path="")
log = logging.create_logger(app)
db = redis.Redis(host="redis-db", port=6379, decode_responses=True)
cors = CORS(app, supports_credentials=True)

api_app = Api(app = app, version = "0.1", title = "PAX app API", description = "REST-full API for PAXapp")

paczkomat_app_namespace = api_app.namespace("paczkomat", description = "Main API")

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


@paczkomat_app_namespace.route("/")
class MainPage(Resource):

    @api_app.doc(responses = {200: "OK"})
    def get(self):
        return make_response(render_template("paczkomat/index.html"))


@paczkomat_app_namespace.route("/check_paczkomat")
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
            return {'message': 'Poprawny kod paczkomatu.', 'status': 200, 'kod': paczkomat_id}, 200
        else:
            return {'message': 'Nie ma takiego paczkomatu'}, 404


@paczkomat_app_namespace.route("/<string:paczkomat_id>")
class Paczkomat(Resource):

    @api_app.doc(responses = {200: 'OK', 404: 'Paczkomat not found'})
    def get(self, paczkomat_id):
        if db.hexists('paczkomaty', paczkomat_id):
            log.debug(f'paczkomat {paczkomat_id} istnieje w bazie')
            session['paczkomat'] = paczkomat_id
            return make_response(render_template("paczkomat/paczkomat.html", paczkomat=paczkomat_id)) 
        else:
            abort(404)

@paczkomat_app_namespace.route("/<string:paczkomat_id>/send")
class SendPack(Resource):

    @api_app.doc(responses = {200: 'OK', 404: 'Paczkomat not found'})
    def get(self, paczkomat_id):
        log.debug(f'send: {paczkomat_id}')
        if db.hexists('paczkomaty', paczkomat_id):
            log.debug('paczkomat istnieje w bazie')
            session['paczkomat'] = paczkomat_id
            return make_response(render_template("paczkomat/send.html", paczkomat=paczkomat_id))
        else:
            abort(404)
    
@paczkomat_app_namespace.route("/check_pack_id")
class CheckPack(Resource):

    @api_app.doc(responses = {200: 'OK', 404: 'Pack not found.'})
    def post(self):
        pack_id = request.form.get(PACK_ID_FIELD_ID)
        log.debug(pack_id)
        if db.hexists(pack_id, 'status'):
            log.debug('ok')
            return {'message': 'Paczka znajduje się w bazie danych.'}, 200
        else:
            return {'message': 'Brak paczki o podanym id w bazie danych.'}, 404

@paczkomat_app_namespace.route("/put_in")
class PutPackService(Resource):

    @api_app.doc(responses = {200: 'OK', 404: 'Pack not found.'})
    def post(self):
        pack_id = request.form.get(PACK_ID_FIELD_ID)
        log.debug(pack_id)
        if db.hexists(pack_id, 'status'):
            try:
                paczkomat = session['paczkomat']
            except:
                log.debug('nie przekazano paczkomatu')
                return {'message': 'Wróć do wyboru paczkomatu.', 'status': 404}, 404
            try:
                if db.hget(pack_id, 'status') == NEW:
                    db.hset(pack_id, 'status', WAITING)
                    db.hset(pack_id, 'tmp_owner', paczkomat)
                    db.hset(paczkomat, pack_id, pack_id)
                    return {'message': 'Udało się włożyć paczkę.', 'status': 200}, 200
                else:
                    return {'message': 'Nieprawidłowy status paczki.', 'status': 400}, 400
            except:
                log.debug('problem w bazie danych')
            return {'message': 'Nie udało się włożyć paczki.', 'status': 404}, 404
        else:
            return {'message': 'Brak paczki o podanym id w bazie danych.'}, 404


@paczkomat_app_namespace.route("/confirm_token")
class TokenConfirm(Resource):

    @api_app.doc(responses = {200: 'OK', 404: 'Pack not found.'})
    @cross_origin(origins=["https://localhost:8082"])
    @jwt_required
    def post(self):
        token = get_raw_jwt()['jti']
        session['courier'] = get_jwt_identity()
        entered_token = request.form.get(TOKEN_FIELD_ID)
        paczkomat = request.form.get('paczkomat')
        log.debug(paczkomat)
        log.debug(f'poprawny token: {token}')
        log.debug(f'wprowadzony token: {entered_token}')
        if token == entered_token:
            log.debug('ok')
            return {'msg':'Poprawny token.', 'paczkomat': paczkomat, 'status':200}, 200
        else:
            return {'msg':'Podano błędny token.', 'paczkomat': paczkomat, 'status':404}, 404

@paczkomat_app_namespace.route("/<string:paczkomat_id>/enter_token")
class EnterToken(Resource):

    @api_app.doc(responses = {200: 'OK', 404: 'Paczkomat not found'})
    def get(self, paczkomat_id):
        if db.hexists('paczkomaty', paczkomat_id):
            log.debug('paczkomat istnieje w bazie')
            log.debug(f'enter_token: {paczkomat_id}')
            session['paczkomat'] = paczkomat_id
            return make_response(render_template("paczkomat/enter_token.html", paczkomat=paczkomat_id)) 
        else:
            abort(404)

@paczkomat_app_namespace.route("/<string:paczkomat_id>/packs_list")
class PacksList(Resource):

    @api_app.doc(responses = {200: 'OK', 404: 'Paczkomat not found'})
    def get(self, paczkomat_id):
        log.debug(f'packs_list: {paczkomat_id}')
        if db.hexists('paczkomaty', paczkomat_id):
            session['paczkomat'] = paczkomat_id
            return make_response(render_template('paczkomat/packs_list.html', paczkomat=paczkomat_id))
        else:
            abort(404)

@paczkomat_app_namespace.route("/<string:paczkomat_id>/packs_list/<int:start>")
class PaginatedPacksList(Resource):

    @api_app.doc(responses = {200: 'OK', 404: 'Paczkomat not found'})
    def get(self, paczkomat_id, start):
        log.debug(f'packs_list: {paczkomat_id}')
        if db.hexists('paczkomaty', paczkomat_id):
            session['paczkomat'] = paczkomat_id
            packs = db.hvals(paczkomat_id)
            log.debug('wyświetlenie listy')

            n_of_packs = len(packs)
            if start >= 0:
                limit = start + WAYBILLS_PER_PAGE
                next_start = limit
                previous_start = start - WAYBILLS_PER_PAGE
                log.debug(f'wszystkich paczek: {n_of_packs}')
                if limit >= n_of_packs:
                    limit = n_of_packs
                    next_start = None
                if previous_start < 0:
                    previous_start = None
                log.debug(f'start: {start}, limit: {limit}')
                log.debug(f'previous: {previous_start}, next: {next_start}')
                packs_to_send = packs[start:limit] 
                packs_images = []
                for pack in packs:
                    packs_images.append(db.hget(IMAGES_PATHS, pack))
                return make_response(jsonify({'packs': packs_to_send, 'packs_images': packs_images,'previous_start': previous_start, 'next_start': next_start }), 200)
            else:
                log.debug('Numer strony nie może być liczbą ujemną.')
                abort(404)
        else:
            abort(404)

@paczkomat_app_namespace.route("/take_out")
class TakeOut(Resource):

    @api_app.doc(responses = {200: 'OK', 404: 'Pack not found.'})
    @cross_origin(origins=["https://localhost:8082"])
    def post(self):
        try:
            paczkomat = session['paczkomat']
            user = session['courier']
            r = json.loads(request.data)
            log.debug(r)
            packs = r.get('packs') 
            log.debug(f'wyjęte paczki: {packs}')
            try:
                for pack in packs:
                    db.hset(pack, 'status', PICKED_UP)
                    db.hdel(paczkomat, pack)
                    self.take_out_packs(user,pack)
            except:
                return {'message':'Nie udało się zmienić stanu paczek w bazie danych.', 'status':500}, 500
            return {'message':'Paczki wyjęte z paczkomatu.', 'status':200}, 200
        except:
            return {'message':'Nie udało się wyjąć paczek.', 'status':400}, 400

    def take_out_packs(self, user, pack_id):

        db.hset(pack_id, 'status', HANDED_OVER)
        db.hset(user + '-'+ PACKNAMES, pack_id, pack_id)

        log.debug("Picked up pack [name: {}].".format(pack_id))



@app.errorhandler(400)
def bad_request(error):
    return make_response(render_template("paczkomat/errors/400.html"))
'''
@app.errorhandler(401)
def page_unauthorized(error):
    return make_response(render_template("paczkomat/errors/401.html"))
'''
@app.errorhandler(UnauthorizedUserError)
def page_unauthorized(error):
    return make_response(render_template("paczkomat/errors/401.html"))

@app.errorhandler(403)
def forbidden(error):
    return make_response(render_template("paczkomat/errors/403.html"))

@app.errorhandler(404)
def page_not_found(error):
    return make_response(render_template("paczkomat/errors/404.html"))
    
@app.errorhandler(500)
def internal_server_error(error):
    return make_response(render_template("paczkomat/errors/500.html"))



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)