export interface PresignUploadResult {
  uploadUrl: string;
  fileUrl: string;
  expiresIn: number;
  method: 'PUT';
}

export interface StorageFileResult {
  body: NodeJS.ReadableStream;
  contentType?: string;
  contentLength?: number;
}

export interface IStorageProvider {
  getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds?: number
  ): Promise<PresignUploadResult>;
  uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string>;
  getFile(key: string): Promise<StorageFileResult | null>;
  deleteFile(key: string): Promise<void>;
}
