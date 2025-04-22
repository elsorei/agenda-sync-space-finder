
export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}
