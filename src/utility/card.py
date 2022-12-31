import pydantic
from typing import List, Optional, Union
from storage import Image
from utility import Config
import markdown


class Card(pydantic.BaseModel):
    class Config:
        arbitrary_types_allowed = True

    id: str
    title: str
    preview_image: Optional[str]  # CARD id reference to fetch image.
    tags: Optional[List[str]] = ()
    body: Union[str, Image]
    attributes: Optional[dict]

    @pydantic.validator('id')
    def no_spaces_id(cls, v):
        if ' ' in v:
            raise ValueError('must contain a space')
        return v

    def is_image(self):
        return self.id == self.preview_image



if __name__ == '__main__':
    img = Card(id='img', title='Image', preview_image='img', body=Image('test'))
    c = Card(id='test', title='Test Card', body='Fuck you', preview_image='img', extra=22)
    # print(c.json())
    # print(img.json(encoder=lambda x: x.toJSON()))
    print(img.get)