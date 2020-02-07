import { watch } from 'melanke-watchjs';

const render = (state) => {
  const input = document.getElementById('url');
  const submit = document.getElementById('btn_submit');
  const errorDiv = document.getElementById('err_div');

  watch(state.form, 'valid', () => {
    submit.disabled = !state.form.valid;
  });
      
  watch(state.form, 'process', () => {
    if (state.form.process === 'executed') {
      input.value = '';
      submit.disabled = true;
    }
  });
      
  watch(state.form, 'errors', () => {
    if (_.isEqual(state.form.errors, {})) {
      if (input.classList.contains('is-invalid')) 
        input.classList.remove('is-invalid');
    } else {
      errorDiv.textContent = Object.values(state.form.errors)[0];
  
      if (!input.classList.contains('is-invalid')) 
        input.classList.add('is-invalid');
    }
  });
}

const showDivAlert = (elementDiv, badUrl, msCount) => {
  elementDiv.textContent = `Request failed. The channel (${badUrl}) was not added to the list.`;
  elementDiv.removeAttribute('hidden');
  setTimeout(() => elementDiv.setAttribute('hidden', ''), msCount);
};

export { render, showDivAlert };