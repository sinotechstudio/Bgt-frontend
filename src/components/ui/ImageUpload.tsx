import React, { useState, useRef } from 'react';
import { Upload, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
  label: string;
  currentImage?: string;
  onImageSelected: (base64Url: string) => void;
  maxSizeMb?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  currentImage,
  onImageSelected,
  maxSizeMb = 2,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);

    // Validate MIME format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (PNG, JPG, or WEBP)');
      return;
    }

    // Validate size
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Image size must be less than ${maxSizeMb}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageSelected(result);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelected('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : preview
            ? 'border-slate-700 bg-[#0E1526]'
            : 'border-slate-700/80 hover:border-slate-600 bg-[#0E1526]/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Uploaded preview"
              className="w-24 h-24 rounded-2xl object-cover border border-slate-700 shadow-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-500 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="mt-2 text-center text-xs text-emerald-400 font-medium flex items-center gap-1 justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" /> Click or drop to change
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-full bg-slate-800 text-indigo-400">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-200">
              Drop your image here, or <span className="text-indigo-400 underline">browse</span>
            </div>
            <p className="text-xs text-slate-500">Supported: PNG, JPG, WEBP (Max {maxSizeMb}MB)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-1">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
