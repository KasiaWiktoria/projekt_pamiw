from flask import Flask, redirect,request, render_template, jsonify, send_file, url_for, make_response, abort
from flask import logging
from flask_restplus import Api, Resource, fields
from const import *
from flask_jwt_extended import JWTManager, jwt_required, jwt_refresh_token_required, create_access_token, set_access_cookies, create_refresh_token, get_jwt_identity
import redis
import os
from model.waybill import Waybill, Person, Address
import hashlib
from flask_cors import CORS, cross_origin

app = Flask(__name__, static_url_path="")
api_app = Api(app = app, version = "0.1", title = "PAX app API", description = "REST-full API for PAXapp")

waybill_namespace = api_app.namespace("waybill", description = "Waybill API")

db = redis.Redis(host="redis-db", port=6379, decode_responses=True)
log = logging.create_logger(app)
cors = CORS(app, supports_credentials=True)

app.config["JWT_COOKIE_CSRF_PROTECT"] = False
app.config["JWT_SECRET_KEY"] = os.environ.get(SECRET_KEY)
app.config["JWT_TOKEN_LOCATION"] = ['cookies']
app.config["IMAGE_UPLOADS"] = CUSTOM_IMG_PATH
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = TOKEN_EXPIRES_IN_SECONDS
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = TOKEN_EXPIRES_IN_SECONDS
app.config["JWT_TOKEN_LOCATION"] = JWT_TOKEN_LOCATION
app.config['CORS_SUPPORTS_CREDENTIALS'] = True

jwt = JWTManager(app)

@app.after_request
def after_request(response):
    #refresh()
    #response.headers.add('Access-Control-Allow-Credentials', 'true')
    #response.headers.add('Access-Control-Allow-Origin', 'https://localhost:8080')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, DELETE')
    return response

@waybill_namespace.route("/<string:waybill_hash>")
class WaybillId(Resource):

    def __init__(self, args):
        super().__init__(args)

    @cross_origin(origins=["https://localhost:8080"])
    @api_app.doc(responses = {200: "OK", 404: 'File not found', 400: 'Bad request.'})
    @jwt_required
    def get(self, waybill_hash):
        log.debug("Received waybill download request [waybill_hash: {}].".format(waybill_hash))
        filename = waybill_hash + '.pdf'

        filepath = db.hget(waybill_hash, PATH_AND_FILENAME)

        if filepath is not None:
            filepath = db.hget(waybill_hash, PATH_AND_FILENAME)
            if os.path.isfile(filepath):
                try:
                    log.debug(filepath)
                    return send_file(filepath, attachment_filename=filename)
                except Exception as e:
                    log.error(e)
                    return {'message': 'Nie udało się otworzyć pliku.'}, 400
            else:
                return {'message': 'Taki plik nie istnieje.'}, 404
        else:
            return {'message': 'Brak pliku w bazie danych.'}, 404

        return filename, 200

    @cross_origin(origins=["https://localhost:8080"])
    @api_app.doc(responses = {200: "OK", 404: 'File not found', 400: 'Bad request.'})
    @jwt_required
    def delete(self, waybill_hash):
        pack_id = waybill_hash
        log.debug('funkcja delete')
        user = get_jwt_identity()
        log.debug('user: ' + user)
        log.debug("Receive request to delete a waybill.")
        if db.hexists(pack_id, 'status'):
            status = db.hget(pack_id, 'status')
            if status == NEW:
                log.debug('Paczka ma poprawny status.')
                fullname = db.hget(pack_id, PATH_AND_FILENAME)
                img_path = CUSTOM_IMG_PATH + db.hget(IMAGES_PATHS, pack_id)
                try:
                    log.debug('file: ' + fullname)
                    log.debug('image: ' + img_path)
                    if os.path.exists(fullname):
                        log.debug('plik pdf istnieje')
                        os.remove(fullname)
                        if os.path.exists(img_path):
                            log.debug('obraz istnieje')
                            os.remove(img_path)
                        else:
                            return {'msg' : 'Nie można usunąć obrazu.', 'status':400}, 400
                    else:
                        return {'msg' : 'Nie można usunąć pliku pdf.', 'status':400}, 400
                    try:
                        if db.hexists(user + '-'+ PACKNAMES, fullname) and db.hexists(pack_id, PATH_AND_FILENAME) and db.hexists(pack_id, 'status') and db.hexists(IMAGES_PATHS, pack_id):
                            db.hdel(user + '-'+ PACKNAMES, fullname)
                            db.hdel(pack_id, PATH_AND_FILENAME)
                            db.hdel(pack_id, 'status')
                            db.hdel(IMAGES_PATHS, pack_id)
                            
                        else:
                            return {'msg' : 'Czegoś nie ma w bazie danych.', 'status':404}, 404
                        
                    except:
                        log.debug('Nie można usunąć plików z bazy danych.')
                        return {'msg' : 'Nie można usunąć plików z bazy danych.', 'status':400}, 400
                    
                except:
                    log.debug('Nie można usunąć plików.')
                    return {'msg' : 'Nie można usunąć plików.', 'status':400}, 400
                log.debug('usunięto')
                return {'msg' : 'Poprawnie usunięto paczkę.', 'status':200}, 200
            else:
                return { 'msg': 'Nie można usunąć paczki, której status został już zmieniony.', 'status':400}, 400
        else:
            return {'msg' : 'Nie ma takiej paczki w bazie danych.', 'status':404}, 404


