import {promises as fs} from "node:fs";
import {Readable} from "node:stream";

export interface AttachmentJSON {
    file_name: string;
    content_type: string;
    content: string; // base64
    inline: boolean;
}

const EXT_MIME_MAP: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
    svg: "image/svg+xml",
    tiff: "image/tiff",
    ico: "image/x-icon",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    odt: "application/vnd.oasis.opendocument.text",
    ods: "application/vnd.oasis.opendocument.spreadsheet",
    odp: "application/vnd.oasis.opendocument.presentation",
    rtf: "application/rtf",
    txt: "text/plain",
    csv: "text/csv",
    tsv: "text/tab-separated-values",
    json: "application/json",
    xml: "application/xml",
    html: "text/html",
    htm: "text/html",
    md: "text/markdown",
    zip: "application/zip",
    tar: "application/x-tar",
    gz: "application/gzip",
    tgz: "application/gzip",
    rar: "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
    flac: "audio/flac",
    aac: "audio/aac",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    flv: "video/x-flv",
    wmv: "video/x-ms-wmv",
    m4v: "video/x-m4v",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    otf: "font/otf",
    eot: "application/vnd.ms-fontobject",
};

function detectMimeFromExtension(path: string): string | null {

    const m = /\.([A-Za-z0-9]+)$/.exec(path);

    if (!m) {
        return null;
    }

    const ext = m[1].toLowerCase();

    return EXT_MIME_MAP[ext] ?? null;

}

export class Attachment {

    private readonly fileName: string;
    private readonly contentType: string;
    private readonly contentB64: string;
    private readonly inline: boolean;

    private constructor(fileName: string, base64Content: string, contentType: string | null = null, inline = false) {

        if (fileName.trim() === "") {
            throw new Error("file_name is required.");
        }

        if (base64Content === "") {
            throw new Error("content must be a non-empty base64 string.");
        }

        this.fileName = fileName;
        this.contentB64 = base64Content;
        this.contentType = contentType || "application/octet-stream";
        this.inline = Boolean(inline);

    }

    static fromContent(fileName: string, content: Buffer | string, contentType: string | null = null, inline = false, isBase64 = false): Attachment {

        if (typeof content !== "string" && !Buffer.isBuffer(content)) {
            throw new Error("content must be a string or Buffer.");
        }

        let binary: Buffer;

        if (typeof content === "string") {

            if (isBase64) {

                const bin = Buffer.from(content, "base64");

                if (bin.length === 0 && content.length > 0) {
                    throw new Error("Invalid base64 content provided.");
                }

                binary = bin;

            } else {

                binary = Buffer.from(content, "utf8");

            }

        } else {

            binary = content;

        }

        const detected = contentType || detectMimeFromExtension(fileName) || "application/octet-stream";
        const b64 = binary.toString("base64");

        return new Attachment(fileName, b64, detected, inline);

    }

    static async fromStream(fileName: string, stream: Readable, contentType: string | null = null, inline = false): Promise<Attachment> {

        const chunks: Buffer[] = [];

        for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }

        const binary = Buffer.concat(chunks);
        const detected = contentType || detectMimeFromExtension(fileName) || "application/octet-stream";
        const b64 = binary.toString("base64");

        return new Attachment(fileName, b64, detected, inline);

    }

    static async fromFile(path: string, contentType: string | null = null, inline = false): Promise<Attachment> {

        if (path.trim() === "") {
            throw new Error("path must be a readable file.");
        }

        let binary: Buffer;

        try {
            binary = await fs.readFile(path);
        } catch {
            throw new Error("Failed to read file: " + path);
        }

        const fileName = path.split(/[/\\\\]/).pop() || path;
        const detected = contentType || detectMimeFromExtension(path) || "application/octet-stream";
        const b64 = binary.toString("base64");

        return new Attachment(fileName, b64, detected, inline);

    }

    getFileName(): string {
        return this.fileName;
    }

    getContentType(): string {
        return this.contentType;
    }

    getContent(): string {
        return this.contentB64;
    }

    isInline(): boolean {
        return this.inline;
    }

    toJSON(): AttachmentJSON {

        return {
            file_name: this.fileName,
            content_type: this.contentType || "application/octet-stream",
            content: this.contentB64,
            inline: this.inline,
        };

    }

}

export default Attachment;