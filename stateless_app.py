from flask import Flask, redirect,request, render_template, jsonify, send_file, url_for, make_response, abort
from flask import logging
from const import *
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, set_access_cookies, create_refresh_token
import redis
import os
from model.waybill import *
import hashlib
from flask_cors import CORS, cross_origin

app = Flask(__name__, static_url_path="")
db = redis.Redis(host="redis-db", port=6379, decode_responses=True)
log = logging.create_logger(app)
cors = CORS(app)


app.config["JWT_SECRET_KEY"] = os.environ.get(SECRET_KEY)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = TOKEN_EXPIRES_IN_SECONDS
app.config["JWT_TOKEN_LOCATION"] = ['cookies']
app.config["IMAGE_UPLOADS"] = CUSTOM_IMG_PATH


jwt = JWTManager(app)

@cross_origin(origins=["https://localhost:8080/"], supports_creditentials=True)
@app.route("/waybill/<string:waybill_hash>", methods=[GET])
@jwt_required
def download_waybill(waybill_hash):
    log.debug("Received waybill download request [waybill_hash: {}].".format(waybill_hash))
    filename = waybill_hash 

    filepath = db.hget(filename, PATH_AND_FILENAME)

    if filepath is not None:
        try:
            return send_file(filepath, attachment_filename=filename)
        except Exception as e:
            log.error(e)

    return filename, 200

@cross_origin(origins=["https://localhost:8080/"], supports_creditentials=True)
@app.route("/<string:user>/waybill", methods=[POST])
@jwt_required
def add_waybill(user):
    log.debug("Receive request to create a waybill.")
    form = request.form
    log.debug("Request form: {}.".format(form))

    waybill = to_waybill(request)
    '''
    try:
        save_waybill(user, waybill)
        response = make_response(redirect(f'https://localhost:8080/waybills-list'))
    except:
        response = make_response("Create waybill failed.", 400)
    '''
    save_waybill(user, waybill)
    response = make_response(redirect(f'https://localhost:8080/waybills-list'))
    return response

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

    db.hset(filename, PATH_AND_FILENAME, fullname)
    db.hset(user + '-'+ IMAGES_PATHS, filename , waybill.get_img_path())
    db.hset(user + '-'+ FILENAMES, fullname, filename)

    log.debug("Saved waybill [fullname: {}, filename: {}].".format(fullname, filename))



@app.errorhandler(401)
def page_unauthorized(error):
    return render_template("errors/401.html", error=error)
