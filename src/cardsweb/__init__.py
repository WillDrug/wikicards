from flask import Flask, request
from cardholder import CardController
from cardholder.exceptions import CardNotFound
from storage.filesystem import LocalStorage
from flask_cors import CORS, cross_origin
from os import path


class Response:
    def __init__(self, obj, message="", success=True):
        self.obj = obj
        self.message = message
        self.success = success

    def __call__(self):
        return {
            "obj": self.obj,
            "message": self.message,
            "success": self.success
        }


def serve_flask(name, cardholder: CardController):
    app = Flask(name)
    cors = CORS(app)
    app.config['upload_dir'] = 'upload'

    @app.route("/")
    def react():
        return app.send_static_file('index.html')

    @app.errorhandler(404)
    def not_found(e):
        return app.send_static_file('index.html')

    @app.route("/api/gallery/<card>")
    @cross_origin()
    def gallery(card):
        images = cardholder.get_gallery(card, parse_body='ReactCustom')
        images = [q.dict() for q in images]
        return Response(success=True, message="", obj=images)()

    @app.route("/api/card/<card>")
    @cross_origin()
    def serve_card(card: str):
        try:
            card = cardholder.get_card_by_id(card, parse_body='ReactCustom')
            # if card.is_image() and not 'preview' in request.args:  # reroute to /image ?
            #    return Response(success=False, message=f"Card {card.id} is an image!", obj=None)()
        except CardNotFound:
            return Response(success=False, message=f"Card {card} not found", obj=None)()

        return Response(success=True, message="", obj=card.dict())()

    @app.route('/api/tag/<tag>')
    @cross_origin()
    def search_tag(tag: str):
        cards = cardholder.get_cards_by_tag(tag, parse_body='ReactCustom')
        return Response(success=True, message="", obj=[q.dict() for q in cards])()

    @app.route('/api/search')
    @cross_origin()
    def search():
        title = request.args.get('title')
        tags = [q for q in request.args.get('tags').split(',') if q != '']
        cards = cardholder.search_cards(title=title if title != '' else None, tags=tags if tags.__len__() > 0 else None,
                                        parse_body='ReactCustom')
        return Response(success=True, message="", obj=[q.dict() for q in cards])()

    @app.route('/api/tag')
    @cross_origin()
    def all_tags():
        return Response(success=True, message="", obj=cardholder.get_tags())()

    @app.route('/image/<image>')
    @cross_origin()
    def serve_static(image):
        # todo check if uploaded and upload if not. then serve
        try:
            card = cardholder.get_card_by_id(image)
            if not card.is_image():
                return Response(success=False, message=f"Card {image} is not an image")()
        except CardNotFound:
            return Response(success=False, message=f"Image {image} not found", obj=None)()

        imgpath = f"{app.static_folder}/{app.config['upload_dir']}/{image}.{card.body.image_type}"
        if not path.exists(imgpath):
            with open(imgpath, 'wb+') as f:
                f.write(cardholder.get_image(card.body))
        return app.send_static_file(f"{app.config['upload_dir']}/{image}.{card.body.image_type}")

    @app.route('/api/aggregate/<tag>')
    @cross_origin()
    def aggregate(tag):
        cards = cardholder.get_cards_by_tag(tag)
        attrs = {q.title: q.attributes for q in cards}
        return Response(success=True, message="", obj=attrs)()

    return app
