from rembg import remove
from PIL import Image
import io

img = Image.new("RGB", (10,10), (255,0,0))
buf = io.BytesIO()
img.save(buf, format="PNG")
out = remove(buf.getvalue())
assert out.startswith(b'\x89PNG'), "rembg did not return a PNG!"