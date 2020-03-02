import * as yup from 'yup';
// import { findIndex } from 'lodash';

/* const schemaCheckUrl = yup.string().url().required();

const isValidUrl = (url) => {
  try {
    schemaCheckUrl.validateSync(url);
  } catch (err) {
    console.log(err);
    return false;
  }

  return true;
};

const isDuplicateUrl = (u, channels) => {
  // findIndex(channels, { url }) !== -1;
  const urls = channels.map(({ url }) => url);
  console.log(urls, schemaCheckUrl.oneOf(urls).isValid(u));
  schemaCheckUrl.oneOf(urls).isValid(u)
    .then((valid) => valid);
};

const validateUrl = (url, channels) => {
  const errors = {};

  if (!isValidUrl(url)) {
    errors.invalid = 'invalidUrl';
  }

  if (isDuplicateUrl(url, channels)) {
    errors.duplicate = 'duplicateUrl';
  }

  return errors;
}; */

export default (url, listUrls) => {
  yup
    .string()
    .url()
    .required()
    .notOneOf(listUrls)
    .validateSync(url);
};
