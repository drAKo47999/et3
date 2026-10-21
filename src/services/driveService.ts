import { BackupData } from '../types';
import { getAccessToken } from './auth';

const BACKUP_FILENAME = 'monet_expense_backup.json';

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

// Check if backup file exists in Google Drive
export async function findDriveBackupFile(): Promise<DriveFileInfo | null> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const query = encodeURIComponent(`name = '${BACKUP_FILENAME}' and trashed = false`);
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)&pageSize=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to search Google Drive');
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0];
  }
  return null;
}

// Upload / Update backup in Google Drive
export async function uploadBackupToDrive(backupData: BackupData): Promise<DriveFileInfo> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const content = JSON.stringify(backupData, null, 2);
  const existingFile = await findDriveBackupFile();

  if (existingFile) {
    // Update existing file content
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: content,
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to update Google Drive file');
    }

    const updated = await response.json();
    return {
      id: updated.id,
      name: updated.name || BACKUP_FILENAME,
      modifiedTime: new Date().toISOString(),
    };
  } else {
    // Create new file using multipart upload
    const metadata = {
      name: BACKUP_FILENAME,
      mimeType: 'application/json',
      description: 'Monet Expense Tracker Data Backup',
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      content +
      closeDelimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to upload backup to Google Drive');
    }

    const created = await response.json();
    return {
      id: created.id,
      name: created.name || BACKUP_FILENAME,
      modifiedTime: new Date().toISOString(),
    };
  }
}

// Download backup content from Google Drive
export async function downloadBackupFromDrive(fileId: string): Promise<BackupData> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to download backup from Google Drive');
  }

  const raw = await response.json();
  if (!raw || !Array.isArray(raw.expenses)) {
    throw new Error('Invalid backup file format downloaded from Google Drive');
  }
  return raw as BackupData;
}
