import {randomBytes} from "node:crypto";
import Attachment from "./Attachment.js";
import EmailAddress from "./EmailAddress.js";

const API_BASE_URL = "https://smtp.maileroo.com/api/v2/" as const;
const MAX_ASSOCIATIVE_MAP_KEY_LENGTH = 128;
const MAX_ASSOCIATIVE_MAP_VALUE_LENGTH = 768;
const MAX_SUBJECT_LENGTH = 255;
const REFERENCE_ID_LENGTH = 24;

export type AssocValue = string | number | boolean;
export type AssocMap = Record<string, AssocValue>;

export interface BaseEmailFields {
    from: EmailAddress;
    to: EmailAddress | EmailAddress[];
    cc?: EmailAddress | EmailAddress[];
    bcc?: EmailAddress | EmailAddress[];
    reply_to?: EmailAddress | EmailAddress[];
    subject: string;
    tracking?: boolean;
    tags?: AssocMap;
    headers?: AssocMap;
    attachments?: Attachment[];
    scheduled_at?: string | Date;
    reference_id?: string;
}

export interface BasicEmailData extends BaseEmailFields {
    html?: string | null;
    plain?: string | null;
}

export interface TemplatedEmailData extends BaseEmailFields {
    template_id: number | string;
    template_data?: Record<string, unknown> | null;
}

export interface BulkMessage {
    from: EmailAddress;
    to: EmailAddress | EmailAddress[];
    cc?: EmailAddress | EmailAddress[];
    bcc?: EmailAddress | EmailAddress[];
    reply_to?: EmailAddress | EmailAddress[];
    reference_id?: string;
    template_data?: Record<string, unknown> | null;
}

export interface BulkEmailData {
    subject: string;
    html?: string;
    plain?: string;
    template_id?: number | string;
    tracking?: boolean;
    tags?: AssocMap;
    headers?: AssocMap;
    attachments?: Attachment[];
    messages: BulkMessage[];
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

export class MailerooClient {

    private readonly apiKey: string;
    private readonly timeoutSec: number;

    constructor(apiKey: string, timeout: number = 30) {

        if (apiKey.trim() === "") {
            throw new Error("API key must be a non-empty string.");
        }

        if (!Number.isInteger(timeout) || timeout <= 0) {
            throw new Error("Timeout must be a positive integer.");
        }

        this.apiKey = apiKey;
        this.timeoutSec = timeout;

    }

    getReferenceId(): string {
        const bytes = randomBytes(REFERENCE_ID_LENGTH / 2);
        return bytes.toString("hex");
    }

    private validateReferenceId(referenceId: string): string {

        if (referenceId.trim() !== referenceId) throw new Error("reference_id must not contain whitespace.");

        const re = new RegExp(`^[0-9a-f]{${REFERENCE_ID_LENGTH}}$`, "i");

        if (!re.test(referenceId)) throw new Error(`reference_id must be a ${REFERENCE_ID_LENGTH}-character hexadecimal string.`);

        return referenceId;

    }

    private isAcceptableTagOrHeaderValue(v: unknown): v is AssocValue {
        return typeof v === "string" || typeof v === "number" || typeof v === "boolean";
    }

    private validateAssociativeMap(map: unknown, label: string): asserts map is AssocMap {

        if (map == null || typeof map !== "object") throw new Error(`${label} must be an associative object.`);

        for (const [k, v] of Object.entries(map as Record<string, unknown>)) {

            if (!this.isAcceptableTagOrHeaderValue(v)) {
                throw new Error(`${label} must be an associative object with string keys and scalar values.`);
            }

            if (k.length > MAX_ASSOCIATIVE_MAP_KEY_LENGTH || String(v).length > MAX_ASSOCIATIVE_MAP_VALUE_LENGTH) {
                throw new Error(`${label} key must not exceed ${MAX_ASSOCIATIVE_MAP_KEY_LENGTH} characters and value must not exceed ${MAX_ASSOCIATIVE_MAP_VALUE_LENGTH} characters.`);
            }

        }

    }

    private normalizeEmailField(field: unknown): EmailAddress {

        if (field instanceof EmailAddress) return field;

        throw new Error("Email field must be an instance of EmailAddress.");

    }

    private normalizeEmailFieldOrArray(list: unknown): EmailAddress | EmailAddress[] {

        if (Array.isArray(list)) return list.map((x) => this.normalizeEmailField(x));

        return this.normalizeEmailField(list);

    }

    private getEmailArrays(emailList: EmailAddress | EmailAddress[] | null | undefined) {

        if (!emailList) return null;
        if (Array.isArray(emailList)) return emailList.map((e) => e.toJSON());

        return (emailList as EmailAddress).toJSON();

    }

