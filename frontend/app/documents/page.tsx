
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eye,
  FileText,
  FileUp,
  File,
  Trash2,
  RefreshCw,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Database,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type DocumentItem = {
  file_name: string;
  file_size_kb: number;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replacingFile, setReplacingFile] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/document/`);

      if (!response.ok) {
        throw new Error("Unable to fetch documents.");
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // View document
  const handleView = (filename: string) => {
    const url = `${API_URL}/document/view/${encodeURIComponent(filename)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Upload document
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file.");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/document/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Document upload failed.");
      }

      setMessage(
        `Document uploaded and indexed successfully. ${data.total_chunks} chunks created.`
      );

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchDocuments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  // Delete document
  const handleDelete = async (filename: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${filename}? This will also delete its indexed chunks.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/document/${encodeURIComponent(filename)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Document deletion failed.");
      }

      setMessage(data.message || "Document deleted successfully.");
      await fetchDocuments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Deletion failed."
      );
    }
  };

  // Open replace file picker
  const openReplacePicker = (filename: string) => {
    setReplacingFile(filename);

    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
      replaceInputRef.current.click();
    }
  };

  // Replace document
  const handleReplace = async (file: File | null) => {
    if (!file || !replacingFile) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed.");
      setReplacingFile(null);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/document/replace/${encodeURIComponent(replacingFile)}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Document replacement failed.");
      }

      setMessage(
        `Document replaced successfully. ${data.total_chunks} chunks indexed.`
      );

      await fetchDocuments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Replacement failed."
      );
    } finally {
      setUploading(false);
      setReplacingFile(null);
    }
  };

  // Search documents
  const filteredDocuments = documents.filter((doc) =>
    doc.file_name.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate total storage
  const totalSize = documents.reduce(
    (total, doc) => total + doc.file_size_kb,
    0
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Documents
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage documents used by your AI knowledge base.
        </p>
      </div>

      {/* Success Message */}
      {message && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
          <CheckCircle size={18} />
          <span>{message}</span>
          <button
            onClick={() => setMessage("")}
            className="ml-auto"
            aria-label="Dismiss success message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="ml-auto"
            aria-label="Dismiss error message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between">
            <p className="text-sm text-slate-500">
              Total Documents
            </p>
            <FileText size={22} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-3">
            {documents.length}
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between">
            <p className="text-sm text-slate-500">
              Indexed Documents
            </p>
            <Database size={22} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-3">
            {documents.length}
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between">
            <p className="text-sm text-slate-500">
              Total Storage
            </p>
            <File size={22} className="text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-3">
            {totalSize >= 1024
              ? `${(totalSize / 1024).toFixed(2)} MB`
              : `${totalSize.toFixed(2)} KB`}
          </h2>
        </div>

      </div>

      {/* Upload Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">

        <div className="flex items-center gap-2 mb-4">
          <FileUp size={20} className="text-blue-600" />
          <h2 className="font-semibold text-slate-800">
            Upload Document
          </h2>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">

          <FileUp size={36} className="mx-auto text-slate-400" />

          <p className="font-medium text-slate-700 mt-3">
            Select a PDF document
          </p>

          <p className="text-sm text-slate-400 mt-1">
            The document will be processed and indexed in ChromaDB.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) =>
              setSelectedFile(e.target.files?.[0] || null)
            }
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-5 px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Browse Files
          </button>

          {selectedFile && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-700">
              <FileText size={18} className="text-red-500" />
              {selectedFile.name}
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                aria-label="Remove selected file"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="block mx-auto mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Processing..." : "Upload Document"}
          </button>

          <p className="text-xs text-slate-400 mt-3">
            PDF files only
          </p>

        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <div className="p-5 flex flex-col sm:flex-row gap-3 justify-between sm:items-center">

          <div>
            <h2 className="font-semibold text-slate-800">
              Uploaded Documents
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {documents.length} documents available
            </p>
          </div>

          <div className="flex gap-2">

            {/* Search */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={fetchDocuments}
              disabled={loading}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              title="Refresh documents"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
            </button>

          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">

          <table className="w-full text-sm text-left">

            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4">Document</th>
                <th className="px-5 py-4">File Type</th>
                <th className="px-5 py-4">File Size</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    Loading documents...
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr
                    key={doc.file_name}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                          <FileText
                            size={20}
                            className="text-red-500"
                          />
                        </div>
                        <span className="font-medium text-slate-700">
                          {doc.file_name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      PDF
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {doc.file_size_kb >= 1024
                        ? `${(doc.file_size_kb / 1024).toFixed(2)} MB`
                        : `${doc.file_size_kb.toFixed(2)} KB`}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle size={13} />
                        Available
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">

                        {/* View */}
                        <button
                          onClick={() => handleView(doc.file_name)}
                          title="View document"
                          aria-label={`View ${doc.file_name}`}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Eye size={17} />
                        </button>

                        {/* Replace */}
                        <button
                          onClick={() =>
                            openReplacePicker(doc.file_name)
                          }
                          disabled={uploading}
                          title="Replace document"
                          aria-label={`Replace ${doc.file_name}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                        >
                          <RefreshCw size={17} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(doc.file_name)}
                          disabled={uploading}
                          title="Delete document"
                          aria-label={`Delete ${doc.file_name}`}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

        <div className="p-4 border-t border-slate-100 text-sm text-slate-500">
          Showing {filteredDocuments.length} of {documents.length} documents
        </div>

      </div>

      {/* Hidden replacement file input */}
      <input
        ref={replaceInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => handleReplace(e.target.files?.[0] || null)}
      />

    </div>
  );
}
