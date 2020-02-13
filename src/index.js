import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import checkValidateUrl from './validator';
import parseRSS from './parserRSS';
import render from './render';
import resources from './locales';

i18next.init(
  {
    lng: 'en',
    resources,
  },
);

const proxy = 'cors-anywhere.herokuapp.com';

const state = {
  form: {
    process: 'executed',
    valid: null,
    urlValue: '',
    errors: {},
    alertMsg: {
      text: '',
      type: null,
      msCount: 5000,
    },
  },
  feed: {
    update: null,
    selectedChannel: '',
    channels: [],
  },
};

const form = document.getElementById('form');
const input = document.getElementById('url');

input.addEventListener('input', (e) => {
  state.form.urlValue = e.target.value;

  checkValidateUrl(state.form.urlValue, state.feed.channels)
    .then((errors) => {
      state.form.errors = errors;
      state.form.valid = _.isEqual(errors, {});
    });
});

const setAlertMessage = (text, statusText, type, inputValue, msCount) => {
  console.log('inputValue', inputValue);
  const textMapping = {
    success: i18next.t('requestStatus.success', { statusText, inputValue, interpolation: { escapeValue: false } }),
    badRequest: i18next.t('requestStatus.badRequest', { statusText, inputValue, interpolation: { escapeValue: false } }),
    emptyResponse: i18next.t('requestStatus.emptyResponse'),
  };

  state.form.alertMsg.msCount = msCount;
  state.form.alertMsg.type = type;
  state.form.alertMsg.text = '';
  state.form.alertMsg.text = textMapping[text];
};

const updateFeed = (url) => {
  const channel = _.find(state.feed.channels, { url });

  if (!channel) {
    return;
  }

  axios.get(`https://${proxy}/${url}`)
    .then((response) => {
      const feedData = parseRSS(response);

      const date = channel.data.items[0].pubDate;
      const items = feedData.items.reverse();
      const prevSizeArr = channel.data.items.length;

      items.forEach((item) => {
        if (item.pubDate > date) {
          channel.data.items.unshift(item);
        }
      });

      if (prevSizeArr < channel.data.items.length) {
        state.feed.update = Date.now();
        channel.updated = new Date();
        console.log('rePaint');
      }
    })
    .catch((err) => {
      console.log(err);
    });

  console.log('timeout');

  setTimeout(() => updateFeed(url), 5000);
};

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const url = state.form.urlValue.trim();

  if (url === '') {
    return;
  }

  state.form.process = 'requested';

  const channel = {
    url,
  };

  axios.get(`https://${proxy}/${url}`)
    .finally(() => {
      state.form.process = 'executed';
    })
    .then((response) => {
      const feedData = parseRSS(response);
      channel.data = feedData;
      channel.updated = new Date();
      state.feed.channels.push(channel);
      setAlertMessage('success', '', 'alert-success', url, 5000);
      state.feed.update = Date.now();
      state.feed.selectedChannel = url;

      updateFeed(url);

      console.log(state.feed.channels, state.feed.update);
    })
    .catch((err) => {
      if (err.response) {
        setAlertMessage('badRequest', `${err.response.request.statusText}. `, 'alert-danger', url, 5000);
      } else {
        setAlertMessage('emptyResponse', '', 'alert-danger', url, 5000);
      }

      console.log(err, err.response);
    });

  state.form.urlValue = '';
});

const handleOnClickChannel = (url) => {
  state.feed.selectedChannel = url;
  state.feed.update = new Date();
};

render(state, handleOnClickChannel);
