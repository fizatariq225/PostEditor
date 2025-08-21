// utils/preview.js
export function getPreviewData(url) {
  // YouTube
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let videoId = null;

    if (url.includes("v=")) {
      videoId = new URL(url).searchParams.get("v");
    } else {
      videoId = url.split("/").pop();
    }

    return {
      image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      title: "YouTube Video",
      url,
    };
  }

  // Fallback generic preview
  return {
    image: "https://via.placeholder.com/120x80?text=Link",
    title: url,
    url,
  };
}
