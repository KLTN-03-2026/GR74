/**
 * Upload file (PDF, DOCX, XLSX, etc.) to Cloudinary using resource_type=raw
 * Returns array of { url, name, type, size }
 */
export const fileUpload = async (files) => {
  let fileArr = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "zjzvsz6g");
    formData.append("cloud_name", "khoa3112000");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/khoa3112000/raw/upload",
      { method: "POST", body: formData }
    );
    const data = await res.json();

    fileArr.push({
      public_id: data.public_id,
      url: data.secure_url,
      name: file.name,
      fileType: getFileType(file.type),
      size: file.size,
    });
  }
  return fileArr;
};

export const getFileType = (mimeType = "") => {
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("word") || mimeType.includes("docx")) return "docx";
  if (mimeType.includes("spreadsheet") || mimeType.includes("xlsx") || mimeType.includes("excel")) return "xlsx";
  if (mimeType.includes("powerpoint") || mimeType.includes("pptx")) return "pptx";
  return "raw";
};

export const FILE_ICONS = {
  pdf: "📄",
  docx: "📝",
  xlsx: "📊",
  pptx: "📊",
  raw: "📎",
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};