    private getParsedEmailItems(data: BaseEmailFields) {

        const normalized = {
            from: this.normalizeEmailField(data.from),
            to: this.normalizeEmailFieldOrArray(data.to),
            cc: data.cc !== undefined ? this.normalizeEmailFieldOrArray(data.cc) : undefined,
            bcc: data.bcc !== undefined ? this.normalizeEmailFieldOrArray(data.bcc) : undefined,
            reply_to: data.reply_to !== undefined ? this.normalizeEmailFieldOrArray(data.reply_to) : undefined,
        } as const;

        return {
            from: this.getEmailArrays(normalized.from),
            to: this.getEmailArrays(normalized.to),
            cc: this.getEmailArrays(normalized.cc),
            bcc: this.getEmailArrays(normalized.bcc),
            reply_to: this.getEmailArrays(normalized.reply_to),
        };

    }

    private buildBasePayload<T extends BaseEmailFields>(data: T) {

        if (data.subject.trim() === "" || data.subject.length > MAX_SUBJECT_LENGTH) {
            throw new Error(`Subject must be a non-empty string with a maximum length of ${MAX_SUBJECT_LENGTH} characters.`);
        }

        const payload: any = this.getParsedEmailItems(data);
        payload.subject = data.subject;

        if (data.tracking !== undefined) {
            payload.tracking = data.tracking;
        }

        if (data.tags) {
            this.validateAssociativeMap(data.tags, "tags");
            payload.tags = data.tags;
        }

        if (data.headers) {
            this.validateAssociativeMap(data.headers, "headers");
            payload.headers = data.headers;
        }

        if (data.attachments) {

            if (!Array.isArray(data.attachments)) throw new Error("attachments must be an array of Attachment instances.");

            payload.attachments = data.attachments.map((a) => {
                return a.toJSON();
            });

        }

        if (typeof data.scheduled_at === "string") {
            payload.scheduled_at = data.scheduled_at;
        } else if (data.scheduled_at instanceof Date) {
            payload.scheduled_at = data.scheduled_at.toISOString();
        }

        payload.reference_id = data.reference_id ? this.validateReferenceId(data.reference_id) : this.getReferenceId();

        return payload;

    }

    async sendBasicEmail(data: BasicEmailData): Promise<string> {

        const payload = this.buildBasePayload(data);

        if (data.html == null && data.plain == null) throw new Error("Either html or plain body is required.");

        payload.html = data.html ?? null;
        payload.plain = data.plain ?? null;

        const resp = await this.sendRequest<ApiResponse<{ reference_id: string }>>("POST", "emails", payload);

        if (resp.success) return resp.data!.reference_id;

        throw new Error("The API returned an error: " + resp.message);

    }

    private validateTemplateData(templateData: unknown): Record<string, unknown> {

        if (templateData == null || templateData === "" || (Array.isArray(templateData) && templateData.length === 0)) return {};
        if (typeof templateData !== "object" || Array.isArray(templateData)) throw new Error("template_data must be an object if provided.");

        return templateData as Record<string, unknown>;

    }

    async sendTemplatedEmail(data: TemplatedEmailData): Promise<string> {

        const payload: any = this.buildBasePayload(data);

        payload.template_id = Number(data.template_id);

        if (data.template_data !== undefined) payload.template_data = this.validateTemplateData(data.template_data);

        const resp = await this.sendRequest<ApiResponse<{ reference_id: string }>>("POST", "emails/template", payload);

        if (resp.success) return resp.data!.reference_id;

        throw new Error("The API returned an error: " + resp.message);

    }

    private normalizeBulkMessages(messages: BulkMessage[]): any[] {

        if (!Array.isArray(messages) || messages.length === 0) throw new Error("messages must be a non-empty array.");
        if (messages.length > 500) throw new Error("messages cannot contain more than 500 items.");

        return messages.map((msg, idx) => {

            if (typeof msg !== "object" || msg == null) throw new Error(`Each message must be an object (message index ${idx}).`);
            if (!msg.from || !msg.to) throw new Error(`Each message must include 'from' and 'to' (message index ${idx}).`);

            const from = this.normalizeEmailField(msg.from);
            const to = this.normalizeEmailFieldOrArray(msg.to);
            const cc = msg.cc !== undefined ? this.normalizeEmailFieldOrArray(msg.cc) : undefined;
            const bcc = msg.bcc !== undefined ? this.normalizeEmailFieldOrArray(msg.bcc) : undefined;
            const reply_to = msg.reply_to !== undefined ? this.normalizeEmailFieldOrArray(msg.reply_to) : undefined;

            const item: any = {
                from: this.getEmailArrays(from),
                to: this.getEmailArrays(to),
                cc: this.getEmailArrays(cc),
                bcc: this.getEmailArrays(bcc),
                reply_to: this.getEmailArrays(reply_to),
            };

            item.reference_id = msg.reference_id ? this.validateReferenceId(msg.reference_id) : this.getReferenceId();

            if (Object.prototype.hasOwnProperty.call(msg, "template_data")) item.template_data = this.validateTemplateData(msg.template_data as any);

            return item;

        });

    }

