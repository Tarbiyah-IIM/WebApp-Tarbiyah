import id from './id.js';
import en from './en.js';
import { dynamicEn } from './dynamicEn.js';
import { portalPagesId } from './portalPages.id.js';
import { portalPagesEn } from './portalPages.en.js';

export { dynamicEn };

export const translations = {
  id: { ...id, portalPages: portalPagesId },
  en: { ...en, portalPages: portalPagesEn }
};
