const getConfig = () => {
  return window.appdata.config
};

const queryString = (params) => {
  return Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join("&")
}

const createUrl = (url, queryOptions) => {
  if (url === undefined) {
    url = getConfig().wwwroot + '/local/platform/service.php';
  }
  queryOptions = queryOptions || {}
  queryOptions.sesskey = getConfig().sesskey
  return url + "?" + queryString(queryOptions)
}

const fetchData = async (options, url) => {
  const defaultOptions = { 
    method: "GET", 
    body: {}, 
    query: {} 
  };
  const mergedOptions = { ...defaultOptions, ...options };

  if (! (mergedOptions.query || mergedOptions.body)) {
    throw new Error('Body or query required.'); 
  }

  const response = await fetch(createUrl(url, mergedOptions.query), {
    method: mergedOptions.method || "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: mergedOptions.method !== "GET" ? JSON.stringify(mergedOptions.body) : null,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred.');
  }

  return data;
};

const statuses = {
  unsaved: 0,
  saved: 1,
  live: 2,
}


import { bible } from '../data/bible.js'
import { books } from '../data/books.js'

const getPrevChapter = (book, chapter) => {
  chapter = parseInt(chapter);  
  const ibook = books.indexOf(book);
  const numbooks = books.length - 1;
  let previous = {};
  if (chapter === 1) {
      // Previous book.
      const pbook = ibook === 0 ? numbooks : ibook - 1;
      const pchapter = Object.keys(bible[books[pbook]]).length;
      previous = {
          book: books[pbook],
          chapter: pchapter,
          url: '/' + books[pbook] + '/' + pchapter
      };
  } else {
      const pchapter = chapter - 1;
      previous = {
          book: book,
          chapter: pchapter,
          url: '/' + book + '/' + pchapter
      };
  }
  return previous;
}

const getNextChapter = (book, chapter) => {
  chapter = parseInt(chapter);
  const ibook = books.indexOf(book);
  const numbooks = books.length - 1;
  const chapterlen = parseInt(bible[book][chapter]);
  let next = {};

  const numchapters = Object.keys(bible[book]).length;
  if (chapter === numchapters) {
    const nbook = ibook === numbooks ? 0 : ibook + 1;
    next = {
      book: books[nbook],
      chapter: 1,
      url: '/' + books[nbook] + '/1'
    };
  } else {
    next = {
      book: book,
      chapter: chapter + 1,
      url: '/' + book + '/' + (chapter+1)
    };
  }

  return next;
}


const getPrevVerse = (book, chapter, verse) => {
  chapter = parseInt(chapter);
  verse = parseInt(verse);
  
  const ibook = books.indexOf(book);
  const numbooks = books.length - 1;

  let previous = {};

  if (verse === 0) {
      if (chapter === 1) {
          // Previous book.
          const pbook = ibook === 0 ? numbooks : ibook - 1;
          const pchapter = Object.keys(bible[books[pbook]]).length;
          previous = {
              book: books[pbook],
              chapter: pchapter,
              verse: bible[books[pbook]][pchapter],
              url: '/' + books[pbook] + '/' + pchapter + '/' + bible[books[pbook]][pchapter]
          };
      } else {
          const pchapter = chapter - 1;
          previous = {
              book: book,
              chapter: pchapter,
              verse: bible[book][pchapter],
              url: '/' + book + '/' + pchapter + '/' + bible[book][pchapter]
          };
      }
  } else {
      previous = {
          book: book,
          chapter: chapter,
          verse: verse - 1,
          url: '/' + book + '/' + chapter + '/' + (verse - 1)
      };
  }
  return previous;
}

const getNextVerse = (book, chapter, verse) => {
  chapter = parseInt(chapter);
  verse = parseInt(verse);

  const ibook = books.indexOf(book);
  const numbooks = books.length - 1;
  const chapterlen = parseInt(bible[book][chapter]);

  let next = {};

  /*if (verse === 0) {
      next = {
          book: book,
          chapter: chapter,
          verse: verse + 1,
          url: '/' + book + '/' + chapter + '/' + (verse + 1)
      };
  } else {*/
      if (verse === chapterlen) {
          const numchapters = Object.keys(bible[book]).length;
          if (chapter === numchapters) {
              const nbook = ibook === numbooks ? 0 : ibook + 1;
              next = {
                  book: books[nbook],
                  chapter: 1,
                  verse: 0,
                  url: '/' + books[nbook] + '/1'
              };
          } else {
              next = {
                  book: book,
                  chapter: chapter + 1,
                  verse: 0,
                  url: '/' + book + '/' + (chapter+1)
              };
          }
      } else {
          next = {
              book: book,
              chapter: chapter,
              verse: verse + 1,
              url: '/' + book + '/' + chapter + '/' + (verse + 1)
          };
      }
  //}
  return next;
}



export { 
  fetchData, 
  getConfig, 
  queryString, 
  createUrl, 
  statuses, 
  getNextVerse, 
  getPrevVerse, 
  getNextChapter, 
  getPrevChapter 
};