@waybill_namespace.route("/waybill")
class WaybillCreator(Resource):

    def __init__(self, args):
        super().__init__(args)

    new_waybill_model = api_app.model('waybill model',
        {
            'product_name': fields.String(required = True, description = "product name", help = "product name cannot be null"),

            'sender_name': fields.String(required = True, description = "Sender's name", help = "name cannot be null"),
            'sender_surname': fields.String(required = True, description = "Sender's surname", help = "surname cannot be null"),
            'sender_phone': fields.String(required = True, description = "Sender's phone", help = "phone cannot be null"),
            'sender_country': fields.String(required = True, description = "Sender's country", help = "country cannot be null"),
            'sender_postal_code': fields.String(required = True, description = "Sender's postal code", help = "postal code cannot be null"),
            'sender_city': fields.String(required = True, description = "Sender's city", help = "city cannot be null"),
            'sender_street': fields.String(required = True, description = "Sender's street", help = "street cannot be null"),
            'sender_house_nr': fields.String(required = True, description = "Sender's house number", help = "house_nr cannot be null"),

            'recipient_name': fields.String(required = True, description = "Recipient's name", help = "name cannot be null"),
            'recipient_surname': fields.String(required = True, description = "Recipient's surname", help = "surname cannot be null"),
            'recipient_phone': fields.String(required = True, description = "Recipient's phone", help = "phone cannot be null"),
            'recipient_country': fields.String(required = True, description = "Recipient's country", help = "country cannot be null"),
            'recipient_postal_code': fields.String(required = True, description = "Recipient's postal code", help = "postal code cannot be null"),
            'recipient_city': fields.String(required = True, description = "Recipient's city", help = "city cannot be null"),
            'recipient_street': fields.String(required = True, description = "Recipient's street", help = "street cannot be null"),
            'recipient_house_nr': fields.String(required = True, description = "Recipient's house number", help = "house_nr cannot be null")
        
        })

    @api_app.doc(responses = {200: "Waybill was created.", 400: "Create waybill failed."})
    @api_app.expect(new_waybill_model)
    @cross_origin(origins=["https://localhost:8080"])
    @jwt_required
    def post(self):
        user = get_jwt_identity()
        log.debug(user)
        log.debug("Receive request to create a waybill.")
        form = request.form
        log.debug("Request form: {}.".format(form))

        waybill = self.to_waybill(request)
        try:
            self.save_waybill(user, waybill)
            response = make_response({'message': 'Pomyślnie wygenerowano list przewozowy.', 'status':200}, 200)
            return response
        except:
            log.debug('coś poszło nie tak przy zapisywaniu')
            response = make_response({'message': "Nie udało się zapisać listu przewozowego w bazie.", 'status':400}, 400)
            return response

    def to_waybill(self, request):
        product_name = request.form.get(PRODUCT_NAME_FIELD_ID)
        sender = self.to_sender(request.form)
        recipient = self.to_recipient(request.form)
        image = request.files[PACK_IMAGE_FIELD_NAME]
        try:
            image.save(os.path.join(app.config["IMAGE_UPLOADS"], image.filename))
        except:
            log.debug('File saving failed.')

        return Waybill(product_name, sender, recipient, image.filename)


    def to_sender(self, form):
        name = form.get(SENDER_NAME_FIELD_ID)
        surname = form.get(SENDER_SURNAME_FIELD_ID)
        phone = form.get(SENDER_PHONE_FIELD_ID)
        address = self.to_sender_foo_address(form)

        return Person(name, surname, phone, address)


    def to_recipient(self, form):
        name = form.get(RECIPIENT_NAME_FIELD_ID)
        surname = form.get(RECIPIENT_SURNAME_FIELD_ID)
        phone = form.get(RECIPIENT_PHONE_FIELD_ID)
        address = self.to_recipient_foo_address(form)

        return Person(name, surname, phone, address)


    def to_sender_foo_address(self, form):
        sender_postal_code = form.get(SENDER_POSTAL_CODE_FIELD_ID)
        sender_city = form.get(SENDER_CITY_FIELD_ID)
        sender_house_nr = form.get(SENDER_HOUSE_NR_FIELD_ID)
        sender_street = form.get(SENDER_STREET_FIELD_ID)
        sender_country = form.get(SENDER_COUNTRY_FIELD_ID)
        addr = Address(sender_street, sender_house_nr, sender_city, sender_postal_code, sender_country)
        return addr


    def to_recipient_foo_address(self, form):
        recipient_postal_code = form.get(RECIPIENT_POSTAL_CODE_FIELD_ID)
        recipient_city = form.get(RECIPIENT_CITY_FIELD_ID)
        recipient_house_nr = form.get(RECIPIENT_HOUSE_NR_FIELD_ID)
        recipient_street = form.get(RECIPIENT_STREET_FIELD_ID)
        recipient_country = form.get(RECIPIENT_COUNTRY_FIELD_ID)
        addr = Address(recipient_street, recipient_house_nr, recipient_city, recipient_postal_code, recipient_country)
        return addr


    def save_waybill(self, user, waybill):
        fullname = waybill.generate_and_save(log,FILES_PATH)
        filename = os.path.basename(fullname)
        pack_id = filename.split('.')[0]

        db.hset(pack_id, PATH_AND_FILENAME, fullname)
        db.hset(pack_id, 'status', NEW)

        db.hset(IMAGES_PATHS, pack_id , waybill.get_img_path())
        db.hset(user + '-'+ PACKNAMES, fullname, pack_id)

        log.debug("Saved waybill [fullname: {}, pack_id: {}].".format(fullname, pack_id))


@app.errorhandler(401)
def page_unauthorized(error):
    return render_template("errors/401.html", error=error)