from utility.card import Card
from storage import Image
from copy import deepcopy

"""
This is the main Card class data module. It should handle the data class
main functionality and all the necessary migrations (load-unload-transform).

Main abstraction, links, build trees, etc. Adapters from here can be used by controller and storage separately.
"""
from cardholder.exceptions import *
from cardholder.parser import CardParser

class CardController:
    """
    Main class to collate cards and manipulate them. Works as a decoupling mechanism between Storage-Card combo
    and any render or manipulation scripts.
    """
    def __init__(self, storage, storage_parse_mode='Markdown'):  # from storage
        """
        :param cards: Used to load cards to the controller directly upon creation. Mostly for test purposes.
        """
        self.storage = storage
        self.parser = CardParser(storage_parse_mode)

    def get_card_by_id(self, card_id, parse_body=None):
        card = self.storage.get_card(card_id)
        if card is None:
            raise CardNotFound(f'{card_id} was not found')
        card = deepcopy(card)  # protection of card from silly parsers.
        card.body = self.parser.load(card.body)   # to inner format
        if parse_body is not None:
            parser = CardParser(parse_body)
            card.body = parser.unload(card.body)
        return card

    def get_image(self, image: Image):
        self.storage.load_image(image)
        return image.filedata

    def get_cards_by_tag(self, tag, parse_body=None):
        cards = [self.get_card_by_id(q, parse_body=parse_body) for q in self.storage.get_by_tags(tag)]

        return cards

    def search_cards(self, title=None, tags=None, limit=20, parse_body=None):
        kw = {}
        if title is not None:
            kw['title'] = title
        if tags is not None:
            kw['tags'] = tags
        cards = self.storage.get_by_search(**kw)[:limit]
        cards = deepcopy(cards)
        for card in cards:
            card.body = self.parser.load(card.body)
        if parse_body is not None:
            parser = CardParser(parse_body)
            for card in cards:
                card.body = parser.unload(card.body)
        return cards

    def get_tags(self):
        return self.storage.all_tags()

    def get_gallery(self, card_id, parse_body=None):
        images = self.storage.get_by_tags(card_id)
        images = [self.get_card_by_id(q, parse_body=parse_body) for q in images]
        images = [q for q in images if q.is_image()]
        return images


if __name__ == '__main__':
    from storage.filesystem import LocalStorage
    from utility import Config
    Config.filepath = 'D:\\Creative\\Code\\wikicards\\config.json'
    s = LocalStorage()
    cc = CardController(s)
    card = cc.get_card_by_id('test')
    # print(s.load_image(card.body))
    from cardholder import CardParser
    m = CardParser('ReactCustom')
    print(m.unload(card.body))
    from pprint import pprint
    # pprint({idx: q.__class__ for idx, q in enumerate(card.body.data)})
    # print(card.body.data[11].data[0].data)