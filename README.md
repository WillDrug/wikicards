


# Cards
This tool takes data from .txt files and serves them as cards supporting markdown and crosslinks. 

# Internal Structure
Cards are stored as a nested block structure, allowing for several decorations. **Decorations cannot be unmatched**

Allowed decorations are:
* List (ordered\unordered)
* Bold
* Italic
* Strikethrough
* Divider
* URL (or reference)
* Header (level 1-3)

## Functionality
As planned
1. Serve .txt as cards with stylin'
2. Support markdown "cross-link"
3. Support images
4. Support style markdowns
5. Being able to be served through the internet
6. Extended markdown
7. Confluence-like style options
8. Authentication
9. In-site editing
10. File history
11. Edit Authorization
12. Plain-text export

Starting with plain `.txt` serving which can be viewed nicely with one simple markdown.

Testing _under_, *over*, **double**, __doubledown__, ~~strike~~, ~one~, 
This _is **unmatched_ decoration** << DOESN'T WORK YAY [url](text) 