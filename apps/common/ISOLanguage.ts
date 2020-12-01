import { RegularExpression } from 'graphql-scalars';

// https://github.com/Urigo/graphql-scalars#using-the-regularexpression-scalar
// Note: assuming ISO 639-1
const ISOLanguageResolver = new RegularExpression('ISOLanguage', /^[a-z]{2}$/);

export { ISOLanguageResolver };
