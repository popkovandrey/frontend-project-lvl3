import * as yup from 'yup';
import { findIndex } from 'lodash';
import i18next from 'i18next';

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
        errors.invalid = i18next.t('errorMessage.invalidUrl');
            
      if (isDuplicateUrl(url, channels)) 
        errors.duplicate = i18next.t('errorMessage.duplicateUrl');
            
      return errors;
    });
};

export default checkValidateUrl;