import _ from 'lodash';
import axios from 'axios';
import checkValidateUrl from './validator';
import parseRSS from './parserRSS';
import { render, showDivAlert } from './render';

const proxy = 'cors-anywhere.herokuapp.com';

const state = {
  form: {
    process: 'filling',
    valid: null,
    urlValue: '',
    errors: {},
  },
  feed: {
    channels: [],
  },
};

const form = document.getElementById('form');
const input = document.getElementById('url');
const divAlert = document.getElementById('div_404');

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

  state.form.process = 'executed';
  
  const inputValue = state.form.urlValue;

  const channel = {
    url: inputValue,
  };

  axios.get(`https://${proxy}/${state.form.urlValue}`)
    .then((response) => {
      const feedData = parseRSS(response);
      channel.data = feedData;
      state.feed.channels.push(channel);
      console.log(state.feed.channels);
    })
    .catch((err) => {
      showDivAlert(divAlert, inputValue, 5000);
      console.log(err); 
    });
  
  state.form.urlValue = '';
});

render(state);