from . import Storage, Image
from os import listdir, path, remove, walk
from utility.card import Card
from itertools import chain


class LocalStorage(Storage):
    def get_by_tags(self, *args):
        ret = []
        for card_id in self.cache:
            if all(q in (self.cache[card_id].tags or ()) for q in args):
                ret.append(card_id)
        return ret

    def get_by_search(self, **search):
        def title(card, query):
            if query.lower() in card.title.lower():
                return True
            return False

        def tags(card, tags):
            return all(tag in card.tags for tag in tags)

        cards = list(self.cache.keys())
        for k in search:
            parser = locals().get(k)
            if parser is None:
                continue
            cards = [q for q in cards if parser(self.cache.get(q), search.get(k))]

        return [self.get_card(q) for q in cards]

    def card_history(self, card):
        pass

    def all_tags(self):
        return list(set(chain(*[self.cache[q].tags for q in self.cache])))

    def __init__(self):
        """
        This implementation loads full cache, however it's expected to hold just the ids;
        IDs in this case are filenames exactly but they can be based on a DB column or whatever else
        Storage classes abstract away that dependency
        """
        super().__init__()
        self.files = {}
        if self.config.get('folder') is None:
            raise AttributeError(f'Expected config to have localstorage folder set, found None')
        self.__read()

    def __parse_lines(self, filepath: str, lines: list):
        name = path.basename(filepath)
        folder = path.dirname(filepath)
        output = {'id': name.split('.')[0]}
        line = lines.pop(0)
        while line.strip() != '---':
            key, value = line.split('=')
            output[key.strip()] = value.strip()
            try:
                line = lines.pop(0)
            except IndexError:
                break
        output['body'] = ''.join(lines)

        if 'tags' in output:
            output['tags'] = output['tags'].split(',')

        c = Card(**output)
        attrs = {}
        for k in output:
            if not hasattr(c, k):
                attrs[k] = output[k]
        c.attributes = attrs
        if c.is_image():
            image_path = c.body
            if image_path not in listdir(folder):
                raise FileNotFoundError(f'Can\'t find image {c.body}')
            image_path = path.join(folder, c.body)
            c.body = Image(image_path)
        return c

    def __serialize(self, card: Card):
        out = ""
        body = ""
        for key, value in card:
            if key == 'body':
                body = value
                continue
            if value is None:
                continue
            else:
                if isinstance(value, dict):
                    for i_k, i_v in value.items():
                        out += f"{i_k}={i_v}\n"
                else:
                    if isinstance(value, list):
                        value = ','.join(value)
                    out += f"{key}={value}\n"
        out += '---\n'
        out += body
        return out

    def __write(self):
        """ dump sync function """
        for card_id in self.files:
            with open(self.files[card_id], 'w') as f:
                f.write(self.__serialize(self.cache[card_id]))

    def __files(self):
        for fpath, _, files in walk(self.config.get('folder')):
            for file in files:
                yield path.join(fpath, file)

    def __exclude(self):
        """ delete sync function """
        media = [self.cache[q].body.filepath for q in self.cache if self.cache[q].is_image()]
        for file in self.__files():
            if file not in self.files.values() and file not in media:
                # try finding a reference
                remove(file)

    def __read(self):
        """ read sync function """
        for file in self.__files():
            try:
                with open(file, 'r') as f:
                    c = self.__parse_lines(file, f.readlines())
                    self.cache[c.id] = c
                    self.files[c.id] = file
            except UnicodeDecodeError:  # image
                continue

    def create_card(self, card: Card):
        if card.id in self.cache:
            raise NameError(f'Card with id {card.id} already exists')
        self.cache[card.id] = card
        self.files[card.id] = path.join(self.config.get('folder'), f'{card.id}.txt')
        self.__write()

    def get_card(self, card_id, revision=None):
        return self.cache.get(card_id)

    def update_card(self, card):
        self.cache[card.id] = card
        self.__write()

    def delete_card(self, card_id):
        del self.cache[card_id]
        del self.files[card_id]
        self.__exclude()

    def load_image(self, img: Image):
        if img.filedata is None:
            fullpath = path.join(self.config.get('folder'), img.filepath)
            img.load(open(fullpath, 'rb+').read())
