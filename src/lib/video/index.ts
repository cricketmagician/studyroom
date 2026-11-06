import { VideoChapter } from "@/types/database";

export interface VideoDirectUploadResult {
  uploadUrl: string;
  assetId: string;
  playbackId?: string;
  streamUrl?: string;
  provider: 'mux' | 'stream' | 'external' | 'mock';
}

export interface VideoPlaybackInfo {
  playbackUrl: string;
  posterUrl?: string;
  durationSeconds: number;
  aspectRatio: string;
  status: 'ready' | 'preparing' | 'error';
  chapters: VideoChapter[];
  subtitlesUrl?: string;
}

export interface IVideoProvider {
  name: string;
  isConfigured(): boolean;
  createDirectUpload(courseId: string, lessonId: string): Promise<VideoDirectUploadResult>;
  getPlaybackInfo(assetIdOrPlaybackId: string): Promise<VideoPlaybackInfo>;
  handleWebhook(rawBody: string, signature: string): Promise<{ event: string; assetId: string; status: string }>;
}

class MockVideoProvider implements IVideoProvider {
  name = "Mock Academic Video Streaming Provider";

  isConfigured(): boolean {
    return true;
  }

  async createDirectUpload(courseId: string, lessonId: string): Promise<VideoDirectUploadResult> {
    const assetId = `mock_asset_${Date.now()}`;
    const playbackId = `mock_pb_${Date.now()}`;

    return {
      uploadUrl: `/api/video/upload?assetId=${assetId}`,
      assetId,
      playbackId,
      streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      provider: 'mock'
    };
  }

  async getPlaybackInfo(assetIdOrPlaybackId: string): Promise<VideoPlaybackInfo> {
    return {
      playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      posterUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
      durationSeconds: 596,
      aspectRatio: "16:9",
      status: "ready",
      chapters: [
        { id: "c1", title: "Introduction & Foundational Concepts", timestamp_seconds: 0, description: "Overview of core topics covered in this module" },
        { id: "c2", title: "Theoretical Framework & Model", timestamp_seconds: 145, description: "Detailed derivation and system architecture" },
        { id: "c3", title: "Real-world Case Studies & Analysis", timestamp_seconds: 320, description: "Applying theoretical concepts to modern scenarios" },
        { id: "c4", title: "Summary, Next Steps & Assignment", timestamp_seconds: 490, description: "Key takeaways and next assignment instructions" }
      ]
    };
  }

  async handleWebhook(rawBody: string, signature: string) {
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      parsed = { type: 'video.asset.ready', id: 'mock_asset' };
    }
    return {
      event: parsed.type || 'video.asset.ready',
      assetId: parsed.data?.id || 'mock_asset',
      status: 'ready'
    };
  }
}

class MuxVideoProvider implements IVideoProvider {
  name = "Mux Video Streaming";

  isConfigured(): boolean {
    return Boolean(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET);
  }

  async createDirectUpload(courseId: string, lessonId: string): Promise<VideoDirectUploadResult> {
    if (!this.isConfigured()) {
      throw new Error("Mux is selected but MUX_TOKEN_ID or MUX_TOKEN_SECRET is not configured.");
    }

    // Call Mux Direct Upload API
    const authHeader = Buffer.from(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`).toString('base64');
    const response = await fetch("https://api.mux.com/video/v1/uploads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authHeader}`
      },
      body: JSON.stringify({
        new_asset_settings: {
          playback_policy: ["public"],
          passthrough: JSON.stringify({ courseId, lessonId })
        },
        cors_origin: "*"
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create Mux direct upload: ${await response.text()}`);
    }

    const data = await response.json();
    return {
      uploadUrl: data.data.url,
      assetId: data.data.id,
      provider: 'mux'
    };
  }

  async getPlaybackInfo(playbackId: string): Promise<VideoPlaybackInfo> {
    return {
      playbackUrl: `https://stream.mux.com/${playbackId}.m3u8`,
      posterUrl: `https://image.mux.com/${playbackId}/thumbnail.png?width=1280&height=720&fit_mode=smart`,
      durationSeconds: 0,
      aspectRatio: "16:9",
      status: "ready",
      chapters: []
    };
  }

  async handleWebhook(rawBody: string, signature: string) {
    const parsed = JSON.parse(rawBody);
    return {
      event: parsed.type,
      assetId: parsed.data?.id,
      status: parsed.data?.status || 'ready'
    };
  }
}

export function getVideoProvider(): IVideoProvider {
  const providerType = process.env.VIDEO_PROVIDER || 'mock';
  if (providerType === 'mux') {
    const mux = new MuxVideoProvider();
    if (mux.isConfigured()) return mux;
  }
  return new MockVideoProvider();
}
