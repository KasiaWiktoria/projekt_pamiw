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
