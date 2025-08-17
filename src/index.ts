export {Attachment} from "./Attachment.js";
export type {AttachmentJSON} from "./Attachment.js";

export {EmailAddress} from "./EmailAddress.js";
export type {EmailAddressJSON} from "./EmailAddress.js";

export {MailerooClient} from "./MailerooClient.js";
export type {
    BaseEmailFields,
    BasicEmailData,
    TemplatedEmailData,
    BulkEmailData,
    BulkMessage,
    AssocMap,
    AssocValue,
    ApiResponse,
} from "./MailerooClient.js";

import {Attachment} from "./Attachment.js";
import {EmailAddress} from "./EmailAddress.js";
import {MailerooClient} from "./MailerooClient.js";

const _default = {Attachment, EmailAddress, MailerooClient};
export default _default;