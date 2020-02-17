import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import checkValidateUrl from './validator';
import parseRSS from './parserRSS';
import render from './render';
import resources from './locales';

const proxy = 'cors-anywhere.herokuapp.com';

const updateFeed = (url, state) => {
  const { feed } = state;
  const channel = _.find(feed.channels, { url });

  if (!channel) {
    return;
  }

  axios.get(`https://${proxy}/${url}`)
    .then((response) => {
      const feedData = parseRSS(response.data);

      const date = channel.data.items[0].pubDate;
      const items = feedData.items.reverse();
      const prevSizeArr = channel.data.items.length;

      items.forEach((item) => {
        if (item.pubDate > date) {
          channel.data.items.unshift(item);
        }
      });

      if (prevSizeArr < channel.data.items.length) {
        feed.update = Date.now();
        channel.updated = new Date();
      }
    })
    .catch((err) => {
      throw err;
    });

  setTimeout(() => updateFeed(url, state), 5000);
};

const setAlertMessage = (text, requestStatusText, type, msCount, state) => {
  const { form } = state;

  form.alertMsg.msCount = msCount;
  form.alertMsg.type = type;
  form.alertMsg.text = '';
  form.alertMsg.text = text;
  form.alertMsg.requestStatusText = requestStatusText;
};

const handleOnClickChannel = (url, state) => {
  const { feed } = state;

  feed.selectedChannel = url;
  feed.update = new Date();
};

const app = () => {
  i18next.init(
    {
      lng: 'en',
      resources,
    },
  );

  const state = {
    form: {
      process: null,
      valid: null,
      urlValue: '',
      errors: {},
      alertMsg: {
        text: '',
        requestStatusText: '',
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
        const feedData = parseRSS(response.data);
        channel.data = feedData;
        channel.updated = new Date();
        state.feed.channels.push(channel);
        setAlertMessage('success', '', 'alert-success', 5000, state);
        state.feed.update = Date.now();
        state.feed.selectedChannel = url;

        updateFeed(url, state);
      })
      .catch((err) => {
        if (err.response) {
          setAlertMessage('badRequest', `${err.response.request.statusText}. `, 'alert-danger', 5000, state);
        } else {
          setAlertMessage('emptyResponse', '', 'alert-danger', 5000, state);
        }

        throw err;
      });

    state.form.urlValue = '';
  });

  render(state, handleOnClickChannel);
};

export default app;
