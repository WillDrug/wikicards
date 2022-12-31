import json


class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class Config(metaclass=Singleton):
    filepath = 'config.json'
    def __init__(self):
        with open(self.filepath, 'r') as f:
            strcfg = f.read()

        cfg = json.loads(strcfg)
        for k in cfg:
            self.__setattr__(k, cfg[k])
