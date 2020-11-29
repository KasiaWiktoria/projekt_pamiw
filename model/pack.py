class Pack:

    def __init__(self, file, img_path):
        self.__file = file
        self.__image_path = img_path

    def get_file(self):
        return self.__file

    def get_img_path(self):
        return self.__image_path
