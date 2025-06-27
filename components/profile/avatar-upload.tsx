'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { uploadAvatar } from '@/lib/settings';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userInitials: string;
  onAvatarUpdate: (url: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, userInitials, onAvatarUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        toast.error('You must be logged in to upload an avatar');
        return;
      }

      const { data, error } = await uploadAvatar(user.id, file);
      
      if (error) {
        toast.error('Failed to upload avatar');
        setPreviewUrl(null);
        return;
      }

      if (data?.avatar_url) {
        onAvatarUpdate(data.avatar_url);
        toast.success('Avatar updated successfully!');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={displayUrl || undefined} alt="Profile picture" />
          <AvatarFallback className="text-lg font-semibold bg-gray-100 dark:bg-gray-800 text-black dark:text-white">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        
        {previewUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemovePreview}
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {isUploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              {currentAvatarUrl ? 'Change Photo' : 'Upload Photo'}
            </>
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Recommended: Square image, at least 200x200px, max 5MB
      </p>
    </div>
  );
}