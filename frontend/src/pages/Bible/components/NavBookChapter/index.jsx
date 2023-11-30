import { Grid, Select, Box, Button } from '@mantine/core'
import { IconVocabulary } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { bible } from '../../../../data/bible.js'
import { useNavigate } from 'react-router-dom';

export function NavBookChapter({book, chapter}) {

  const navigateTo = useNavigate()

  const [selBook, setBook] = useState(book)
  const [selChapter, setChapter] = useState(chapter.toString())

  const [bookList, setBookList] = useState([])
  const [chapterList, setChapterList] = useState([])

  const focusRef = useRef();

  useEffect(() => {
    // Load books.
    loadBooks()
  }, [])

  useEffect(() => {
    // Load chapters.
    loadChapters(selBook)
  }, [selBook])

  const changeBook = (e) => {
    setBook(e)
    focusRef.current?.blur()
    let url = '/' + e + '/' + chapter; 
    if (e != book) {
      url = '/' + e + '/';
      setChapter('1')
    }
    navigateTo(url)
  }

  const changeChapter = (e) => {
    setChapter(e)
    let url = '/' + selBook + '/' + e;
    navigateTo(url)
  }

  const loadBooks = () => {
    let OT = Object.keys(bible).splice(0, 39)
    let NT = Object.keys(bible).splice(39)

    OT = OT.map((book, i) => (
      { value: book, label: book.replaceAll("-", " ") }
    ))
    NT = NT.map((book, i) => (
      { value: book, label: book.replaceAll("-", " ") }
    ))

    let books = [
      { group: 'Old Testament', items: OT  },
      { group: 'New Testament', items: NT },
    ]

    setBookList(books)
  }

  const loadChapters = (book) => {
    let chapters = Object.keys(bible[book]).map((chapter, i) => (
      { value: chapter, label: chapter }
    ))
    setChapterList(chapters)
  }

  return (
    <Box maw={400}>
      <Grid gutter="sm">
        <Grid.Col span={8}>
          <Select
            placeholder="Book"
            leftSection={<IconVocabulary size="1rem" />}
            maxDropdownHeight={400}
            value={selBook}
            onChange={changeBook}
            searchable
            size="sm"
            styles={{
              input: {
                border: '0 none',
              }
            }}
            withCheckIcon={false}
            data={bookList ? bookList : []}
            onFocus={(e) => e.target.select()}
            allowDeselect={false}
            ref={focusRef}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            data={chapterList}
            placeholder="Chapter"
            maxDropdownHeight={400}
            value={selChapter}
            onChange={changeChapter}
            size="sm"
            withCheckIcon={false}
            styles={{
              input: {
                border: '0 none',
              }
            }}
            allowDeselect={false}
          />
        </Grid.Col> 
      </Grid>
    </Box>
  );
};