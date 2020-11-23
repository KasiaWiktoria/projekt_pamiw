from flask import Flask, render_template, url_for
from flask import render_template, jsonify
import logging
from model.shipping import *

app = Flask(__name__, static_url_path="")
log = app.logger

GET = "GET"
POST = "POST"

shipments = []

@app.before_first_request
def setup():
    log.setLevel(logging.DEBUG)


@app.route("/", methods=[GET])
def index():
    return render_template("index.html")

@app.route("/<name>", methods=[GET])
def set(name):
    return render_template(name + '.html')

@app.route("/shipment", methods=[POST])
def add_shipment():
    log.debug("Receive request for shipment.")
    form = request.form
    log.debug("Request form: {}".format(form))

    shipment = to_shipment(form)
    shipments.append(shipment)

    return redirect(url_for("/"))

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



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
