import * as yup from 'yup';
import { findIndex } from 'lodash';

const errorMessage = {
  invalidUrl: 'Enter a valid address',
  duplicateUrl: 'This address has already been added to the feed. Enter the new address.',
};

const checkUrl = yup.object().shape({
  url: yup
    .string()
    .url()
    .required(),
  }
);

const isValidUrl = (url) => {
  const obj = { url };

  return checkUrl
    .isValid(obj)
    .then((valid) => valid);
};

const isDuplicateUrl = (url, channels) => findIndex(channels, { url }) !== -1;

const checkValidateUrl = (url, channels) => {
  const errors = {};

  return isValidUrl(url)
    .then((valid) => {

      if (!valid) 
        errors.invalid = errorMessage.invalidUrl;
            
      if (isDuplicateUrl(url, channels)) 
        errors.duplicate = errorMessage.duplicateUrl;
            
      return errors;
    });
};

export default checkValidateUrl;