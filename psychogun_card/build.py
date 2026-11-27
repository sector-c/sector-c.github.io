"""Build a self-contained HTML page with inline scripts, CSS and image assets."""
from pathlib import Path
import base64,re
root=Path(__file__).resolve().parent
html=(root/'index.html').read_text()
css=(root/'style.css').read_text()
def data(path):
    return 'data:image/png;base64,'+base64.b64encode((root/path).read_bytes()).decode()
css=re.sub(r"assets/[\w.-]+\.png",lambda m:data(m.group()),css)
html=html.replace('<link rel="stylesheet" href="style.css">','<style>\n'+css+'\n</style>')
html=re.sub(r'(?<=src=")assets/[\w.-]+\.png',lambda m:data(m.group()),html)
for name in ['codec.js','app.js']:
    html=html.replace(f'<script src="{name}"></script>','<script>\n'+(root/name).read_text()+'\n</script>')
(root.parent/'psychogun_card.html').write_text(html)
