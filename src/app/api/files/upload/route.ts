import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { errorResponse, HttpError, requireUser } from "@/lib/server/ai";
import { MAX_BYTES } from "@/lib/files";

const PDF_TYPES = ["application/pdf"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];

/**
 * Hands the browser a short-lived token to upload one file straight to Vercel Blob.
 * Only teachers, only into their own folder, only PDFs/videos within the size limits.
 */
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (user.role !== "teacher") throw new HttpError(403, "Only teachers can upload files.");
    const body = (await request.json()) as HandleUploadBody;

    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(`materials/${user.uid}/`)) throw new HttpError(403, "You can only upload to your own folder.");
        const isPdf = pathname.toLowerCase().endsWith(".pdf");
        return {
          allowedContentTypes: isPdf ? PDF_TYPES : VIDEO_TYPES,
          maximumSizeInBytes: isPdf ? MAX_BYTES.pdf : MAX_BYTES.video,
          addRandomSuffix: true, // unguessable URLs, and no overwriting another file
        };
      },
    });
    return Response.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
