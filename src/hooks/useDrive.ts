import { useState, useCallback } from 'react';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

export function useDrive() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/drive/files', window.location.origin);
      if (query) url.searchParams.set('q', query);
      
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch files');
      
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/drive/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Upload failed');
      await fetchFiles(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFiles]);

  return { files, loading, error, fetchFiles, uploadFile };
}
