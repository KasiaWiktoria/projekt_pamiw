import uuid
import json
from fpdf import FPDF


class Waybill:

    def __init__(self, product_name: str, sender, recipient, img):
        self.__product_name = product_name
        self.__sender = sender
        self.__recipient = recipient
        self.__image_path = "static/images/" + img

    def generate_and_save(self, path="./"):
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=10)
        self.__add_table_to_pdf(pdf)

        filename = self.__generate_filename(path)
        pdf.output(filename)

        return filename

    def __add_table_to_pdf(self, pdf):
        n_cols = 2
        col_width = (pdf.w - pdf.l_margin - pdf.r_margin) / n_cols
        font_size = pdf.font_size
        n_lines = 5
        col_height = n_lines * font_size

        pdf.cell(col_width, col_height, "Sender", border=1)
        pdf.multi_cell(col_width, font_size, txt=self.__sender.str_full(), border=1)
        pdf.ln(0)
        pdf.cell(col_width, col_height, "Recipient", border=1)
        pdf.multi_cell(col_width, font_size, txt=self.__recipient.str_full(), border=1)
        pdf.ln(0)
        pdf.cell(col_width, 4*col_height, "Image of the pack", border=1)
        try:
            pdf.cell(col_width, 4*col_height, "", border=1)
            pdf.image(self.__image_path, x = pdf.l_margin + col_width, y = pdf.t_margin + 2*col_height, w=col_width, h=4*col_height)
        except Exception:
            pdf.cell(col_width, 4*col_height, "Nie udało się pobrać zdjęcia", border=1)

    def __generate_filename(self, path):
        unique_filename = uuid.uuid4().hex

        return "{}{}.pdf".format(path, unique_filename)

    @classmethod
    def from_json(cls, data):
        return cls(**data)

class Person:

    def __init__(self, name: str, surname: str, phone, address):
        self.__name = name
        self.__surname = surname
        self.__phone = phone
        self.__address = address

    def get_name(self):
        return self.__name

    def get_surname(self):
        return self.__surname

    def get_phone(self):
        return self.__phone

    def get_fullname(self):
        return "{} {}".format(self.__name, self.__surname)

    def get_address(self):
        return self.__address

    def str_full(self):
        return "{}\n \n{}".format(self.get_fullname(), self.__address.str_full())

    @classmethod
    def from_json(cls, data):
        return cls(**data)
    

class Address:

    def __init__(self, street: str, house_nr: str, city: str, postal_code: str, country: str):
        self.__house_nr = house_nr
        self.__street = street
        self.__city = city
        self.__postal_code = postal_code
        self.__country = country

    def get_house_nr(self):
        return self.__house_nr

    def get_street(self):
        return self.__street

    def get_city(self):
        return self.__city

    def get_country(self):
        return self.__country

    def get_postal_code(self):
        return self.__postal_code

    def str_full(self):
        result = ""
        result += "{} {}".format(self.__street, self.__house_nr)
        result += "\n{} {}".format(self.__postal_code, self.__city)
        result += "\n{}".format(self.__country)

        return result

    @classmethod
    def from_json(cls, data):
        return cls(**data)
