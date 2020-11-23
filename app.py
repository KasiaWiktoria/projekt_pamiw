from flask import Flask, render_template, url_for, redirect, send_file
from flask import request, jsonify
from flask import logging
from const import *
from static.model.shipping import *
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
import redis
import os

app = Flask(__name__, static_url_path="")
log = logging.create_logger(app)
db = redis.Redis(host="redis_db", port=6379, decode_responses=True)

app.config["JWT_SECRET_KEY"] = os.environ.get(SECRET_KEY)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = TOKEN_EXPIRES_IN_SECONDS

jwt = JWTManager(app)

GET = "GET"
POST = "POST"

shipments = []
'''
@app.before_first_request
def setup():
    log.setLevel(logging.DEBUG)
'''
@app.route("/", methods=[GET])
def index():
    return render_template("index.html")


@app.route("/login", methods=[POST])
def login():
    username = request.form["username"]
    access_token = create_access_token(identity=username)
    return {"access_token": access_token}



@app.route("/login/shipments-list", methods=[GET])
#@jwt_required
def list(name):
    return render_template('shipments-list.html', my_shipments = shipments)

@app.route("/<name>/", methods=[GET])
def set(name):
    return render_template(name + '.html', my_shipments = shipments)

@app.route("/login/shipment", methods=[POST])
def add_shipment():
    log.debug("Receive request for shipment.")
    form = request.form
    log.debug("Request form: {}".format(form))

    shipment = to_shipment(form)
    shipments.append(shipment)

    return redirect(url_for("/shipments-list"))

def to_shipment(request):
    product_name = request.get("product_name")
    sender = to_sender(request)
    recipient = to_recipient(request)

    return Shipping(product_name, sender, recipient)


def to_sender(request):
    sender_name = request.get("sender_name")
    sender_surname = request.get("sender_surname")
    sender_phone = request.get("sender_phone")
    sender_postcode = request.get("sender_postcode")
    sender_city = request.get("sender_city")
    sender_street = request.get("sender_street")
    sender_house_nr = request.get("sender_house_nr")

    return Person(sender_name, sender_surname, sender_phone, sender_postcode, sender_city, sender_street, sender_house_nr)


def to_recipient(request):
    recipient_name = request.get("recipient_name")
    recipient_surname = request.get("recipient_surname")
    recipient_phone = request.get("recipient_phone")
    recipient_postcode = request.get("recipient_postcode")
    recipient_city = request.get("recipient_city")
    recipient_street = request.get("recipient_street")
    recipient_house_nr = request.get("recipient_house_nr")

    return Person(recipient_name, recipient_surname, recipient_phone, recipient_postcode, recipient_city, recipient_street, recipient_house_nr)

@app.route("/download-files/", methods=[GET])
@jwt_required
def download_file():
    try:
        full_filename = os.path.join(FILES_PATH, "sdm.pdf")
        return send_file(full_filename)
    except Exception as e:
        log.error("File not found :(")
        log.error(str(e))
        return {"message": "File not found... :("}, 404


@app.route("/upload-file", methods=[POST])
def upload_file():
    maybe_file = request.files["shipment_img"]
    save_file(maybe_file)
    return {"message": "Maybe saved the file."}


def save_file(file_to_save):
    if len(file_to_save.filename) > 0:
        path_to_file = os.path.join(FILES_PATH, file_to_save.filename)
        file_to_save.save(path_to_file)
    else:
        log.warn("Empty content of file!")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
