from flask import Flask, render_template, request, send_file, flash, redirect, url_for
import os
from werkzeug.utils import secure_filename
from bg_remove import ImageConverter
import tempfile

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this'

# Configuration
UPLOAD_FOLDER = 'uploads'
CONVERTED_FOLDER = 'converted'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)
os.makedirs('static/css', exist_ok=True)
os.makedirs('static/js', exist_ok=True)
os.makedirs('templates', exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['CONVERTED_FOLDER'] = CONVERTED_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        flash('No file selected')
        return redirect(request.url)
    
    file = request.files['file']
    conversion_type = request.form.get('conversion_type', 'png')
    
    if file.filename == '':
        flash('No file selected')
        return redirect(url_for('index'))
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(input_path)
        
        try:
            # Convert the image
            converter = ImageConverter()
            output_filename = converter.convert_image(
                input_path, 
                app.config['CONVERTED_FOLDER'],
                conversion_type
            )
            
            # Clean up input file
            os.remove(input_path)
            
            flash(f'Image successfully converted to {conversion_type.upper()}!')
            return redirect(url_for('view_image', filename=output_filename))
            
        except Exception as e:
            flash(f'Error converting image: {str(e)}')
            # Clean up input file if it exists
            if os.path.exists(input_path):
                os.remove(input_path)
            return redirect(url_for('index'))
    
    else:
        flash('Invalid file type. Please upload an image file.')
        return redirect(url_for('index'))

@app.route('/view/<filename>')
def view_image(filename):
    """Display the converted image in browser"""
    return render_template('view_image.html', filename=filename)

@app.route('/image/<filename>')
def serve_image(filename):
    """Serve the converted image file"""
    return send_file(
        os.path.join(app.config['CONVERTED_FOLDER'], filename),
        mimetype='image/' + filename.split('.')[-1].lower()
    )

@app.route('/download/<filename>')
def download_image(filename):
    """Download the converted image file"""
    return send_file(
        os.path.join(app.config['CONVERTED_FOLDER'], filename),
        as_attachment=True,
        download_name=filename
    )

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)