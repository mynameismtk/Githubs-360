# Tile rendered frames into a labelled grid: python3 tile.py out.png cols w f1.png f2.png ...
import sys
from PIL import Image, ImageDraw, ImageFont
out, cols, w, files = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4:]
h = int(w * 1920 / 1080); lab = 34; pad = 10
rows = (len(files) + cols - 1) // cols
W = Image.new('RGB', (cols * (w + pad) + pad, rows * (h + lab + pad) + pad), (24, 24, 28))
d = ImageDraw.Draw(W)
try: font = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf', 22)
except Exception: font = ImageFont.load_default()
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h), Image.LANCZOS)
    x, y = pad + (i % cols) * (w + pad), pad + (i // cols) * (h + lab + pad)
    W.paste(im, (x, y + lab))
    name = f.split('/')[-1].replace('f_', 't=').replace('.png', 's')
    d.text((x + 4, y + 6), name, fill=(240, 240, 240), font=font)
W.save(out)
