'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get('/documents');
      setDocuments(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/documents/stats');
      setStats(data);
    } catch (err) { console.error(err); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('category', 'evidence');
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchDocuments();
      await fetchStats();
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const categoryIcons: Record<string, string> = {
    policy: '📜',
    procedure: '📋',
    evidence: '🔍',
    report: '📊',
    contract: '📝',
    training: '🎓',
    other: '📁',
  };

  const statusColors: Record<string, string> = {
    draft: 'text-gray-400 bg-gray-400/10',
    review: 'text-yellow-400 bg-yellow-400/10',
    approved: 'text-green-400 bg-green-400/10',
    archived: 'text-gray-500 bg-gray-500/10',
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-gray-400 mt-1">Manage compliance evidence and policies</p>
        </div>
        <label className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? 'Uploading...' : '+ Upload Document'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Approved', value: stats.byStatus?.approved || 0, color: 'text-green-400' },
            { label: 'In Review', value: stats.byStatus?.review || 0, color: 'text-yellow-400' },
            { label: 'Draft', value: stats.byStatus?.draft || 0, color: 'text-gray-400' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-500 text-sm">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center">
          <p className="text-4xl mb-4">📁</p>
          <p className="text-white font-semibold">No documents yet</p>
          <p className="text-gray-400 text-sm mt-1">Upload your first compliance document</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Document</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Category</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Size</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, i) => (
                <tr key={doc.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-800/10'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span>{categoryIcons[doc.category] || '📁'}</span>
                      <span className="text-white text-sm font-medium truncate max-w-xs">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm capitalize">{doc.category}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{formatFileSize(Number(doc.fileSize))}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[doc.status] || 'text-gray-400 bg-gray-400/10'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(doc.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}