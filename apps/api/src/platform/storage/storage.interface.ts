export interface PresignUploadResult {
  uploadUrl: string;
  fileUrl: string;
  expiresIn: number;
  method: 'PUT';
}

export interface IStorageProvider {
  getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds?: number
  ): Promise<PresignUploadResult>;
  deleteFile(key: string): Promise<void>;
}
