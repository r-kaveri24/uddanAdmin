"use client";

import React, { useRef, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js"; // Or import your initialized client
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Eye,
  X,
} from "lucide-react";

// Initialize Supabase Client (Replace with your env variables or import from your lib file)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface NewsItem {
  id: number;
  heading: string;
  description: string;
  images: string[];
}

// Store image item with local file object if uploaded locally
interface ImageItem {
  url: string;
  file?: File;
  isExisting?: boolean; // track images already in Supabase
}

export default function NewsContent() {
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");

  const [images, setImages] = useState<ImageItem[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch News from Supabase on mount
  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching news:", error);
      } else if (data) {
        setNewsList(data);
      }
    };

    fetchNews();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const executeCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  };

  const handleFormatBlock = (event: React.ChangeEvent<HTMLSelectElement>) => {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, event.target.value);
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    editorRef.current?.focus();
    const url = window.prompt("Enter URL:");
    if (url) {
      document.execCommand("createLink", false, url);
      if (editorRef.current) {
        setDescription(editorRef.current.innerHTML);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const selectedFiles = Array.from(files);

    if (images.length + selectedFiles.length > 4) {
      alert("Maximum 4 images are allowed.");
      event.target.value = "";
      return;
    }

    const newImageItems: ImageItem[] = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));

    setImages((prev) => [...prev, ...newImageItems]);
    event.target.value = "";
  };

  // Delete individual image prior to submitting
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const resetForm = () => {
    setHeading("");
    setDescription("");
    setImages([]);
    setEditingId(null);

    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload image files to Supabase Bucket
  const uploadImagesToSupabase = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const item of images) {
      if (item.isExisting) {
        uploadedUrls.push(item.url);
        continue;
      }

      if (item.file) {
        const fileExt = item.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `news/${fileName}`;

        const { error } = await supabase.storage
          .from("news-images")
          .upload(filePath, item.file);

        if (error) {
          console.error("Error uploading image:", error);
          throw error;
        }

        const { data: publicUrlData } = supabase.storage
          .from("news-images")
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrlData.publicUrl);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!heading.trim()) {
      alert("Please enter news heading.");
      return;
    }

    if (!description.trim()) {
      alert("Please enter news description.");
      return;
    }

    try {
      setIsSubmitting(true);
      const imageUrls = await uploadImagesToSupabase();

      if (editingId !== null) {
        // Update Supabase Database
        const { error } = await supabase
          .from("news")
          .update({
            heading,
            description,
            images: imageUrls,
          })
          .eq("id", editingId);

        if (error) throw error;

        setNewsList((previousNews) =>
          previousNews.map((news) =>
            news.id === editingId
              ? { ...news, heading, description, images: imageUrls }
              : news
          )
        );

        alert("News updated successfully.");
      } else {
        // Insert into Supabase Database
        const { data, error } = await supabase
          .from("news")
          .insert([
            {
              heading,
              description,
              images: imageUrls,
            },
          ])
          .select();

        if (error) throw error;

        const insertedItem = data?.[0] || {
          id: Date.now(),
          heading,
          description,
          images: imageUrls,
        };

        setNewsList((previousNews) => [insertedItem, ...previousNews]);
        alert("News submitted successfully.");
      }

      resetForm();
    } catch (err: any) {
      console.error(err);
      alert("An error occurred while saving: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (news: NewsItem) => {
    setHeading(news.heading);
    setDescription(news.description);
    setImages(
      news.images.map((url) => ({
        url,
        isExisting: true,
      }))
    );
    setEditingId(news.id);

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = news.description;
      }
    }, 0);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  // Helper to extract bucket file paths from public URLs
  const getStoragePathFromUrl = (url: string) => {
    const parts = url.split("/news-images/");
    return parts.length > 1 ? parts[1] : null;
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;

    try {
      const targetNews = newsList.find((item) => item.id === deleteId);

      // 1. Remove images from Supabase storage
      if (targetNews && targetNews.images.length > 0) {
        const filePaths = targetNews.images
          .map((url) => getStoragePathFromUrl(url))
          .filter((path): path is string => path !== null);

        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from("news-images")
            .remove(filePaths);

          if (storageError) {
            console.error("Storage delete warning:", storageError);
          }
        }
      }

      // 2. Remove record from Database
      const { error: dbError } = await supabase
        .from("news")
        .delete()
        .eq("id", deleteId);

      if (dbError) throw dbError;

      setNewsList((previousNews) =>
        previousNews.filter((news) => news.id !== deleteId)
      );

      setDeleteId(null);
      alert("News deleted successfully.");
    } catch (err: any) {
      console.error(err);
      alert("Error deleting news: " + err.message);
    }
  };

  const handlePreview = () => {
    if (!heading.trim()) {
      alert("Please enter news heading.");
      return;
    }

    if (!description.trim()) {
      alert("Please enter news description.");
      return;
    }

    const previewNews: NewsItem = {
      id: editingId ?? Date.now(),
      heading,
      description,
      images: images.map((img) => img.url),
    };

    setSelectedNews(previewNews);
    setShowPreview(true);
  };

  const handleTablePreview = (news: NewsItem) => {
    setSelectedNews(news);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen w-full bg-[#eef2eb] p-6 text-[#17233c]">
      <section className="w-full rounded-lg border border-[#dfe4df] bg-white p-7 shadow-sm">
        <div className="mb-6">
          <h2 className="text-[24px] font-semibold text-[#183153]">
            {editingId !== null ? "Edit News" : "Create News"}
          </h2>
          <div className="mt-3 h-[2px] w-full bg-[#e4e7e5]" />
        </div>

        <div className="mb-6 w-full">
          <label
            htmlFor="news-heading"
            className="mb-2 block text-[14px] font-semibold text-[#263957]"
          >
            Heading
          </label>
          <input
            id="news-heading"
            type="text"
            value={heading}
            placeholder="Enter news heading"
            onChange={(event) => setHeading(event.target.value)}
            className="h-[46px] w-full rounded-md border border-[#d9dee4] bg-white px-4 text-[14px] text-[#333] outline-none transition focus:border-[#d7a400] focus:ring-1 focus:ring-[#d7a400]"
          />
        </div>

        <div className="mb-7 w-full">
          <label className="mb-2 block text-[14px] font-semibold text-[#263957]">
            Description
          </label>
          <div className="w-full overflow-hidden rounded-md border border-[#d9dee4] bg-white">
            <div className="flex min-h-[52px] flex-wrap items-center gap-2 border-b border-[#e1e4e7] bg-[#fafafa] p-2">
              <button
                type="button"
                title="Undo"
                onClick={() => executeCommand("undo")}
                className="flex h-[36px] w-[38px] items-center justify-center rounded border border-[#d8dde2] bg-white text-[18px] text-[#27364c] hover:bg-[#f0f0f0]"
              >
                ↶
              </button>
              <button
                type="button"
                title="Redo"
                onClick={() => executeCommand("redo")}
                className="flex h-[36px] w-[38px] items-center justify-center rounded border border-[#d8dde2] bg-white text-[18px] text-[#27364c] hover:bg-[#f0f0f0]"
              >
                ↷
              </button>
              <select
                defaultValue="p"
                onChange={handleFormatBlock}
                className="h-[36px] w-[130px] rounded border border-[#d8dde2] bg-white px-2 text-[13px] text-[#27364c] outline-none"
              >
                <option value="p">Paragraph</option>
                <option value="h2">Heading</option>
                <option value="h3">Sub Heading</option>
              </select>
              <button
                type="button"
                title="Bold"
                onClick={() => executeCommand("bold")}
                className="flex h-[36px] w-[38px] items-center justify-center rounded border border-[#d8dde2] bg-white text-[#27364c] hover:bg-[#f0f0f0]"
              >
                <Bold size={17} />
              </button>
              <button
                type="button"
                title="Italic"
                onClick={() => executeCommand("italic")}
                className="flex h-[36px] w-[38px] items-center justify-center rounded border border-[#d8dde2] bg-white text-[#27364c] hover:bg-[#f0f0f0]"
              >
                <Italic size={17} />
              </button>
              <button
                type="button"
                title="Underline"
                onClick={() => executeCommand("underline")}
                className="flex h-[36px] w-[38px] items-center justify-center rounded border border-[#d8dde2] bg-white text-[#27364c] hover:bg-[#f0f0f0]"
              >
                <Underline size={17} />
              </button>
              <button
                type="button"
                title="Strikethrough"
                onClick={() => executeCommand("strikeThrough")}
                className="flex h-[36px] w-[38px] items-center justify-center rounded border border-[#d8dde2] bg-white text-[#27364c] hover:bg-[#f0f0f0]"
              >
                <Strikethrough size={17} />
              </button>

              <div className="mx-1 h-7 w-px bg-[#d9dee4]" />

              <button
                type="button"
                title="Align left"
                onClick={() => executeCommand("justifyLeft")}
                className="flex h-[36px] w-[38px] items-center justify-center rounded border border-[#d8dde2] bg-white text-[#27364c] hover:bg-[#f0f0f0]"
              >
                <AlignLeft size={17} />
              </button>
              <button
                type="button"
                title="Align center"
                onClick={() => executeCommand("justifyCenter")}
                className="flex h-[36px] w-[38px] items-center justify-center rounded border border-[#d8dde2] bg-white text-[#27364c] hover:bg-[#f0f0f0]"
              >
                <AlignCenter size={17} />
              </button>
              <button
                type="button"
                title="Align right"
                onClick={() => executeCommand("justifyRight")}
                className="flex h-[36px] w-[38px] items-center justify-center rounded border border-[#d8dde2] bg-white text-[#27364c] hover:bg-[#f0f0f0]"
              >
                <AlignRight size={17} />
              </button>

              <div className="mx-1 h-7 w-px bg-[#d9dee4]" />

              <button
                type="button"
                title="Bullet list"
                onMouseDown={(event) => {
                  event.preventDefault();
                  executeCommand("insertUnorderedList");
                }}
                className="flex h-[36px] w-[38px] items-center justify-center rounded border border-[#d8dde2] bg-white text-[#27364c] hover:bg-[#f0f0f0]"
              >
                <List size={18} />
              </button>
              <button
                type="button"
                title="Numbered list"
                onMouseDown={(event) => {
                  event.preventDefault();
                  executeCommand("insertOrderedList");
                }}
                className="flex h-[36px] w-[38px] items-center justify-center rounded border border-[#d8dde2] bg-white text-[#27364c] hover:bg-[#f0f0f0]"
              >
                <ListOrdered size={18} />
              </button>
              <button
                type="button"
                title="Insert link"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleLink}
                className="flex h-[36px] w-[38px] items-center justify-center rounded border border-[#d8dde2] bg-white text-[#27364c] hover:bg-[#f0f0f0]"
              >
                <LinkIcon size={17} />
              </button>
            </div>

            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Write your news description..."
              onInput={(event) => setDescription(event.currentTarget.innerHTML)}
              className="min-h-[220px] w-full overflow-y-auto p-5 text-[15px] leading-7 text-[#333] outline-none empty:before:pointer-events-none empty:before:text-[#bfc5cb] empty:before:content-[attr(data-placeholder)] [&_a]:text-blue-600 [&_a]:underline [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:my-2 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:my-1 [&_li]:ml-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-7 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-7"
            />
          </div>
        </div>

        <div className="mb-7 flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="w-[130px] shrink-0">
            <label className="mb-2 block text-[14px] font-semibold text-[#263957]">
              Upload Images
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex h-[100px] w-[130px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-[#dfa800] bg-[#fffdf6] text-[#d49b00] transition hover:bg-[#fff8df]"
            >
              <ImageIcon size={28} />
              <span className="mt-1 text-[26px] leading-none">↑</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleImageUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 h-[42px] w-[130px] rounded-md bg-[#dba400] text-[13px] font-medium text-white transition hover:bg-[#c49000]"
            >
              Upload
            </button>
          </div>

          {/* Image Previews with Delete (X) icon */}
          <div className="grid w-full max-w-[560px] grid-cols-2 gap-4">
            {images.slice(0, 4).map((imageObj, index) => (
              <div
                key={`${imageObj.url}-${index}`}
                className="group relative h-[125px] w-full overflow-hidden rounded-md border border-[#dfe3e6] bg-[#f5f6f6]"
              >
                <img
                  src={imageObj.url}
                  alt={`News upload ${index + 1}`}
                  onClick={() => setPreviewImage(imageObj.url)}
                  className="block h-full w-full cursor-pointer object-cover"
                />
                {/* Delete / Remove Image Button */}
                <button
                  type="button"
                  title="Remove image"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {Array.from({ length: 4 - images.slice(0, 4).length }).map(
              (_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex h-[125px] w-full items-center justify-center rounded-md border border-dashed border-[#d9dee4] bg-[#fafafa]"
                >
                  <span className="text-[13px] text-[#b8bec6]">
                    Image {images.length + index + 1}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-[44px] min-w-[105px] rounded-md border border-[#d6a000] bg-[#dba400] px-6 text-[13px] font-semibold text-white transition hover:bg-[#c28e00] disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : editingId !== null
              ? "Update"
              : "Submit"}
          </button>

          <button
            type="button"
            onClick={handlePreview}
            className="flex h-[44px] min-w-[105px] items-center justify-center gap-2 rounded-md border border-[#dba400] bg-white px-6 text-[13px] font-semibold text-[#c28e00] transition hover:bg-[#fff9e7]"
          >
            <Eye size={17} />
            Preview
          </button>

          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="h-[44px] min-w-[105px] rounded-md border border-[#cfcfcf] bg-white px-6 text-[13px] font-medium text-[#666] hover:bg-[#f5f5f5]"
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      {/* List Table */}
      <section className="mt-6 w-full rounded-lg border border-[#dfe4df] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[21px] font-semibold text-[#20395d]">
            News Card List
          </h3>
          <span className="rounded-full bg-[#fff8df] px-4 py-1.5 text-[12px] font-medium text-[#b88400]">
            {newsList.length} News
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="bg-[#f6f7f9]">
                <th className="h-[52px] border-b border-[#e2e5e8] px-4 text-left text-[13px] font-semibold text-[#253a58]">
                  Sr.No
                </th>
                <th className="border-b border-[#e2e5e8] px-4 text-left text-[13px] font-semibold text-[#253a58]">
                  Heading
                </th>
                <th className="border-b border-[#e2e5e8] px-4 text-left text-[13px] font-semibold text-[#253a58]">
                  Image
                </th>
                <th className="border-b border-[#e2e5e8] px-4 text-center text-[13px] font-semibold text-[#253a58]">
                  Preview
                </th>
                <th className="border-b border-[#e2e5e8] px-4 text-left text-[13px] font-semibold text-[#253a58]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {newsList.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="h-[110px] border-b border-[#e8eaec] text-center text-[13px] text-[#bfc3c8]"
                  >
                    No news available
                  </td>
                </tr>
              ) : (
                newsList.map((news, index) => (
                  <tr
                    key={news.id}
                    className="transition hover:bg-[#fcfcfb]"
                  >
                    <td className="border-b border-[#e8eaec] px-4 py-4 text-[13px] text-[#555]">
                      {index + 1}
                    </td>
                    <td className="border-b border-[#e8eaec] px-4 py-4">
                      <div className="max-w-[350px] truncate text-[14px] font-medium text-[#263957]">
                        {news.heading}
                      </div>
                    </td>
                    <td className="border-b border-[#e8eaec] px-4 py-4">
                      {news.images.length > 0 ? (
                        <img
                          src={news.images[0]}
                          alt={news.heading}
                          onClick={() => setPreviewImage(news.images[0])}
                          className="h-[65px] w-[100px] cursor-pointer rounded-md object-cover shadow-sm"
                        />
                      ) : (
                        <span className="text-[12px] text-[#a7adb4]">
                          No Image
                        </span>
                      )}
                    </td>
                    <td className="border-b border-[#e8eaec] px-4 py-4 text-center">
                      <button
                        type="button"
                        title="Preview News"
                        onClick={() => handleTablePreview(news)}
                        className="inline-flex h-[38px] w-[42px] items-center justify-center rounded-md border border-[#b9c5d3] bg-[#f7f9fb] text-[#39526f] transition hover:border-[#dba400] hover:bg-[#fff8df] hover:text-[#c28e00]"
                      >
                        <Eye size={19} />
                      </button>
                    </td>
                    <td className="border-b border-[#e8eaec] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          title="Edit News"
                          onClick={() => handleEdit(news)}
                          className="flex h-[38px] w-[42px] items-center justify-center rounded-md border border-[#e0b33b] bg-[#fffaf0] text-[#c39200] transition hover:bg-[#fff0c7]"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          title="Delete News"
                          onClick={() => handleDeleteClick(news.id)}
                          className="flex h-[38px] w-[42px] items-center justify-center rounded-md border border-[#e2a2a2] bg-[#fff7f7] text-[#d04444] transition hover:bg-[#ffe3e3]"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(15,25,40,0.50)] p-5"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="w-full max-w-[430px] rounded-xl bg-white p-8 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#fff0f0] text-[#d44747]">
              <Trash2 size={27} />
            </div>
            <h3 className="mb-2 text-[21px] font-semibold text-[#1e2d45]">
              Delete News?
            </h3>
            <p className="mb-7 text-[14px] leading-6 text-[#777]">
              Are you sure you want to delete this news? This action cannot be
              undone and will remove stored images.
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="h-[42px] min-w-[100px] rounded-md border border-[#cccccc] bg-white px-5 text-[13px] font-medium text-[#555] hover:bg-[#f5f5f5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="h-[42px] min-w-[100px] rounded-md border border-[#d64a4a] bg-[#d64a4a] px-5 text-[13px] font-semibold text-white hover:bg-[#bd3939]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedNews && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-[rgba(15,25,40,0.55)] p-5"
          onClick={() => setShowPreview(false)}
        >
          {/* Modal Box */}
          <div
            className="relative flex max-h-[90vh] w-full max-w-[900px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* FIXED HEADER: Stays pinned at top */}
            <div className="flex items-center justify-between border-b border-[#eef2f5] bg-white p-6 pb-4">
              <div className="inline-flex rounded-full bg-[#fff8df] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-[#b88400]">
                News Preview
              </div>
              <button
                type="button"
                title="Close"
                onClick={() => setShowPreview(false)}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f2f2f2] text-[#333] transition hover:bg-[#e5e5e5]"
              >
                <X size={20} />
              </button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <h2 className="mb-6 text-[30px] font-bold leading-tight text-[#1c304f]">
                {selectedNews.heading}
              </h2>

              <div
                className="prose prose-sm max-w-none text-[15px] leading-7 text-[#444]"
                dangerouslySetInnerHTML={{
                  __html: selectedNews.description,
                }}
              />

              {selectedNews.images.length > 0 && (
                <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {selectedNews.images.slice(0, 4).map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`Preview ${index + 1}`}
                      onClick={() => setPreviewImage(image)}
                      className="h-[230px] w-full cursor-pointer rounded-lg object-cover shadow-sm transition hover:opacity-90"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Single Image Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[rgba(0,0,0,0.85)] p-8"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            title="Close image"
            onClick={() => setPreviewImage(null)}
            className="absolute right-7 top-7 flex h-[45px] w-[45px] items-center justify-center rounded-full bg-white text-[#333] shadow-lg hover:bg-[#f2f2f2]"
          >
            <X size={23} />
          </button>
          <img
            src={previewImage}
            alt="Large preview"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}