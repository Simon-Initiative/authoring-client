export const convertStringToCSS = (str) => {
  return str.toLowerCase().trim().replace(/\s+/gi, '-')
    .replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '');
};
