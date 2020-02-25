export default (data) => {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(data, 'text/xml');
  const [...items] = doc.querySelectorAll('item');

  const newsItems = items.map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    const pubDate = item.querySelector('pubDate').textContent;

    return {
      title, link, description, pubDate,
    };
  });

  return {
    title: doc.querySelector('title').textContent,
    description: doc.querySelector('description').textContent,
    link: doc.querySelector('link').textContent,
    items: newsItems,
  };
};
