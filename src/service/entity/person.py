import json

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

class Address:

    def __init__(self, street: str, city: str, postal_code: str, country: str):
        self.__street = street
        self.__city = city
        self.__postal_code = postal_code
        self.__country = country

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