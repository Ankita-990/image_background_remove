// DOM Elements
const fileInput = document.getElementById('file');
const fileLabel = document.getElementById('fileLabel');
const convertBtn = document.getElementById('convertBtn');
const filePreview = document.getElementById('filePreview');
const previewImg = document.getElementById('previewImg');
const fileInfo = document.getElementById('fileInfo');

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeFileHandling();
    initializeFormHandling();
});

// Initialize file handling functionality
function initializeFileHandling() {
    // Handle file selection
    fileInput.addEventListener('change', handleFileSelect);

    // Handle drag and drop events
    fileLabel.addEventListener('dragover', handleDragOver);
    fileLabel.addEventListener('dragleave', handleDragLeave);
    fileLabel.addEventListener('drop', handleDrop);
}

// Initialize form handling
function initializeFormHandling() {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFormSubmit);
    }
}

// Handle drag over event
function handleDragOver(e) {
    e.preventDefault();
    fileLabel.classList.add('dragover');
}

// Handle drag leave event
function handleDragLeave() {
    fileLabel.classList.remove('dragover');
}

// Handle drop event
function handleDrop(e) {
    e.preventDefault();
    fileLabel.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect();
    }
}

// Handle file selection
function handleFileSelect() {
    const file = fileInput.files[0];
    
    if (file) {
        // Validate file type
        if (!isValidImageFile(file)) {
            showError('Please select a valid image file');
            resetFileInput();
            return;
        }

        // Validate file size (16MB limit)
        if (file.size > 16 * 1024 * 1024) {
            showError('File size must be less than 16MB');
            resetFileInput();
            return;
        }

        // Enable convert button
        convertBtn.disabled = false;
        
        // Update label text and icon
        updateFileLabel(file);
        
        // Show preview if it's an image
        showImagePreview(file);
    }
}

// Validate if file is a valid image
function isValidImageFile(file) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'];
    return allowedTypes.includes(file.type);
}

// Update file label with selected file info
function updateFileLabel(file) {
    const fileText = fileLabel.querySelector('.file-text');
    const fileIcon = fileLabel.querySelector('.file-icon');
    
    if (fileText && fileIcon) {
        fileText.textContent = file.name;
        fileIcon.textContent = '✅';
    }
}

// Show image preview
function showImagePreview(file) {
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            filePreview.style.display = 'block';
            
            const fileSize = formatFileSize(file.size);
            fileInfo.textContent = `${file.name} (${fileSize})`;
        };
        reader.onerror = function() {
            showError('Error reading file');
        };
        reader.readAsDataURL(file);
    }
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Handle form submission
function handleFormSubmit() {
    const selectedFile = fileInput.files[0];
    
    if (!selectedFile) {
        showError('Please select a file first');
        return false;
    }
    
    // Update button state
    convertBtn.textContent = 'Converting...';
    convertBtn.disabled = true;
    
    // Add loading class for visual feedback
    convertBtn.classList.add('loading');
    
    return true;
}

// Reset file input
function resetFileInput() {
    fileInput.value = '';
    convertBtn.disabled = true;
    filePreview.style.display = 'none';
    
    // Reset label
    const fileText = fileLabel.querySelector('.file-text');
    const fileIcon = fileLabel.querySelector('.file-icon');
    
    if (fileText && fileIcon) {
        fileText.textContent = 'Click to select an image or drag and drop';
        fileIcon.textContent = '📁';
    }
}

// Show error message
function showError(message) {
    // Create or update error message element
    let errorElement = document.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'flash-message flash-error error-message';
        
        const flashContainer = document.querySelector('.flash-messages') || 
                             document.createElement('div');
        
        if (!document.querySelector('.flash-messages')) {
            flashContainer.className = 'flash-messages';
            document.querySelector('.container').insertBefore(
                flashContainer, 
                document.querySelector('.header').nextSibling
            );
        }
        
        flashContainer.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        if (errorElement && errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
        }
    }, 5000);
}

// Utility function to get selected format
function getSelectedFormat() {
    const formatInputs = document.querySelectorAll('input[name="conversion_type"]');
    for (const input of formatInputs) {
        if (input.checked) {
            return input.value;
        }
    }
    return 'png'; // default
}

// Add loading animation styles dynamically
function addLoadingStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .convert-btn.loading {
            position: relative;
            overflow: hidden;
        }
        
        .convert-btn.loading::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
            0% { left: -100%; }
            100% { left: 100%; }
        }
    `;
    document.head.appendChild(style);
}

// Initialize loading styles when DOM is loaded
document.addEventListener('DOMContentLoaded', addLoadingStyles);