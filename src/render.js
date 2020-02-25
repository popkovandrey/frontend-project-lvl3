/* eslint no-unused-vars: 0 */
import { watch } from 'melanke-watchjs';
import _ from 'lodash';

const render = (state, handleOnClickChannel, texts) => {
  const input = document.getElementById('url');
  const submit = document.getElementById('btn_submit');
  const errorDiv = document.getElementById('err_div');
  const divAlert = document.getElementById('div_alert');
  const divChannels = document.getElementById('col_channels');
  const divItems = document.getElementById('col_items');

  watch(state.form, 'valid', () => {
    submit.disabled = !state.form.valid;
  });

  watch(state.feed, 'goodRequest', () => {
    input.value = '';
  });

  watch(state.feed, 'statusRequest', (prop, action, newvalue, oldvalue) => {
    if (newvalue === {}) return;

    const textMapping = {
      success: texts('requestStatus.success'),
      bad: texts('requestStatus.bad', { errMessage: newvalue.message, interpolation: { escapeValue: false } }),
    };

    const typeAlertMapping = {
      success: 'alert-success',
      bad: 'alert-danger',
    };

    divAlert.textContent = textMapping[newvalue.status];
    divAlert.removeAttribute('class');
    divAlert.setAttribute('class', 'alert');
    divAlert.classList.add(typeAlertMapping[newvalue.status]);
    divAlert.removeAttribute('hidden');

    setTimeout(() => divAlert.setAttribute('hidden', ''), 5000);
  });


  watch(state.form, 'processState', (prop, action, newvalue, oldvalue) => {
    switch (newvalue) {
      case 'requested':
        submit.textContent = texts('statusRequested');
        submit.disabled = true;
        break;
      case 'executed':
        submit.textContent = texts('defaultValBtnAddChannel');
        submit.disabled = false;
        break;
      default:
        break;
    }
  });

  watch(state.form, 'errors', () => {
    if (_.isEqual(state.form.errors, {})) {
      if (input.classList.contains('is-invalid')) {
        input.classList.remove('is-invalid');
      }
    } else {
      const [err] = Object.values(state.form.errors);
      errorDiv.textContent = texts(`errorMessage.${err}`);

      if (!input.classList.contains('is-invalid')) {
        input.classList.add('is-invalid');
      }
    }
  });

  watch(state.feed, 'update', () => {
    const { channels, posts } = state.feed;

    if (_.isEqual(channels, [])) return;

    divChannels.innerHTML = '';
    divItems.innerHTML = '';

    channels.forEach((channel) => {
      const { data } = _.find(posts, { id: channel.postsId });

      const a = document.createElement('a');
      a.setAttribute('href', '#');
      a.setAttribute('data-url', channel.url);
      a.textContent = data.title;

      const p = document.createElement('p');
      const h4 = document.createElement('h4');
      const h6 = document.createElement('h6');

      if (state.feed.selectedChannel === channel.url) {
        a.setAttribute('style', 'color: red');
        a.textContent = `# ${a.textContent}`;
      }

      const date = channel.updated;
      const hh = date.getHours().toString().padStart(2, '0');
      const mm = date.getMinutes().toString().padStart(2, '0');
      const ss = date.getSeconds().toString().padStart(2, '0');

      h6.textContent = `${data.description} [ ${data.items.length} шт., ${hh}:${mm}:${ss} ]`;
      h4.append(a);
      p.append(h4);
      p.append(h6);
      divChannels.append(p);

      a.addEventListener('click', (evt) => {
        evt.preventDefault();

        handleOnClickChannel(channel.url, state);
      });

      if (channel.url === state.feed.selectedChannel) {
        let strItems = '';

        data.items.forEach((item) => {
          strItems = `${strItems}<p><a href="${item.link}" title="${item.description}"
           target="_blank">${item.title}</a></p>`;
        });

        divItems.innerHTML = strItems;
      }
    });
  });
};

export default render;
