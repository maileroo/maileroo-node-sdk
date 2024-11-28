"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerooClient = void 0;
var fs = require('fs');
var _crypto = require('crypto');
var axios = require('axios');
var MailerooClient = /** @class */ (function () {
    function MailerooClient(apiKey) {
        this.emailData = {};
        this.emailAttachments = [];
        this.emailInlineAttachments = [];
        this.apiKey = apiKey;
        this.resetEmailData();
    }
    MailerooClient.getClient = function (apiKey) {
        if (!MailerooClient.instance && apiKey) {
            MailerooClient.instance = new MailerooClient(apiKey);
        }
        return MailerooClient.instance;
    };
    MailerooClient.prototype.resetEmailData = function () {
        this.emailData = {
            from: '',
            to: '',
            cc: '',
            bcc: '',
            reply_to: '',
            subject: '',
            html: '',
            plain: '',
            tracking: 'yes',
            reference_id: '',
            tags: '',
            template_id: '',
            template_data: '',
        };
        this.emailAttachments = [];
        this.emailInlineAttachments = [];
    };
    MailerooClient.prototype.setFrom = function (name, address) {
        this.emailData.from += "".concat(name, " <").concat(address, ">,");
        return this;
    };
    MailerooClient.prototype.setTo = function (name, address) {
        this.emailData.to += "".concat(name, " <").concat(address, ">,");
        return this;
    };
    MailerooClient.prototype.setCc = function (name, address) {
        this.emailData.cc += "".concat(name, " <").concat(address, ">,");
        return this;
    };
    MailerooClient.prototype.setBcc = function (name, address) {
        this.emailData.bcc += "".concat(name, " <").concat(address, ">,");
        return this;
    };
    MailerooClient.prototype.setReplyTo = function (name, address) {
        this.emailData.reply_to += "".concat(name, " <").concat(address, ">,");
        return this;
    };
    MailerooClient.prototype.setSubject = function (subject) {
        this.emailData.subject = subject;
        return this;
    };
    MailerooClient.prototype.setHtml = function (html) {
        this.emailData.html = html;
        return this;
    };
    MailerooClient.prototype.setPlain = function (plain) {
        this.emailData.plain = plain;
        return this;
    };
    MailerooClient.prototype.addAttachment = function (filePath, fileName, fileType) {
        if (fs.existsSync(filePath)) {
            var file = fs.createReadStream(filePath);
            this.emailAttachments.push({
                file: file,
                filename: fileName,
                contentType: fileType,
            });
        }
        return this;
    };
    MailerooClient.prototype.addInlineAttachment = function (filePath, fileName, fileType) {
        if (fs.existsSync(filePath)) {
            var file = fs.createReadStream(filePath);
            this.emailInlineAttachments.push({
                file: file,
                filename: fileName,
                contentType: fileType,
            });
        }
        return this;
    };
    MailerooClient.prototype.setReferenceId = function (referenceId) {
        this.emailData.reference_id = referenceId;
        return this;
    };
    MailerooClient.prototype.setTags = function (tags) {
        this.emailData.tags = JSON.stringify(tags);
        return this;
    };
    MailerooClient.prototype.setTracking = function (tracking) {
        this.emailData.tracking = tracking ? 'yes' : 'no';
        return this;
    };
    MailerooClient.prototype.setTemplateId = function (templateId) {
        this.emailData.template_id = templateId;
        return this;
    };
    MailerooClient.prototype.setTemplateData = function (templateData) {
        this.emailData.template_data = JSON.stringify(templateData);
        return this;
    };
    MailerooClient.prototype.removeTrailingCommas = function () {
        var _this = this;
        var keys = [
            'from',
            'to',
            'cc',
            'bcc',
            'reply_to',
        ];
        keys.forEach(function (key) {
            if (_this.emailData[key]) {
                _this.emailData[key] = _this.emailData[key].replace(/,$/, '');
            }
        });
    };
    MailerooClient.prototype.sendEmailRequest = function (endpoint_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, method) {
            var url, headers, formData, response, error_1;
            var _a, _b;
            if (method === void 0) { method = 'POST'; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.removeTrailingCommas();
                        url = "".concat(MailerooClient.EMAIL_API_ENDPOINT).concat(endpoint);
                        headers = {
                            'X-API-Key': this.apiKey,
                            'Content-Type': 'multipart/form-data',
                        };
                        formData = __assign({}, this.emailData);
                        this.emailAttachments.forEach(function (attachment, index) {
                            formData["attachments[".concat(index, "]")] = attachment;
                        });
                        this.emailInlineAttachments.forEach(function (attachment, index) {
                            formData["inline_attachments[".concat(index, "]")] = attachment;
                        });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios({ method: method, url: url, headers: headers, data: formData })];
                    case 2:
                        response = _c.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_1 = _c.sent();
                        throw new Error(((_b = (_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'An error occurred');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MailerooClient.prototype.sendBasicEmail = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendEmailRequest('/send', 'POST')];
                    case 1:
                        response = _a.sent();
                        this.resetEmailData();
                        if (response.success) {
                            return [2 /*return*/, true];
                        }
                        throw new Error(response.message);
                }
            });
        });
    };
    MailerooClient.prototype.sendTemplateEmail = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendEmailRequest('/send-template', 'POST')];
                    case 1:
                        response = _a.sent();
                        this.resetEmailData();
                        if (response.success) {
                            return [2 /*return*/, true];
                        }
                        throw new Error(response.message);
                }
            });
        });
    };
    MailerooClient.prototype.generateReferenceId = function () {
        return _crypto.randomBytes(12).toString('hex');
    };
    MailerooClient.prototype.sendCustomRequest = function (url_1) {
        return __awaiter(this, arguments, void 0, function (url, method, data, sendJson) {
            var headers, response, error_2;
            var _a, _b;
            if (method === void 0) { method = 'GET'; }
            if (data === void 0) { data = {}; }
            if (sendJson === void 0) { sendJson = true; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        headers = { 'X-API-Key': this.apiKey };
                        if (sendJson)
                            headers['Content-Type'] = 'application/json';
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios({
                                method: method,
                                url: url,
                                headers: headers,
                                data: sendJson ? JSON.stringify(data) : data,
                            })];
                    case 2:
                        response = _c.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_2 = _c.sent();
                        throw new Error(((_b = (_a = error_2 === null || error_2 === void 0 ? void 0 : error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'An error occurred');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MailerooClient.prototype.createContact = function (listId, contact) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(MailerooClient.CONTACTS_API_ENDPOINT, "v1/contact/").concat(listId);
                        return [4 /*yield*/, this.sendCustomRequest(url, 'PUT', contact)];
                    case 1:
                        response = _a.sent();
                        if (response.success) {
                            return [2 /*return*/, true];
                        }
                        throw new Error(response.message);
                }
            });
        });
    };
    MailerooClient.prototype.updateContact = function (listId, emailAddress, contact) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(MailerooClient.CONTACTS_API_ENDPOINT, "v1/contact/").concat(listId, "/").concat(emailAddress);
                        return [4 /*yield*/, this.sendCustomRequest(url, 'PATCH', contact)];
                    case 1:
                        response = _a.sent();
                        if (response.success) {
                            return [2 /*return*/, true];
                        }
                        throw new Error(response.message);
                }
            });
        });
    };
    MailerooClient.prototype.deleteContact = function (listId, emailAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(MailerooClient.CONTACTS_API_ENDPOINT, "v1/contact/").concat(listId, "/").concat(emailAddress);
                        return [4 /*yield*/, this.sendCustomRequest(url, 'DELETE')];
                    case 1:
                        response = _a.sent();
                        if (response.success) {
                            return [2 /*return*/, true];
                        }
                        throw new Error(response.message);
                }
            });
        });
    };
    MailerooClient.prototype.getContact = function (listId, emailAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(MailerooClient.CONTACTS_API_ENDPOINT, "v1/contact/").concat(listId, "/").concat(emailAddress);
                        return [4 /*yield*/, this.sendCustomRequest(url, 'GET', {}, false)];
                    case 1:
                        response = _a.sent();
                        if (response.success) {
                            return [2 /*return*/, response.contact];
                        }
                        throw new Error(response.message);
                }
            });
        });
    };
    MailerooClient.prototype.listContacts = function (listId_1) {
        return __awaiter(this, arguments, void 0, function (listId, query, page) {
            var url, response;
            if (query === void 0) { query = ''; }
            if (page === void 0) { page = 1; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(MailerooClient.CONTACTS_API_ENDPOINT, "v1/contacts/").concat(listId, "?query=").concat(query, "&page=").concat(page);
                        return [4 /*yield*/, this.sendCustomRequest(url, 'GET', {}, false)];
                    case 1:
                        response = _a.sent();
                        if (response.success) {
                            return [2 /*return*/, response.data];
                        }
                        throw new Error(response.message);
                }
            });
        });
    };
    MailerooClient.EMAIL_API_ENDPOINT = 'https://smtp.maileroo.com/';
    MailerooClient.CONTACTS_API_ENDPOINT = 'https://manage.maileroo.app/';
    return MailerooClient;
}());
exports.MailerooClient = MailerooClient;
