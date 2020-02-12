export default (inputData) => {
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(inputData.data, 'text/xml');
    const result = {};

    result.title = doc.querySelector('title').textContent;
    result.description = doc.querySelector('description').textContent;
    result.link = doc.querySelector('link').textContent;
    
    const [...items] = doc.querySelectorAll('item');
    const elems = items.map((item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;
      const pubDate = item.querySelector('pubDate').textContent;

      return { title, link, description, pubDate };
    });
    result.items = elems;
  
    return result;
  };