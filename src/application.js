import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import validateUrl from './validator';
import parseRSS from './parserRSS';
import setWatches from './watches';
import resources from './locales';

const proxy = 'https://cors-anywhere.herokuapp.com';

const updateFeedInterval = 30000;

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
        feed.needToUpdated = Date.now();
        channel.updated = new Date();
      }
    });

  setTimeout(() => updateFeed(url, state), updateFeedInterval);
};

const getFeed = (url, state) => {
  const { form, feed } = state;

  const channel = { url };

  axios.get(`${proxy}/${url}`)
    .then((response) => {
      form.processState = 'finished';

      const id = _.uniqueId();
      const feedData = parseRSS(response.data);
      feed.posts.push({ id, data: feedData });
      channel.postsId = id;
      channel.updated = new Date();
      feed.channels.push(channel);
      feed.statusRequest = { status: 'success', message: '' };
      feed.needToUpdated = Date.now();
      feed.selectedChannel = url;

      form.urlValue = '';
      form.valid = false;

      updateFeed(url, state);
    })
    .catch((err) => {
      form.processState = 'filling';

      feed.statusRequest = { status: 'bad', message: err.message };

      throw err;
    });
};

const handleOnClickChannel = (url, state) => {
  const { feed } = state;

  feed.selectedChannel = url;
  feed.needToUpdated = new Date();
};

const app = () => {
  const state = {
    form: {
      processState: 'filling',
      valid: false,
      urlValue: '',
      errors: [],
    },
    feed: {
      needToUpdated: null,
      selectedChannel: '',
      channels: [],
      posts: [],
      statusRequest: {},
    },
  };

  const form = document.getElementById('form');
  const input = document.getElementById('url');

  input.addEventListener('input', (evt) => {
    state.form.urlValue = evt.target.value;
    const listUrls = state.feed.channels.map(({ url }) => url);
    try {
      validateUrl(state.form.urlValue, listUrls);
      state.form.valid = true;
      state.form.errors = [];
    } catch (err) {
      state.form.valid = false;
      state.form.errors = [err.type];
    }
  });

  form.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const url = state.form.urlValue.trim();

    if (url === '') return;

    state.form.processState = 'sending';

    getFeed(url, state);
  });

  i18next.init(
    {
      lng: 'en',
      resources,
    },
  ).then((texts) => {
    setWatches(state, handleOnClickChannel, texts);
  });
};

export default app;
