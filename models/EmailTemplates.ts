import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const emailTemplatesSchema = new Schema({
    idEmailTemplate: { type: Number, required: true },
    templateName: { type: String, required: true },
    subjectTemplate: { type: String, required: true },
    recipientTemplate: { type: String, required: true },
    bodyTemplate: { type: String, required: true },
    userCreated: { type: String, required: true },
    isValid: { type: Boolean, required: true },
},
{
    timestamps: true
}
);

export const EmailTemplates = models.EmailTemplates || model('EmailTemplates', emailTemplatesSchema, 'emailTemplates');
