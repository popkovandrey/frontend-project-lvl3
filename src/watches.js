import { watch } from 'melanke-watchjs';
import _ from 'lodash';
import { format } from 'date-fns';

const setWatches = (state, handleOnClickChannel, texts) => {
  const { feed, form } = state;
  const input = document.getElementById('url');
  const submit = document.getElementById('btn_submit');
  const errorDiv = document.getElementById('err_div');
  const divAlert = document.getElementById('div_alert');
  const divChannels = document.getElementById('col_channels');
  const divItems = document.getElementById('col_items');

  watch(form, 'valid', () => {
    submit.disabled = !form.valid;
  });

  watch(form, 'urlValue', () => {
    input.value = form.urlValue;
  });

  watch(feed, 'statusRequest', () => {
    const newvalue = feed.statusRequest;

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


  watch(form, 'processState', () => {
    const { processState } = form;

    switch (processState) {
      case 'sending':
        submit.textContent = texts('statusRequested');
        submit.disabled = true;
        input.disabled = true;
        break;
      case 'filling':
        submit.textContent = texts('defaultValBtnAddChannel');
        submit.disabled = false;
        input.disabled = false;
        break;
      case 'finished':
        submit.textContent = texts('defaultValBtnAddChannel');
        submit.disabled = true;
        input.disabled = false;
        break;
      default:
        throw new Error(`Unknown processState form: ${processState}!`);
    }
  });

  watch(form, 'errors', () => {
    input.classList.remove('is-invalid');

    if (form.urlValue === '' || form.errors.length === 0) {
      return;
    }

    const [err] = form.errors;

    errorDiv.textContent = texts(`errorMessage.${err}`);

    input.classList.add('is-invalid');
  });

  watch(feed, 'needToUpdated', () => {
    const { channels, posts } = feed;

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

      if (feed.selectedChannel === channel.url) {
        a.setAttribute('style', 'color: red');
        a.textContent = `# ${a.textContent}`;
      }

      h6.textContent = `${data.description} [ ${data.items.length} шт., ${format(channel.updated, 'HH:mm:ss')} ]`;
      h4.append(a);
      p.append(h4);
      p.append(h6);
      divChannels.append(p);

      a.addEventListener('click', (evt) => {
        evt.preventDefault();

        handleOnClickChannel(channel.url, state);
      });

      if (channel.url === feed.selectedChannel) {
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

export default setWatches;
