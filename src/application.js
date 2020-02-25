import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import checkValidateUrl from './validator';
import parseRSS from './parserRSS';
import render from './render';
import resources from './locales';

const proxy = 'https://cors-anywhere.herokuapp.com';

const updateFeed = (url, state) => {
  const { feed } = state;
  const channel = _.find(feed.channels, { url });

  if (!channel) return;

  const { data } = _.find(feed.posts, { id: channel.postsId });

  if (!data) return;

  axios.get(`${proxy}/${url}`)
    .then((response) => {
      const feedData = parseRSS(response.data);

      const latestNews = _.head(data.items);
      const newsInReverseOrder = feedData.items.reverse();
      const prevSizeArr = data.items.length;

      newsInReverseOrder.forEach((post) => {
        if (post.pubDate > latestNews.pubDate) {
          data.items.unshift(post);
        }
      });

      if (prevSizeArr < data.items.length) {
        feed.update = Date.now();
        channel.updated = new Date();
      }
    })
    .catch((err) => {
      throw err;
    });

  setTimeout(() => updateFeed(url, state), 5000);
};

const getFeed = (url, state) => {
  const { form, feed } = state;

  form.processState = 'requested';

  const channel = { url };

  axios.get(`${proxy}/${url}`)
    .finally(() => {
      form.processState = 'executed';
    })
    .then((response) => {
      const id = _.uniqueId();
      const feedData = parseRSS(response.data);
      feed.posts.push({ id, data: feedData });
      channel.postsId = id;
      channel.updated = new Date();
      feed.channels.push(channel);
      feed.statusRequest = { status: 'success', message: '' };
      feed.update = Date.now();
      feed.selectedChannel = url;

      feed.goodRequest = Date.now();
      form.urlValue = '';

      updateFeed(url, state);
    })
    .catch((err) => {
      feed.statusRequest = { status: 'bad', message: err.message };

      throw err;
    });
};

const handleOnClickChannel = (url, state) => {
  const { feed } = state;

  feed.selectedChannel = url;
  feed.update = new Date();
};

const app = () => {
  const state = {
    form: {
      processState: null,
      valid: null,
      urlValue: '',
      errors: {},
    },
    feed: {
      goodRequest: null,
      update: null,
      selectedChannel: '',
      channels: [],
      posts: [],
      statusRequest: {},
    },
  };

  const form = document.getElementById('form');
  const input = document.getElementById('url');

  input.addEventListener('input', (e) => {
    state.form.urlValue = e.target.value;
    const errors = checkValidateUrl(state.form.urlValue, state.feed.channels);
    state.form.errors = errors;
    state.form.valid = _.isEqual(errors, {});
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const url = state.form.urlValue.trim();

    if (url === '') return;

    getFeed(url, state);
  });

  i18next.init(
    {
      lng: 'en',
      resources,
    },
  ).then((texts) => {
    render(state, handleOnClickChannel, texts);
  });
};

export default app;
