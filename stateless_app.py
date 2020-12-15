from flask import Flask, redirect,request, render_template, jsonify, send_file, url_for, make_response, abort
from flask import logging
from const import *
from flask_jwt_extended import JWTManager, jwt_required, jwt_refresh_token_required, create_access_token, set_access_cookies, create_refresh_token, get_jwt_identity
import redis
import os
from model.waybill import *
import hashlib
from flask_cors import CORS, cross_origin

app = Flask(__name__, static_url_path="")
db = redis.Redis(host="redis-db", port=6379, decode_responses=True)
log = logging.create_logger(app)
cors = CORS(app)

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
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@cross_origin(origins=["https://localhost:8080/"], supports_credentials=True)
@app.route("/waybill/<string:waybill_hash>", methods=[GET])
@jwt_required
def download_waybill(waybill_hash):
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
        else:
            return {'message': 'Taki plik nie istnieje.'}
            '''
            filepath = create_file(filename)
            try:
                return send_file(filepath, attachment_filename=filename)
            except Exception as e:
                log.error(e)
            '''
    else:
        return {'message': 'Taki plik nie istnieje.'}
        '''
        filepath = create_file(filepath)
        try:
            return send_file(filepath, attachment_filename=filename)
        except Exception as e:
            log.error(e)
        '''

    return filename, 200

def create_file(filename):
    waybill = to_waybill(filename)
    filepath = waybill.generate_and_save(FILES_PATH, IMAGES_PATHS)
    db.hset(filename, PATH_AND_FILENAME, filepath)
    return filepath

@cross_origin(origins=["https://localhost:8080/"], supports_credentials=True)
@app.route("/waybill", methods=[GET, POST])
@jwt_required
def add_waybill():
    user = get_jwt_identity()
    log.debug(user)
    log.debug("Receive request to create a waybill.")
    form = request.form
    log.debug("Request form: {}.".format(form))

    waybill = to_waybill(request)
    try:
        save_waybill(user, waybill)
        response = make_response({'message': 'Waybill was created.'}, 200)
        return response
    except:
        response = make_response("Create waybill failed.", 400)
        return response

@cross_origin(origins=["https://localhost:8080/"], supports_credentials=True)
@app.route("/waybills-list", methods=[GET])
@jwt_required
def list():
    user = get_jwt_identity()
    waybills = db.hvals(user + '-' + PACKNAMES)
    waybills_images = db.hvals(user + '-' + IMAGES_PATHS)
    log.debug(waybills)
    log.debug(waybills_images)
    return zip(waybills,waybills_images)

@cross_origin(origins=["https://localhost:8080/"], supports_credentials=True)
@app.route('/refresh', methods=['POST'])
@jwt_refresh_token_required
def refresh():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)

    resp = jsonify({'refresh': True})
    set_access_cookies(resp, access_token)
    return resp, 200

def to_waybill(request):
    product_name = request.form.get(PRODUCT_NAME_FIELD_ID)
    sender = to_sender(request.form)
    recipient = to_recipient(request.form)
    image = request.files[PACK_IMAGE_FIELD_NAME]
    try:
        image.save(os.path.join(app.config["IMAGE_UPLOADS"], image.filename))
    except:
        log.debug('File saving failed.')

    return Waybill(product_name, sender, recipient, image.filename)


def to_sender(form):
    name = form.get(SENDER_NAME_FIELD_ID)
    surname = form.get(SENDER_SURNAME_FIELD_ID)
    phone = form.get(SENDER_PHONE_FIELD_ID)
    address = to_sender_foo_address(form)

    return Person(name, surname, phone, address)


def to_recipient(form):
    name = form.get(RECIPIENT_NAME_FIELD_ID)
    surname = form.get(RECIPIENT_SURNAME_FIELD_ID)
    phone = form.get(RECIPIENT_PHONE_FIELD_ID)
    address = to_recipient_foo_address(form)

    return Person(name, surname, phone, address)


def to_sender_foo_address(form):
    sender_postal_code = form.get(SENDER_POSTAL_CODE_FIELD_ID)
    sender_city = form.get(SENDER_CITY_FIELD_ID)
    sender_house_nr = form.get(SENDER_HOUSE_NR_FIELD_ID)
    sender_street = form.get(SENDER_STREET_FIELD_ID)
    sender_country = form.get(SENDER_COUNTRY_FIELD_ID)
    addr = Address(sender_street, sender_house_nr, sender_city, sender_postal_code, sender_country)
    return addr


def to_recipient_foo_address(form):
    recipient_postal_code = form.get(RECIPIENT_POSTAL_CODE_FIELD_ID)
    recipient_city = form.get(RECIPIENT_CITY_FIELD_ID)
    recipient_house_nr = form.get(RECIPIENT_HOUSE_NR_FIELD_ID)
    recipient_street = form.get(RECIPIENT_STREET_FIELD_ID)
    recipient_country = form.get(RECIPIENT_COUNTRY_FIELD_ID)
    addr = Address(recipient_street, recipient_house_nr, recipient_city, recipient_postal_code, recipient_country)
    return addr


def save_waybill(user, waybill):
    fullname = waybill.generate_and_save(log,FILES_PATH)
    filename = os.path.basename(fullname)
    pack_id = filename.split('.')[0]

    db.hset(pack_id, PATH_AND_FILENAME, fullname)
    db.hset(pack_id, 'status', NEW)
    db.hset(IMAGES_PATHS, pack_id , waybill.get_img_path())
    db.hset(user + '-'+ PACKNAMES, fullname, pack_id)

    log.debug("Saved waybill [fullname: {}, pack_id: {}].".format(fullname, pack_id))




@cross_origin(origins=["https://localhost:8080/"], supports_credentials=True)
@app.route("/delete/<string:pack_id>", methods=[GET])
@jwt_required
def delete_pack(pack_id):
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
                        return {'message' : 'Nie można usunąć obrazu.'}, 501
                else:
                    return {'message' : 'Nie można usunąć pliku pdf.'}, 501
                try:
                    if db.hexists(user + '-'+ PACKNAMES, fullname) and db.hexists(pack_id, PATH_AND_FILENAME) and db.hexists(pack_id, 'status') and db.hexists(IMAGES_PATHS, pack_id):
                        db.hdel(user + '-'+ PACKNAMES, fullname)
                        log.debug('1')
                        db.hdel(pack_id, PATH_AND_FILENAME)
                        log.debug('2')
                        db.hdel(pack_id, 'status')
                        log.debug('3')
                        db.hdel(IMAGES_PATHS, pack_id)
                    else:
                        return {'message' : 'Czegoś nie ma w bazie danych.'}, 503
                    
                except:
                    log.debug('Nie można usunąć plików z bazy danych.')
                    return {'message' : 'Nie można usunąć plików z bazy danych.'}, 502
                
            except:
                log.debug('Nie można usunąć plików.')
                return {'message' : 'Nie można usunąć plików.'}, 501

            return {'message' : 'Poprawnie usunięto paczkę.'}, 200
        else:
            return { 'message': 'Nie można usunąć paczki, której status został już zmieniony.'}, 400
    else:
        return {'message' : 'Nie ma takiej paczki w bazie danych.'}, 404




@cross_origin(origins=["https://localhost:8080/"], supports_credentials=True)
@app.route("/test", methods=[GET])
@jwt_required
def test():
    user = get_jwt_identity()
    return {'user' : user}, 200


@app.errorhandler(401)
def page_unauthorized(error):
    return render_template("errors/401.html", error=error)