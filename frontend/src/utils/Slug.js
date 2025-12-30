const slugify = (text) =>
  text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")      // replace spaces & special chars with -
    .replace(/^-+|-+$/g, "");         // remove starting/ending hyphens
export default slugify;