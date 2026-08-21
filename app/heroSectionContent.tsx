"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, Trash2, UploadCloud, FileImage,X } from "lucide-react";
import { supabase } from "../lib/supabase"; // Adjust this import path based on where you put step 2

interface UploadedFile {
  id: string;
  name: string;
  url: string;
}

export default function HeroSectionContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State variables
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal tracking state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null);

  // 1. Fetch current database files on component load
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    // Replace 'hero_banners' with your actual table name if storing metadata
    const { data, error } = await supabase.from("hero_banners").select("*");
    if (!error && data) {
      setFileList(data);
    }
  };

  // 2. Trigger native mobile/desktop file manager window
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create local temporary preview string
    }
  };

  // 3. Process Upload Submission to Supabase Storage Bucket
  const handleSubmit = async () => {
    if (!selectedFile) return alert("Please pick an asset file first!");
    setLoading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      // Upload binary payload directly to Supabase storage bucket
      const { error: uploadError } = await supabase.storage
        .from("hero-banners")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL link
      const { data: urlData } = supabase.storage.from("hero-banners").getPublicUrl(filePath);

      // Save record to your structural metadata table
      const { data: dbData, error: dbError } = await supabase
        .from("hero_banners")
        .insert([{ name: selectedFile.name, url: urlData.publicUrl, storage_path: filePath }])
        .select();

      if (dbError) throw dbError;

      // Clear layout preview blocks and append to view list
      if (dbData) setFileList([dbData[0], ...fileList]);
      setSelectedFile(null);
      setPreviewUrl(null);
      alert("Asset uploaded successfully!");
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete Flow Handlers
  const triggerDeleteConfirmation = (file: UploadedFile) => {
    setFileToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    
    try {
      // Delete record row from database table
      await supabase.from("hero_banners").delete().eq("id", fileToDelete.id);
      
      // Filter out of view state layer
      setFileList(fileList.filter(item => item.id !== fileToDelete.id));
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
    } catch (err) {
      console.error("Error deleting target asset:", err);
    }
  };

  // Helper logic to cleanly truncate name length with ellipsis (...)
  const truncateFilename = (name: string, maxLen = 26) => {
    if (name.length <= maxLen) return name;
    const extIndex = name.lastIndexOf(".");
    const ext = extIndex !== -1 ? name.substring(extIndex) : "";
    return name.substring(0, maxLen - ext.length - 3) + "..." + ext;
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-2xl border border-gray-100 p-6 md:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative min-h-[520px]">
      
      {/* Hidden input field targeting runtime file browser openings */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      {/* LEFT HALF: UPLOAD CONTROLLER INTERFACE */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div 
          onClick={handleUploadClick}
          className="w-full border-2 border-dashed border-blue-400 rounded-2xl p-8 bg-white flex flex-col items-center justify-center min-h-[300px] text-center cursor-pointer hover:bg-slate-50/50 transition-colors"
        >
          {previewUrl ? (
            <div className="w-full max-h-[220px] overflow-hidden rounded-lg flex flex-col items-center gap-2">
              <img src={previewUrl} alt="Preview Window" className="max-h-[160px] object-contain rounded border shadow-2xs" />
              <p className="text-xs text-emerald-600 font-medium truncate max-w-full px-4">✓ Selected: {selectedFile?.name}</p>
            </div>
          ) : (
            <>
              <UploadCloud className="w-14 h-14 text-blue-900 mb-4" strokeWidth={1.5} />
              <button className="bg-[#242A75] text-white font-medium px-8 py-2.5 rounded-full text-sm hover:bg-opacity-90 transition-all shadow-xs">
                Upload File
              </button>
              <p className="text-gray-400 text-xs mt-3">Drag a image here</p>
            </>
          )}
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={loading || !selectedFile}
          className={`mt-6 bg-[#242A75] text-white font-medium px-12 py-2.5 rounded-lg text-sm hover:bg-opacity-90 transition-all ${(!selectedFile || loading) && "opacity-50 cursor-not-allowed"}`}
        >
          {loading ? "Uploading..." : "Submit"}
        </button>
      </div>

      {/* RIGHT HALF: LIVE SCROLLABLE FILES LIST CONTAINER */}
      <div className="lg:col-span-5 w-full flex flex-col">
        <h3 className="text-gray-800 font-bold mb-4 text-base tracking-tight">Uploaded Files</h3>
        
        {/* Scroll Box Area activated automatically when files overflow capacity */}
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar scrollbar-thin">
          {fileList.length === 0 ? (
            <p className="text-gray-400 text-xs italic p-4 text-center border rounded-lg bg-gray-50/50">No files uploaded yet</p>
          ) : (
            fileList.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-white shadow-3xs hover:border-gray-200 transition-all">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileImage className="w-5 h-5 text-blue-900 shrink-0" />
                  <span className="text-sm font-medium text-gray-600 truncate" title={file.name}>
                    {truncateFilename(file.name)}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <a href={file.url} target="_blank" rel="noreferrer" className="text-blue-900 hover:opacity-70 transition-opacity" title="View file">
                    <Eye className="w-[18px] h-[18px]" />
                  </a>
                  <button onClick={() => triggerDeleteConfirmation(file)} className="text-red-500 hover:opacity-70 transition-opacity" title="Delete file">
                    <Trash2 className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* =========================================================================
          CONFIRMATION MODAL INTERFACE (Matches task assignment mock view screenshot)
          ========================================================================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-xl border border-gray-100 transform scale-100 transition-transform">
            <button 
              onClick={() => { setIsDeleteModalOpen(false); setFileToDelete(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-lg font-bold text-gray-900 mb-6 px-4 leading-snug">
              Are you sure you want to delete?
            </h4>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setFileToDelete(null); }}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-w-[90px]"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors min-w-[90px]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}