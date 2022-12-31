from abc import ABCMeta, abstractmethod
from utility import Config

class Image:
    def __init__(self, filepath, image_type=None):
        if image_type is None:
            image_type = filepath.split('.')[-1]
        self.image_type = image_type
        self.filepath = filepath  # refers to location of the image in storage.
        self.filedata = None

    def load(self, data: bytes):
        self.filedata = data

    def __repr__(self):
        return f'<Image({self.filepath})>'

    def toJSON(self):
        return {"path": self.filepath}


class Storage(metaclass=ABCMeta):
    @abstractmethod
    def __init__(self):
        """
        This method should connect and ingest currently stored cards
        """
        self.config = getattr(Config(), self.__class__.__name__)
        self.cache = {}

    @abstractmethod
    def create_card(self, card):
        pass

    @abstractmethod
    def get_card(self, card_id, revision=None):
        pass

    @abstractmethod
    def update_card(self, card):
        pass

    @abstractmethod
    def delete_card(self, card):
        pass

    def list_cards(self):
        return list(self.cache.keys())

    @abstractmethod
    def get_by_tags(self, *args):
        pass

    @abstractmethod
    def get_by_search(self, **search):
        pass

    @abstractmethod
    def all_tags(self):
        pass

    @abstractmethod
    def load_image(self, img: Image) -> bytes:
        pass

    def card_history(self, card):
        raise NotImplementedError(f'This interface does not support object history')
