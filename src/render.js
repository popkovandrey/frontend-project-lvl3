/* eslint no-unused-vars: 0 */
import { watch } from 'melanke-watchjs';
import { isEqual } from 'lodash';
import i18next from 'i18next';

const addLeadingZero = (num) => (num < 10 ? `0${num}` : num.toString());

const render = (state, handleOnClickChannel) => {
  const input = document.getElementById('url');
  const submit = document.getElementById('btn_submit');
  const errorDiv = document.getElementById('err_div');
  const divAlert = document.getElementById('div_alert');
  const divChannels = document.getElementById('col_channels');
  const divItems = document.getElementById('col_items');

  watch(state.form, 'valid', () => {
    submit.disabled = !state.form.valid;
  });

  watch(state.form, 'process', (prop, action, newvalue, oldvalue) => {
    if (newvalue === 'requested') {
      input.value = '';
      submit.textContent = i18next.t('statusRequested');
      submit.disabled = true;
    } else if (newvalue === 'executed') {
      submit.textContent = i18next.t('defaultValBtnAddChannel');
      submit.disabled = false;
    }
  });

  watch(state.form, 'errors', () => {
    if (isEqual(state.form.errors, {})) {
      if (input.classList.contains('is-invalid')) {
        input.classList.remove('is-invalid');
      }
    } else {
      [errorDiv.textContent] = Object.values(state.form.errors);

      if (!input.classList.contains('is-invalid')) {
        input.classList.add('is-invalid');
      }
    }
  });

  watch(state.form.alertMsg, 'text', (prop, action, newvalue, oldvalue) => {
    if (newvalue === '') {
      return;
    }

    const textMapping = {
      success: i18next.t('requestStatus.success', { requestStatusText: state.form.requestStatusText, interpolation: { escapeValue: false } }),
      badRequest: i18next.t('requestStatus.badRequest', { requestStatusText: state.form.requestStatusText, interpolation: { escapeValue: false } }),
      emptyResponse: i18next.t('requestStatus.emptyResponse'),
    };

    divAlert.textContent = textMapping[newvalue];
    divAlert.removeAttribute('class');
    divAlert.setAttribute('class', 'alert');
    divAlert.classList.add(state.form.alertMsg.type);
    divAlert.removeAttribute('hidden');
    setTimeout(() => divAlert.setAttribute('hidden', ''), state.form.alertMsg.msCount);
  });

  watch(state.feed, 'update', () => {
    const { channels } = state.feed;

    if (isEqual(channels, [])) {
      return;
    }

    divChannels.innerHTML = '';
    divItems.innerHTML = '';

    channels.forEach((channel) => {
      const a = document.createElement('a');
      a.setAttribute('href', '#');
      a.setAttribute('data-url', channel.url);
      a.textContent = channel.data.title;

      const p = document.createElement('p');
      const h4 = document.createElement('h4');
      const h6 = document.createElement('h6');

      if (state.feed.selectedChannel === channel.url) {
        a.setAttribute('style', 'color: red');
        a.textContent = `# ${a.textContent}`;
      }

      const date = channel.updated;
      const hh = addLeadingZero(date.getHours());
      const mm = addLeadingZero(date.getMinutes());
      const ss = addLeadingZero(date.getSeconds());

      h6.textContent = `${channel.data.description} [ ${channel.data.items.length} шт., ${hh}:${mm}:${ss} ]`;
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

        channel.data.items.forEach((item) => {
          strItems = `${strItems}<p><a href="${item.link}" title="${item.description}" 
           target="_blank">${item.title}</a></p>`;
        });

        divItems.innerHTML = strItems;
      }
    });
  });
};

export default render;
