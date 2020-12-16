GET = "GET"
POST = "POST"
SECRET_KEY = "LOGIN_JWT_SECRET"
JWT_TOKEN_LOCATION = ['cookies']
TOKEN_EXPIRES_IN_SECONDS = 300
PACZKOMAT_TOKEN_EXPIRES_IN_SECONDS = 60
SESSION_ID = "session"
COURIER_SESSION_ID = "courier_session"
FILES_PATH = "waybill_files/"
CUSTOM_IMG_PATH = "static/images/packs_images/"
PATH_AND_FILENAME = "path_and_filename"
PACKNAMES = "packnames"
IMAGES_PATHS = "images_paths"

NAME_FIELD_ID = "name"
SURNAME_FIELD_ID = "surname"
BDATE_FIELD_ID = "bdate"
PESEL_FIELD_ID = "pesel"
COUNTRY_FIELD_ID = "country"
POSTAL_CODE_FIELD_ID = "postal_code"
CITY_FIELD_ID = "city"
STREET_FIELD_ID = "street"
HOUSE_NR_FIELD_ID = "house_nr"
LOGIN_FIELD_ID = "login"
PASSWD_FIELD_ID = "password"
REPEAT_PASSWD_FIELD_ID = "second_password"

REGISTER_FIELDS =  [NAME_FIELD_ID, SURNAME_FIELD_ID, BDATE_FIELD_ID, PESEL_FIELD_ID, 
                    COUNTRY_FIELD_ID, POSTAL_CODE_FIELD_ID, CITY_FIELD_ID, STREET_FIELD_ID, HOUSE_NR_FIELD_ID, 
                    LOGIN_FIELD_ID, PASSWD_FIELD_ID, REPEAT_PASSWD_FIELD_ID]
LOGIN_FIELDS = [LOGIN_FIELD_ID, PASSWD_FIELD_ID]

PRODUCT_NAME_FIELD_ID = "product_name"

SENDER_NAME_FIELD_ID = "sender_name"
SENDER_SURNAME_FIELD_ID = "sender_surname"
SENDER_PHONE_FIELD_ID = "sender_phone"
SENDER_COUNTRY_FIELD_ID = "sender_country"
SENDER_POSTAL_CODE_FIELD_ID = "sender_postal_code"
SENDER_CITY_FIELD_ID = "sender_city"
SENDER_STREET_FIELD_ID = "sender_street"
SENDER_HOUSE_NR_FIELD_ID = "sender_house_nr"

SENDER_FIELDS =  [SENDER_NAME_FIELD_ID, SENDER_SURNAME_FIELD_ID, SENDER_PHONE_FIELD_ID, SENDER_COUNTRY_FIELD_ID, SENDER_POSTAL_CODE_FIELD_ID, SENDER_CITY_FIELD_ID, SENDER_STREET_FIELD_ID, SENDER_HOUSE_NR_FIELD_ID]

RECIPIENT_NAME_FIELD_ID = "recipient_name"
RECIPIENT_SURNAME_FIELD_ID = "recipient_surname"
RECIPIENT_PHONE_FIELD_ID = "recipient_phone"
RECIPIENT_COUNTRY_FIELD_ID = "recipient_country"
RECIPIENT_POSTAL_CODE_FIELD_ID = "recipient_postal_code"
RECIPIENT_CITY_FIELD_ID = "recipient_city"
RECIPIENT_STREET_FIELD_ID = "recipient_street"
RECIPIENT_HOUSE_NR_FIELD_ID = "recipient_house_nr"

PACK_IMAGE_FIELD_NAME = "pack_image"

PACK_ID_FIELD_ID = "pack_id"
PACZKOMAT_FIELD_ID = "paczkomat_id"

#statusy
NEW = 'new'
WAITING = 'waiting'
PICKED_UP = 'picked_up'
HANDED_OVER = 'handed_over'