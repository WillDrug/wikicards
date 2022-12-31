from abc import ABCMeta, abstractmethod
import re
from storage import Image


class FormatError(Exception):
    pass


class TextBlock:
    allowed = ['header', 'decorate', 'list', 'line', 'link']
    pattern = r'({{{(\d+)}}})'

    def __init__(self, text):
        self.data = [text]
        self.block_reference = {}

    def collapse(self):
        text = ''
        self.block_reference = {}
        cnt = 0
        for line in self.data:
            if isinstance(line, str):
                text += line
            else:
                self.block_reference[cnt] = line
                text += '{{{' + str(cnt) + '}}}'
                cnt += 1
        return text

    def restore(self, lines=None, block_reference=None):  # all objects within lines are _new_ and should be parsed
        if block_reference is None:
            block_reference = self.block_reference
        if lines is None:
            lines = self.data
        ret = []
        for line in lines:
            if isinstance(line, str):
                parsing = line
                while (match := re.findall(self.pattern, parsing)).__len__() > 0:
                    start, end = parsing.split(match[0][0])  # first find
                    ret.append(start)
                    ret.append(block_reference.get(int(match[0][1])))
                    parsing = end
                ret.append(parsing)
            else:  # line is a nested block
                line.restore(block_reference=block_reference)  # restore line.data with self block ref
                ret.append(line)  # add restored block to data
        self.data = ret
        return ret

    def parse(self, func):  # func is a callable which returns list.
        # turn self.data into text with references
        # run parser against text
        # for each return line, recusrive, restore objects to their places
        # run parser for all remembered blocks
        text_to_parse = self.collapse()
        lines = func(text_to_parse)
        self.restore(lines=lines)  # this sets self.data
        for block in self.block_reference.values():
            block.parse(func)  # this overrides self.data on the inside with self.restore

    def serialize(self, parser_func):
        text = ''
        for block in self.data:
            if isinstance(block, str):
                text += block
            else:
                text += block.serialize(parser_func)
        return parser_func(text, self)

    def clean(self):
        rectified = []
        for block in self.data:
            if isinstance(block, str):
                if block == '':
                    continue
            else:
                block.clean()
            rectified.append(block)
        self.data = rectified

    def nest_lists(self):
        """
        This function wraps each continuous line of List items outside a ListContainer into a Container
        :return:
        """
        run_started = False
        container = None
        rectified = []
        for block in self.data:
            if not isinstance(block, str):
                block.nest_lists()  # recurse this fucker
            if isinstance(block, List):  # start, continue or switch run
                if block.position is not None:
                    ordered = True
                else:
                    ordered = False
                if run_started and container.ordered != ordered:  # switch run.
                    rectified.append(container)
                    container = ListContainer('', ordered=ordered)
                    container.data = [block]
                elif run_started:
                    container.data.append(block)
                else:
                    container = ListContainer('', ordered=ordered)
                    container.data = [block]
                    run_started = True
            elif run_started:  # not-a-list after a series of a list, end series.
                run_started = False
                rectified.append(container)
                container = None
                rectified.append(block)
            else:  # not a list, not a run, append and move on.
                rectified.append(block)
        if container is not None:
            rectified.append(container)
        self.data = rectified

    def get_opts(self):
        return {}


class Header(TextBlock):
    def __init__(self, text, level=1):
        super().__init__(text)
        self.level = level

    def get_opts(self):
        return {'level': self.level}


class Decorated(TextBlock):
    def __init__(self, text, decoration='bold'):  # bold, italic, strikethrough
        super().__init__(text)
        self.decoration = decoration

    def get_opts(self):
        return {'decoration': self.decoration}


class ListContainer(TextBlock):
    def __init__(self, text, ordered=False):
        self.ordered = ordered

    def get_opts(self):
        return {'ordered': self.ordered}


class List(TextBlock):
    def __init__(self, text, position):  # todo: numbering? or returning via self.data?
        super().__init__(text)
        self.position = position

    def get_opts(self):
        return {'position': self.position}


class Line(TextBlock):
    pass


class Link(TextBlock):
    def __init__(self, text, url=''):
        super().__init__(text)
        self.url = url

    def get_opts(self):
        return {'url': self.url}


class CardParser(metaclass=ABCMeta):
    def __new__(cls, *args, **kwargs):
        parser = args[0]
        subclasses = {q.__name__: q for q in cls.__subclasses__()}
        if parser not in subclasses:
            raise NotImplementedError(f'{parser} is not a valid parser')
        return object.__new__(subclasses[parser])

    @abstractmethod
    def load(self, body: str) -> TextBlock:
        pass

    @abstractmethod
    def parser_func(self, text: str, obj: TextBlock) -> str:
        pass

    def unload(self, body: TextBlock) -> str:
        if isinstance(body, Image):
            return body
        return body.serialize(self.parser_func)


