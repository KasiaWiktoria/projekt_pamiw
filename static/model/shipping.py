import uuid

class Shipping:

    def __init__(self, product_name, sender, recipient):
        self.__id = uuid.uuid1()
        self.__product_name = product_name
        self.__sender = sender
        self.__recipient = recipient

    def get_title(self):
        return "{}_{}".format(self.__id, self.__product_name)

    def get_sender_name(self):
        return self.__sender.get_name()

    def get_sender_addr(self):
        return self.__sender.get__addr()

    def get_recipient_name(self):
        return self.__recipient.get_name()

    def get_recipient_addr(self):
        return self.__recipient.get__addr()


class Person:

    def __init__(self, name, surname, phone, postcode, city, street, house_nr):
        self.__name = name
        self.__surname = surname
        self.__phone = phone
        self.__postcode = postcode
        self.__city = city
        self.__street = street
        self.__house_nr = house_nr

    def get_name(self):
        return "{} {}".format(self.__name, self.__surname)

    def get__addr(self):
        return "ul. {} {}, {} {}".format(self.__street, self.__house_nr, self.__city, self.__postcode)

    