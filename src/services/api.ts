const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface PodcastGenerateResponse {
  success: boolean;
  filename?: string;
  script?: string;
  audio?: string;
  audio_format?: string;
  pages_processed?: number;
  processing_time?: number;
  audio_duration?: number;
  model_used?: string;
  error?: {
    code: string;
    message: string;
  };
}

export async function generatePodcast(file: File): Promise<PodcastGenerateResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/podcast/generate`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    return {
      success: false,
      error: data.error || { code: "HTTP_ERROR", message: `Status ${response.status}` },
    };
  }
  return data;
}
