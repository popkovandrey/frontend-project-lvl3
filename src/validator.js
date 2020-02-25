import * as yup from 'yup';
import { findIndex } from 'lodash';

const schemaCheckUrl = yup.string().url().required();

const isValidUrl = (url) => {
  try {
    schemaCheckUrl.validateSync(url);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return false;
    }

    throw err;
  }

  return true;
};

const isDuplicateUrl = (url, channels) => findIndex(channels, { url }) !== -1;

const checkValidateUrl = (url, channels) => {
  const errors = {};

  if (!isValidUrl(url)) {
    errors.invalid = 'invalidUrl';
  }

  if (isDuplicateUrl(url, channels)) {
    errors.duplicate = 'duplicateUrl';
  }

  return errors;
};

export default checkValidateUrl;
