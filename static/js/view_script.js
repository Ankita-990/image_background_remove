// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadImageDetails();
    setupImageInteractions();
});

// Load and display image details
function loadImageDetails() {
    const image = document.getElementById('convertedImage');
    const dimensionsElement = document.getElementById('imageDimensions');
    const fileSizeElement = document.getElementById('imageFileSize');
    
    if (image) {
        image.onload = function() {
            // Update dimensions
            const dimensions = `${image.naturalWidth} × ${image.naturalHeight} pixels`;
            dimensionsElement.textContent = dimensions;
            
            // Update dimensions in overlay
            const overlayDimensions = document.querySelector('.image-info .dimensions');
            if (overlayDimensions) {
                overlayDimensions.textContent = dimensions;
            }
            
            // Get file size via fetch request
            fetchImageFileSize(image.src);
        };
        
        image.onerror = function() {
            dimensionsElement.textContent = 'Error loading image';
            fileSizeElement.textContent = 'Unknown';
        };
    }
}

// Fetch image file size
async function fetchImageFileSize(imageUrl) {
    try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        const contentLength = response.headers.get('Content-Length');
        
        if (contentLength) {
            const fileSizeFormatted = formatFileSize(parseInt(contentLength));
            const fileSizeElement = document.getElementById('imageFileSize');
            
            if (fileSizeElement) {
                fileSizeElement.textContent = fileSizeFormatted;
            }
            
            // Update file size in overlay
            const overlayFileSize = document.querySelector('.image-info .file-size');
            if (overlayFileSize) {
                overlayFileSize.textContent = fileSizeFormatted;
            }
        }
    } catch (error) {
        console.error('Error fetching file size:', error);
        const fileSizeElement = document.getElementById('imageFileSize');
        if (fileSizeElement) {
            fileSizeElement.textContent = 'Unknown';
        }
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

// Setup image interactions
function setupImageInteractions() {
    const image = document.getElementById('convertedImage');
    const imageWrapper = document.querySelector('.image-wrapper');
    
    if (image && imageWrapper) {
        // Add click to view full size (in new tab)
        image.addEventListener('click', function() {
            window.open(image.src, '_blank');
        });
        
        // Add cursor pointer style
        image.style.cursor = 'pointer';
        
        // Add title attribute for tooltip
        image.title = 'Click to view full size in new tab';
    }
}

// Copy image URL to clipboard
async function copyImageUrl() {
    const image = document.getElementById('convertedImage');
    const toast = document.getElementById('toast');
    
    if (!image) {
        showToast('Error: Image not found', false);
        return;
    }
    
    try {
        const imageUrl = window.location.origin + image.getAttribute('src');
        
        if (navigator.clipboard && window.isSecureContext) {
            // Use modern clipboard API
            await navigator.clipboard.writeText(imageUrl);
            showToast('Link copied to clipboard!', true);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = imageUrl;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showToast('Link copied to clipboard!', true);
            } catch (err) {
                showToast('Failed to copy link', false);
            }
            
            document.body.removeChild(textArea);
        }
    } catch (err) {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy link', false);
    }
}

// Show toast notification
function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    if (toast && toastMessage && toastIcon) {
        // Update message and icon
        toastMessage.textContent = message;
        toastIcon.textContent = isSuccess ? '✅' : '❌';
        
        // Update toast color
        toast.style.background = isSuccess ? '#28a745' : '#dc3545';
        
        // Show toast
        toast.classList.add('show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to download
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const downloadBtn = document.querySelector('.btn-download');
        if (downloadBtn) {
            downloadBtn.click();
        }
    }
    
    // Ctrl/Cmd + C to copy link
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !window.getSelection().toString()) {
        e.preventDefault();
        copyImageUrl();
    }
    
    // Escape to go back
    if (e.key === 'Escape') {
        const backBtn = document.querySelector('.btn-convert-another');
        if (backBtn) {
            window.location.href = backBtn.href;
        }
    }
});

// Add loading states to buttons
function addButtonLoadingStates() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        if (!button.classList.contains('btn-copy')) {
            button.addEventListener('click', function() {
                // Don't add loading state to external links
                if (this.tagName === 'A' && this.href) {
                    return;
                }
                
                this.classList.add('loading');
                const originalText = this.innerHTML;
                
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.innerHTML = originalText;
                }, 2000);
            });
        }
    });
}

// Initialize button loading states
document.addEventListener('DOMContentLoaded', addButtonLoadingStates);

// Add image zoom functionality (optional enhancement)
function addImageZoom() {
    const image = document.getElementById('convertedImage');
    const imageWrapper = document.querySelector('.image-wrapper');
    
    if (image && imageWrapper) {
        let isZoomed = false;
        
        image.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (!isZoomed) {
                // Zoom in
                image.style.transform = 'scale(2)';
                image.style.cursor = 'zoom-out';
                imageWrapper.style.overflow = 'auto';
                isZoomed = true;
            } else {
                // Zoom out
                image.style.transform = 'scale(1)';
                image.style.cursor = 'pointer';
                imageWrapper.style.overflow = 'hidden';
                isZoomed = false;
            }
        });
        
        // Add double-click hint
        image.title = 'Click to view full size • Double-click to zoom';
    }
}

// Initialize zoom functionality
document.addEventListener('DOMContentLoaded', addImageZoom);

// Add smooth scrolling for better UX
function addSmoothScrolling() {
    document.documentElement.style.scrollBehavior = 'smooth';
}

// Initialize smooth scrolling
document.addEventListener('DOMContentLoaded', addSmoothScrolling);