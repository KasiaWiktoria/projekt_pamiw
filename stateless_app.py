from flask import Flask, redirect,request, render_template, jsonify, send_file, url_for, make_response, abort
import logging
from const import *
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
import redis
import os
from model.waybill import *
import hashlib

app = Flask(__name__, static_url_path="")
db = redis.Redis(host="redis-db", port=6379, decode_responses=True)
log = app.logger

app.config["JWT_SECRET_KEY"] = os.environ.get(SECRET_KEY)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = TOKEN_EXPIRES_IN_SECONDS

jwt = JWTManager(app)


def setup():
    log.setLevel(logging.DEBUG)

@app.route("/")
def index():
    return render_template("index-files.html")

@app.route("/user/<string:username>", methods=[GET,POST])
def check_user(username):
    all_users = db.hvals("users")
    if username in all_users:
        response = make_response(jsonify({"message":"User is in the database.", "status" : 200}),200)
        return response
    else:
        response = make_response(jsonify({"message": "There is no user with this username.", "status" : 404}),404)
        return response



@app.route("/register", methods=[POST])
def register():
    if request.method == POST:
        username = request.form[LOGIN_FIELD_ID]
        password = request.form[PASSWD_FIELD_ID]
        hashed_password = hashlib.sha512(password).hexdigest()
        name = request.form[NAME_FIELD_ID]
        surname = request.form[SURNAME_FIELD_ID]
        bdate = request.form[BDATE_FIELD_ID]
        pesel = request.form[PESEL_FIELD_ID]
        country = request.form[COUNTRY_FIELD_ID]
        postal_code = request.form[POSTAL_CODE_FIELD_ID]
        city = request.form[CITY_FIELD_ID]
        street = request.form[STREET_FIELD_ID]
        house_nr = request.form[HOUSE_NR_FIELD_ID] 


        user = {"hashed_password": hashed_password, NAME_FIELD_ID: name, SURNAME_FIELD_ID: surname, BDATE_FIELD_ID: bdate, PESEL_FIELD_ID: pesel, COUNTRY_FIELD_ID :country, POSTAL_CODE_FIELD_ID: postal_code, CITY_FIELD_ID: city, STREET_FIELD_ID: street, HOUSE_NR_FIELD_ID: house_nr}
        db.hmset("users", {username: user})
        response = make_response(jsonify({"registration_status": "OK"}),201)

        return response
    else:
        abort(400) 


@app.route("/login", methods=[GET, POST])
def login():
    if request.method == POST:
        username = request.form["login"]
        password = request.form["password"]
        passwd_hash = hashlib.sha512(password).hexdigest()
        if  passwd_hash == db.hmget("users", username)['hashed_password']:
            username = request.form["login"].encode("utf-8")
            name_hash = hashlib.sha512(username).hexdigest()
            db.set(SESSION_ID, name_hash)
            response = make_response(render_template("/login/waybills-list.html"))
            response.set_cookie(SESSION_ID, name_hash,
                                max_age=300, secure=True, httponly=True)
            return response
        else:
            return render_template("passwd_err.html")
    else:
        return render_template("login.html")

@app.route("/logout", methods=[POST])
def logout():
    name_hash = request.cookies.get(SESSION_ID)
    response = make_response(render_template("index.html"))
    response.set_cookie(SESSION_ID, name_hash,
                            max_age=0, secure=True, httponly=True)
    return response
'''
def login():
    username = request.form["username"]
    access_token = create_access_token(identity=username)
    return {"access_token": access_token}
'''

@app.route("/secret-files", methods=[GET])
@jwt_required
def show_waybills():
    files = db.hvals(FILENAMES)
    return render_template("index.html", my_files=files)


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


@app.route("/waybill", methods=[POST])
#@jwt_required
def add_waybill():
    log.debug("Receive request to create a waybill.")
    form = request.form
    log.debug("Request form: {}.".format(form))

    waybill = to_waybill(form)
    save_waybill(waybill)

    return redirect(url_for("show_waybills"))


def to_waybill(form):
    product_name = form.get(PRODUCT_NAME_FIELD_ID)
    sender = to_sender(form)
    recipient = to_recipient(form)

    return Waybill(product_name, sender, recipient)


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


def save_waybill(waybill):
    fullname = waybill.generate_and_save(FILES_PATH)
    filename = os.path.basename(fullname)

    db.hset(filename, PATH_AND_FILENAME, fullname)
    db.hset(FILENAMES, fullname, filename)

    log.debug("Saved waybill [fullname: {}, filename: {}].".format(fullname, filename))
