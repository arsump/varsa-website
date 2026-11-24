from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
web=root/'web'
frames=(web/'index.html').read_text().replace('/*LOGO*/',(web/'logo.b64').read_text().strip())
js='\n'.join((root/'src'/name).read_text().replace('export function','function').replace('export async function','async function') for name in ['record.mjs','lookup.mjs'])
for var,file in [('archive','history'),('sites','sites'),('rules','rules'),('wildfire','wildfire')]:
    js+='\nconst '+var+'='+json.dumps(json.loads((root/'data'/f'{file}.json').read_text())).replace('</','<\\/')+';'
js+='\n'+(web/'app.js').read_text()
(root/'index.html').write_text(frames.replace('/*CSS*/',(web/'style.css').read_text()).replace('/*JS*/',js))
