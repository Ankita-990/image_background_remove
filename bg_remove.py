import io
import os
from PIL import Image
from rembg import remove

class ImageConverter:
    """
    Converts images to a target format and optionally strips their background
    using rembg.
    """

    def __init__(self):
        self.supported_formats = {
            'png': 'PNG',
            'jpg': 'JPEG',
            'jpeg': 'JPEG',
            'gif': 'GIF',
            'bmp': 'BMP',
            'tiff': 'TIFF',
            'webp': 'WEBP'
        }

    def convert_image(self, input_path: str, output_dir: str,
                      target_format: str, remove_background: bool = True) -> str:
        """
        Opens `input_path`, optionally removes its background, then saves it
        as `target_format` under `output_dir`.

        Returns the output filename.

        Raises:
            ValueError: unsupported target_format
            Exception: any IO or processing error
        """
        fmt_key = target_format.lower()
        if fmt_key not in self.supported_formats:
            raise ValueError(f"Unsupported format: {target_format}")

        try:
            # Load original
            with Image.open(input_path) as img:
                # Always work in RGBA if we intend to remove bg
                if remove_background:
                    img = img.convert("RGBA")
                    buf = io.BytesIO()
                    img.save(buf, format="PNG")
                    # raw RGBA-PNG bytes in
                    processed_bytes = remove(buf.getvalue())
                    # back into PIL
                    img = Image.open(io.BytesIO(processed_bytes)).convert("RGBA")

                # Prepare output path
                base = os.path.splitext(os.path.basename(input_path))[0]
                out_name = f"{base}_converted.{fmt_key}"
                out_path = os.path.join(output_dir, out_name)

                # Final save
                pil_fmt = self.supported_formats[fmt_key]
                # JPEG can’t hold alpha—flatten against white
                if pil_fmt == 'JPEG':
                    img = img.convert("RGB")
                    img.save(out_path, format=pil_fmt, quality=95, optimize=True)
                else:
                    img.save(out_path, format=pil_fmt)

                return out_name

        except Exception as e:
            raise Exception(f"Failed to convert image: {e}")