    async sendBulkEmails(data: BulkEmailData): Promise<string[]> {

        if (data.subject.trim() === "" || data.subject.length > MAX_SUBJECT_LENGTH) {
            throw new Error(`Subject must be a non-empty string with a maximum length of ${MAX_SUBJECT_LENGTH} characters.`);
        }

        const hasHtml = typeof data.html === "string";
        const hasPlain = typeof data.plain === "string";
        const hasTemplate = data.template_id !== undefined && (typeof data.template_id === "number" || typeof data.template_id === "string");

        if ((!hasHtml && !hasPlain) && !hasTemplate) throw new Error("You must provide either html, plain, or template_id.");
        if (hasTemplate && (hasHtml || hasPlain)) throw new Error("template_id cannot be combined with html or plain.");

        const payload: any = {subject: data.subject};

        if (hasHtml) payload.html = data.html;
        if (hasPlain) payload.plain = data.plain;
        if (hasTemplate) payload.template_id = Number(data.template_id);

        if (data.tracking !== undefined) {
            payload.tracking = data.tracking;
        }

        if (data.tags) {
            this.validateAssociativeMap(data.tags, "tags");
            payload.tags = data.tags;
        }

        if (data.headers) {
            this.validateAssociativeMap(data.headers, "headers");
            payload.headers = data.headers;
        }

        if (data.attachments) {

            if (!Array.isArray(data.attachments)) throw new Error("attachments must be an array of Attachment instances.");

            payload.attachments = data.attachments.map((a) => {
                return a.toJSON();
            });

        }

        payload.messages = this.normalizeBulkMessages(data.messages);

        const resp = await this.sendRequest<ApiResponse<{ reference_ids: string[] }>>("POST", "emails/bulk", payload);

        if (resp.success && resp.data) return resp.data.reference_ids;

        throw new Error("The API returned an error: " + resp.message);

    }

    async deleteScheduledEmail(referenceId: string): Promise<boolean> {

        referenceId = this.validateReferenceId(referenceId);

        const resp = await this.sendRequest<ApiResponse>("DELETE", `emails/scheduled/${referenceId}`);

        if (resp.success) return true;

        throw new Error("The API returned an error: " + resp.message);

    }

    async getScheduledEmails(page = 1, per_page = 10): Promise<any> {

        if (!Number.isInteger(page) || page < 1) throw new Error("page must be a positive integer (>= 1).");
        if (!Number.isInteger(per_page) || per_page < 1) throw new Error("per_page must be a positive integer (>= 1).");
        if (per_page > 100) throw new Error("per_page cannot be greater than 100.");

        const resp = await this.sendRequest<ApiResponse>("GET", "emails/scheduled", {page, per_page});

        if (resp.success && resp.data) return resp.data;

        throw new Error("The API returned an error: " + resp.message);

    }

    private async sendRequest<T = ApiResponse>(method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH", endpoint: string, data?: any): Promise<T> {

        const url = new URL(endpoint.replace(/^\/+/, ""), API_BASE_URL).toString();

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), this.timeoutSec * 1000);

        try {

            let finalUrl = url;
            let body: string | undefined;

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
                "User-Agent": "maileroo-node-sdk/2.0",
            };

            if (method === "GET" && data && typeof data === "object") {

                const qs = new URLSearchParams();

                Object.entries(data).forEach(([k, v]) => {
                    if (v !== undefined && v !== null) qs.set(k, String(v));
                });

                finalUrl += (finalUrl.includes("?") ? "&" : "?") + qs.toString();

            } else if (data !== undefined) {

                body = JSON.stringify(data, (_k, value) => {
                    if (value && typeof value === "object" && typeof (value as any).toJSON === "function") return (value as any).toJSON();
                    if ((value as any)?.content && (value as any)?.file_name) return value;
                    return value;
                });

            }

            const res = await fetch(finalUrl, {method, headers, body, signal: controller.signal} as any);
            const raw = await res.text();

            let decoded: ApiResponse | null;

            decoded = JSON.parse(raw);

            if (typeof decoded?.success !== "boolean") throw new Error('The API response is missing the "success" field.');
            if (!decoded.message) decoded.message = "Unknown";

            return decoded as unknown as T;

        } catch (err: any) {

            if (err?.name === "AbortError") throw new Error("HTTP request failed: timeout");
            if (err instanceof Error) throw err;

            throw new Error(String(err));

        } finally {

            clearTimeout(id);

        }

    }

}

export default MailerooClient;