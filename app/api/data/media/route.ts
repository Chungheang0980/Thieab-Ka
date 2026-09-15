import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";
import { query } from "@/lib/db";
import { addLocalMedia, isLocalClient } from "@/lib/local-store";

const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;

type MediaKind = "photo" | "video";

type InsertedMedia = {
  id: string;
};

export async function POST(request: NextRequest) {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const kind = form.get("kind") as MediaKind | null;
  const files = form.getAll("files").filter((file): file is File => file instanceof File);

  if (kind !== "photo" && kind !== "video") {
    return NextResponse.json({ error: "Choose photo or video upload." }, { status: 400 });
  }
  if (!files.length) {
    return NextResponse.json({ error: "Select at least one file." }, { status: 400 });
  }
  if (kind === "video" && files.length > 1) {
    return NextResponse.json({ error: "Upload one video at a time." }, { status: 400 });
  }

  const allowedTypes = kind === "photo" ? PHOTO_TYPES : VIDEO_TYPES;
  const maxBytes = kind === "photo" ? MAX_PHOTO_BYTES : MAX_VIDEO_BYTES;
  const uploaded: Array<{ id: string; url: string; fileName: string; kind: MediaKind }> = [];

  for (const file of files) {
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: kind === "photo" ? "Use JPG, PNG, WebP, or GIF photos." : "Use MP4, WebM, or MOV video." }, { status: 400 });
    }
    if (file.size > maxBytes) {
      return NextResponse.json({ error: kind === "photo" ? "Each photo must be 8 MB or smaller." : "Video must be 25 MB or smaller." }, { status: 400 });
    }

    const data = Buffer.from(await file.arrayBuffer());
    if (isLocalClient(client.id)) {
      const media = addLocalMedia({
        kind,
        fileName: file.name,
        mimeType: file.type,
        data
      });
      uploaded.push({ id: media.id, url: `/api/media/${media.id}`, fileName: media.fileName, kind });
      continue;
    }

    const result = await query<InsertedMedia>(
      `insert into wedding_media (client_id, kind, file_name, mime_type, data)
       values ($1, $2, $3, $4, $5)
       returning id`,
      [client.id, kind, file.name, file.type, data]
    );
    const id = result.rows[0].id;
    uploaded.push({ id, url: `/api/media/${id}`, fileName: file.name, kind });
  }

  return NextResponse.json({ media: uploaded });
}
