from pathlib import Path
root=Path(__file__).resolve().parents[1]
web=root/'web'
frames=(web/'index.html').read_text().replace('/*LOGO*/',(web/'logo.b64').read_text().strip())
(root/'index.html').write_text(frames.replace('/*CSS*/',(web/'style.css').read_text()))
