import id from './id.js';
import en from './en.js';
import { dynamicEn } from './dynamicEn.js';
import { portalPagesId } from './portalPages.id.js';
import { portalPagesEn } from './portalPages.en.js';
import { workPermitId, workPermitEn } from './workPermit.js';

export { dynamicEn };

export const translations = {
  id: { ...id, portalPages: portalPagesId, workPermit: workPermitId },
  en: { ...en, portalPages: portalPagesEn, workPermit: workPermitEn }
};
