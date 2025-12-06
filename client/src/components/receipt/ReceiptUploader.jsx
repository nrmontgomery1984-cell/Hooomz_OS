import { useState, useRef } from 'react';
import { Camera, Upload, Image, X, Loader2, FileText } from 'lucide-react';

export function ReceiptUploader({ onImageCapture, isProcessing }) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    // Validate file type - allow images and PDFs
    const isImage = file.type.startsWith('image/');
    const isPdfFile = file.type === 'application/pdf';

    if (!isImage && !isPdfFile) {
      alert('Please upload an image or PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFileName(file.name);
    setIsPdf(isPdfFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      // For PDFs, we don't show image preview
      if (isPdfFile) {
        setPreviewUrl('pdf');
      } else {
        setPreviewUrl(e.target.result);
      }
      onImageCapture(file, e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setIsPdf(false);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  if (previewUrl) {
    return (
      <div className="relative">
        <div className="relative rounded-xl overflow-hidden bg-gray-100">
          {isPdf ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <FileText className="w-16 h-16 text-red-500 mb-3" />
              <p className="text-sm font-medium text-charcoal">{fileName}</p>
              <p className="text-xs text-gray-500 mt-1">PDF document</p>
            </div>
          ) : (
            <img
              src={previewUrl}
              alt="Receipt preview"
              className="w-full max-h-[400px] object-contain"
            />
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium">Scanning receipt...</p>
              </div>
            </div>
          )}
        </div>
        {!isProcessing && (
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
        ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-gray-50'}
      `}
    >
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          <Image className="w-8 h-8 text-gray-400" />
        </div>

        <div>
          <p className="text-gray-600 font-medium">Upload a receipt</p>
          <p className="text-sm text-gray-400 mt-1">
            Drag & drop image or PDF, or click to select
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          {/* Camera button (mobile) */}
          <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">Camera</span>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>

          {/* File upload button */}
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Browse</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>

        <p className="text-xs text-gray-400">
          Supports JPG, PNG, HEIC, PDF • Max 10MB
        </p>
      </div>
    </div>
  );
}
