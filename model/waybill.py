import uuid
import json
from fpdf import FPDF


class Waybill:

    def __init__(self, product_name: str, sender, recipient):
        self.__product_name = product_name
        self.__sender = sender
        self.__recipient = recipient

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
        col_width = (pdf.w - pdf.l_margin - pdf.r_margin) / n_cols / 2
        font_size = pdf.font_size
        n_lines = 6

        pdf.cell(col_width, n_lines * font_size, "Sender", border=1)
        pdf.multi_cell(col_width, font_size, txt=self.__sender.str_full(), border=1)
        pdf.ln(0)
        pdf.cell(col_width, n_lines * font_size, "Recipient", border=1)
        pdf.multi_cell(col_width, font_size, txt=self.__recipient.str_full(), border=1)

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
        return "{}\n{}".format(self.get_fullname(), self.__address.str_full())

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
        for field_value in self.__dict__.values():
            result += "\n{}".format(field_value)

        return result

    @classmethod
    def from_json(cls, data):
        return cls(**data)