class Markdown(CardParser):
    """
    Simple markdown considers _italic_ to be single underline with no space after the opener and before the loser
    And **double** star to be bold notation for simplicity in parsing.
    """

    def fix_list(self, lst):
        ret = []
        for line in lst:
            if isinstance(line, str) and ret.__len__() > 0 and isinstance(ret[-1], str):
                ret[-1] += line
            else:
                ret.append(line)
        return ret

    def find_lists(self, text):  # first pass expecting full list
        lines = re.split('(\n)', text)  # fixme enclose ListItem (num=None\int) in List(ordered=bool)
        for idx, line in enumerate(lines):
            if line.startswith('* '):
                lines[idx] = List(line[2:], position=None)
                continue
            match = re.findall(r'(^(\d+)\.\s)', line)
            if match.__len__() > 0:
                pos = int(match[0][1])
                lines[idx] = List(line.replace(match[0][0], ''), position=pos)
        ret = []
        for idx, line in enumerate(lines):
            if idx < len(lines) - 1 and isinstance(lines[idx - 1], List) and line.endswith('\n'):
                line = line[:-1]
                if line == '':
                    continue
            ret.append(line)
        return self.fix_list(ret)

    def large_parse(self, text):
        lines = re.split('(\n)', text)
        for idx, line in enumerate(lines):
            if line == '---':
                lines[idx] = Line(line)
                continue
            if line.startswith('#'):
                if line.startswith('###'):
                    level = 3
                elif line.startswith('##'):
                    level = 2
                else:
                    level = 1
                line = line[level:]
                if line.startswith(' '):
                    line = line[1:]
                lines[idx] = Header(line, level=level)
        # remove newline characters before each Header item
        ret = []
        for idx, line in enumerate(lines):
            if idx < len(lines) - 1 and not isinstance(lines[idx + 1], str) and line.endswith('\n'):
                line = line[:-1]
                if line == '':
                    continue
            # remove following \n for Line
            if len(lines) - 1 > idx > 0 and isinstance(lines[idx - 1], Line) and line.endswith('\n'):
                line = line[:-1]
                if line == '':
                    continue
            ret.append(line)
        return self.fix_list(ret)

    def get_parser(self, pattern, cls, kwargs, text_match_pos=1, match_set=None):
        def run_parse(text):
            ret = []
            matches = re.findall(pattern, text)
            for match in matches:
                tmp = text.split(match[0])
                extra = kwargs.copy()
                if match_set is not None:
                    for k in match_set:
                        extra[k] = match[match_set[k]]
                ret.extend([tmp[0], cls(match[text_match_pos], **extra)])
                text = match[0].join(tmp[1:])
            ret.append(text)
            return ret

        return run_parse

    def find_links(self, text):
        return [text]

    def load(self, body: str) -> TextBlock:
        if isinstance(body, Image):
            return body
        b = TextBlock(body)
        # start with list
        b.parse(self.find_lists)
        b.parse(self.large_parse)
        b.parse(self.get_parser(r'(\*\*([^\s][^(\*\*)]+[^\s])\*\*)', Decorated, {'decoration': 'bold'}))
        b.parse(self.get_parser(r'(\~\~([^\s].*[^\s])\~\~)', Decorated, {'decoration': 'strikethrough'}))
        b.parse(self.get_parser(r'(\_([^\s][^_]+[^\s])\_)', Decorated, {'decoration': 'italic'}))
        b.parse(self.get_parser(r'(\[([^\[\]\(\)]+)\]\(([^\s]+)\))', Link, {}, match_set={'url': 2}))
        b.clean()
        b.nest_lists()
        return b

    def parser_func(self, text: str, obj: TextBlock) -> str:
        # todo: move this elif stucture up and separate functions for parsing different block types.
        if isinstance(obj, Header):
            text = '\n' + '#' * obj.level + ' ' + text
        elif isinstance(obj, List):  # List object is one list item but can contain extra stuff
            text = '\n' + ('* ' if obj.position is None else f'{obj.position}. ') + text
        elif isinstance(obj, Decorated):
            if obj.decoration == 'bold':
                mark = '**'
            elif obj.decoration == 'italic':
                mark = '_'
            elif obj.decoration == 'strikethrough':
                mark = '~~'
            else:
                mark = ''  # shouldn't happen
            text = mark + text + mark
        elif isinstance(obj, Link):
            text = f'[{text}]({obj.url})'
        elif isinstance(obj, Line):
            text = '\n---\n'  # newline characters persist. no data permitted for Line
        return text


class HTMLPlain(CardParser):
    def load(self, body: str) -> TextBlock:
        pass  # todo: make a smiple html loader

    def parser_func(self, text: str, obj: TextBlock) -> str:
        if isinstance(obj, Header):
            text = f'\n<h{obj.level}>{text}</h{obj.level}>'
        elif isinstance(obj, ListContainer):
            text = f'\n<{"ul" if obj.ordered else "ol"}>{text}\n</{"ul" if obj.ordered else "ol"}>'
        elif isinstance(obj, List):  # List object is one list item but can contain extra stuff
            text = '\n<li>' + text + '</li>'
        elif isinstance(obj, Decorated):
            if obj.decoration == 'bold':
                mark = 'strong'
            elif obj.decoration == 'italic':
                mark = 'em'
            elif obj.decoration == 'strikethrough':
                mark = 'strike'
            else:
                mark = ''  # shouldn't happen
            text = f'<{mark}>' + text + f'</{mark}>'
        elif isinstance(obj, Link):
            text = f'<a href="{obj.url}">{text}</a>'
        elif isinstance(obj, Line):
            text = '\n<hr/>\n'  # newline characters persist. no data permitted for Line
        else:
            text = '<span>' + text + '</span>'
        return text


class ReactCustom(CardParser):
    def load(self, body: str) -> TextBlock:
        pass

    def parser_func(self, text: str, obj: TextBlock) -> str:
        pass

    def unload(self, body: TextBlock) -> str:
        """
        Returns a JSON object to be parsed into JSX
        :param body:
        :param inside: signify newline characters for rendering
        :return:
        """
        if isinstance(body, Image):
            return f'{body.image_type}'
        data = []
        ret = {"class": body.__class__.__name__, 'data': data, 'parms': body.get_opts()}
        for block in body.data:
            if isinstance(block, str):
                data.append(block)
            else:
                data.append(self.unload(block))
        return ret


if __name__ == '__main__':
    mparser = CardParser('Markdown')
    print(mparser.__class__)
    print(mparser('Test string'))
