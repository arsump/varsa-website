from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
web=root/'web'
frames=(web/'index.html').read_text().replace('/*LOGO*/',(web/'logo.b64').read_text().strip())
js=(root/'src'/'record.mjs').read_text().replace('export function','function')
for var,file in [('archive','events'),('sites','sites'),('rules','rules')]:
    js+='\nconst '+var+'='+json.dumps(json.loads((root/'data'/f'{file}.json').read_text())).replace('</','<\\/')+';'
js+='\n'+(web/'app.js').read_text()
(root/'index.html').write_text(frames.replace('/*CSS*/',(web/'style.css').read_text()).replace('/*JS*/',js))
