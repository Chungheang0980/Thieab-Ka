import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getLocalMedia } from "@/lib/local-store";

type MediaRow = {
  file_name: string;
  mime_type: string;
  data: Buffer;
};

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (id.startsWith("local-media-")) {
    const localMedia = getLocalMedia(id);
    if (!localMedia) return NextResponse.json({ error: "Media not found" }, { status: 404 });
    return mediaResponse(request, {
      file_name: localMedia.fileName,
      mime_type: localMedia.mimeType,
      data: localMedia.data
    });
  }

  const result = await query<MediaRow>(
    "select file_name, mime_type, data from wedding_media where id = $1",
    [id]
  );
  const media = result.rows[0];
  if (!media) return NextResponse.json({ error: "Media not found" }, { status: 404 });

  return mediaResponse(request, media);
}

function mediaResponse(request: NextRequest, media: MediaRow) {

  const commonHeaders = {
    "Content-Type": media.mime_type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(media.file_name)}`
  };

  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!match) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${media.data.length}` }
      });
    }

    const start = Number(match[1]);
    const end = Math.min(match[2] ? Number(match[2]) : media.data.length - 1, media.data.length - 1);
    if (start >= media.data.length || end < start) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${media.data.length}` }
      });
    }

    const chunk = media.data.subarray(start, end + 1);
    return new NextResponse(new Uint8Array(chunk), {
      status: 206,
      headers: {
        ...commonHeaders,
        "Content-Length": String(chunk.length),
        "Content-Range": `bytes ${start}-${end}/${media.data.length}`
      }
    });
  }

  return new NextResponse(new Uint8Array(media.data), {
    headers: {
      ...commonHeaders,
      "Content-Length": String(media.data.length)
    }
  });
}
