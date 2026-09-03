// ============================================
// Camera Service
// Uses Capacitor Camera with web fallback
// ============================================

export async function takePhoto(): Promise<string | null> {
  try {
    // Try Capacitor Camera first
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // Let user choose camera or gallery
      width: 1024,
      height: 1024,
      correctOrientation: true,
    });

    return image.dataUrl || null;
  } catch (err) {
    console.warn('[Camera] Capacitor camera failed, trying web fallback:', err);
    return webCameraFallback();
  }
}

/**
 * Web fallback: use file input to pick image
 */
function webCameraFallback(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Prefer back camera on mobile
    
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      // Resize and convert to DataURL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        // Resize to max 1024px
        resizeImage(dataUrl, 1024).then(resolve).catch(() => resolve(dataUrl));
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
}

/**
 * Resize image to max dimension while keeping aspect ratio
 */
function resizeImage(dataUrl: string, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      if (width <= maxSize && height <= maxSize) {
        resolve(dataUrl);
        return;
      }

      const ratio = Math.min(maxSize / width, maxSize / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
