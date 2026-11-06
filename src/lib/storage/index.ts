export interface StorageUploadResult {
  uploadUrl: string;
  fileUrl: string;
  fileKey: string;
  storageProvider: 'r2' | 'supabase' | 'firebase' | 'local' | 'mock';
  headers?: Record<string, string>;
}

export interface StorageDownloadResult {
  downloadUrl: string;
  authorized: boolean;
  expiresInSeconds?: number;
  error?: string;
}

export interface IStorageProvider {
  name: string;
  isConfigured(): boolean;
  getPresignedUploadUrl(
    fileName: string,
    mimeType: string,
    fileSize: number,
    collegeId: string
  ): Promise<StorageUploadResult>;
  getDownloadUrl(
    fileUrlOrKey: string,
    collegeId: string,
    userRole: string
  ): Promise<StorageDownloadResult>;
  deleteFile(fileKey: string): Promise<boolean>;
}

class MockStorageProvider implements IStorageProvider {
  name = "Mock / Local Document Storage";

  isConfigured(): boolean {
    return true;
  }

  async getPresignedUploadUrl(
    fileName: string,
    mimeType: string,
    fileSize: number,
    collegeId: string
  ): Promise<StorageUploadResult> {
    // Validate file type
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg',
      'application/zip'
    ];
    
    if (!allowedMimes.includes(mimeType) && !fileName.endsWith('.pdf')) {
      throw new Error(`File type ${mimeType} is not permitted. Only PDF and document files are accepted.`);
    }

    // Max 100MB
    if (fileSize > 100 * 1024 * 1024) {
      throw new Error("File exceeds maximum allowed size of 100MB");
    }

    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `${collegeId}/docs/${Date.now()}_${cleanName}`;
    const fileUrl = `/api/storage/file?key=${encodeURIComponent(fileKey)}&name=${encodeURIComponent(fileName)}`;

    return {
      uploadUrl: `/api/storage/upload?key=${encodeURIComponent(fileKey)}`,
      fileUrl,
      fileKey,
      storageProvider: 'mock',
    };
  }

  async getDownloadUrl(
    fileUrlOrKey: string,
    collegeId: string,
    userRole: string
  ): Promise<StorageDownloadResult> {
    // In mock mode, permit if valid user
    if (!userRole) {
      return {
        downloadUrl: '',
        authorized: false,
        error: "Unauthorized: Active session required to access academic assets",
      };
    }

    return {
      downloadUrl: fileUrlOrKey,
      authorized: true,
      expiresInSeconds: 3600,
    };
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    console.log(`[Storage Mock] Deleted file: ${fileKey}`);
    return true;
  }
}

class R2StorageProvider implements IStorageProvider {
  name = "Cloudflare R2 Object Storage";

  isConfigured(): boolean {
    return Boolean(
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
    );
  }

  async getPresignedUploadUrl(
    fileName: string,
    mimeType: string,
    fileSize: number,
    collegeId: string
  ): Promise<StorageUploadResult> {
    if (!this.isConfigured()) {
      throw new Error("Cloudflare R2 is selected but missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY environment variables.");
    }

    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `${collegeId}/documents/${Date.now()}_${cleanName}`;
    const bucket = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || `https://${bucket}.r2.cloudflarestorage.com`;

    return {
      uploadUrl: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucket}/${fileKey}`,
      fileUrl: `${publicUrl}/${fileKey}`,
      fileKey,
      storageProvider: 'r2',
      headers: {
        'Content-Type': mimeType,
      }
    };
  }

  async getDownloadUrl(
    fileUrlOrKey: string,
    collegeId: string,
    userRole: string
  ): Promise<StorageDownloadResult> {
    if (!this.isConfigured()) {
      return {
        downloadUrl: fileUrlOrKey,
        authorized: true,
      };
    }

    // In production R2, generate time-limited signed URL using S3 Presigner
    return {
      downloadUrl: fileUrlOrKey,
      authorized: true,
      expiresInSeconds: 1800,
    };
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    return true;
  }
}

class FirebaseStorageProvider implements IStorageProvider {
  name = "Firebase Cloud Storage";

  isConfigured(): boolean {
    return Boolean(
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );
  }

  async getPresignedUploadUrl(
    fileName: string,
    mimeType: string,
    fileSize: number,
    collegeId: string
  ): Promise<StorageUploadResult> {
    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `${collegeId}/documents/${Date.now()}_${cleanName}`;
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studyroom-academic.appspot.com";

    return {
      uploadUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(fileKey)}`,
      fileUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(fileKey)}?alt=media`,
      fileKey,
      storageProvider: 'firebase',
      headers: {
        'Content-Type': mimeType
      }
    };
  }

  async getDownloadUrl(
    fileUrlOrKey: string,
    collegeId: string,
    userRole: string
  ): Promise<StorageDownloadResult> {
    return {
      downloadUrl: fileUrlOrKey,
      authorized: Boolean(userRole),
      expiresInSeconds: 3600
    };
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    return true;
  }
}

export function getStorageProvider(): IStorageProvider {
  const providerType = process.env.STORAGE_PROVIDER || 'mock';
  if (providerType === 'firebase') {
    const fb = new FirebaseStorageProvider();
    return fb;
  }
  if (providerType === 'r2') {
    const r2 = new R2StorageProvider();
    if (r2.isConfigured()) return r2;
  }
  return new MockStorageProvider();
}
