from cardholder import CardController
from storage.filesystem import LocalStorage
from cardsweb import serve_flask

if __name__ == '__main__':
    # name controls the directory of serve.
    # todo: move to common config.
    ch = CardController(LocalStorage(), storage_parse_mode='Markdown')
    app = serve_flask('cardsweb', ch)
    app.run('0.0.0.0', 8080, True)