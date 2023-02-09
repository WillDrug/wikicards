from cardholder import CardController
from storage.filesystem import LocalStorage
from cardsweb import serve_flask


ch = CardController(LocalStorage(), storage_parse_mode='Markdown')
app = serve_flask('cardsweb', ch)

if __name__ == '__main__':
    app.run('0.0.0.0', 80, True)
