import { Box, Button, Center, Loader, Paper, Space, useComputedColorScheme } from '@mantine/core';
import { Text } from '@mantine/core';
import { useAjax } from '../../../../hooks/useAjax';
import { useEffect, useState } from 'react';
import { EditorPopout } from '../EditorPopout';
import { EditorInline } from '../EditorInline';
import { useDisclosure } from '@mantine/hooks';
import classes from './Notes.module.css';
import { v4 as uuidv4 } from 'uuid';


export function Notes({book, chapter, verse, text}) {
  const [fetchResponse, fetchError, fetchLoading, fetchAjax] = useAjax(); // destructure state and fetch function
  const [submitResponse, submitError, submitLoading, submitAjax, setSubmitData] = useAjax(); // destructure state and fetch function
  const [submitting, setSubmitting] = useState([])
  const [queue, setQueue] = useState([])
  const [notes, setNotes] = useState({})
  const [hasMore, setHasMore] = useState({})
  const [page, setPage] = useState({})
  const [loadedPages, setLoadedPages] = useState({})
  const [selectedNote, setSelectedNote] = useState({id: 0});
  const [opened, { open, close }] = useDisclosure(false);
  const scripture = book + '/' + chapter + '/' + verse

  const computedColorScheme = useComputedColorScheme()
  const dark = computedColorScheme === 'dark'

  useEffect(() => {
    if (!page[scripture]) {
      setPage(current => ({...current, [scripture]: 1}))
    }
  }, [scripture]);

  useEffect(() => {
    const pnum = page[scripture] ? page[scripture] : 1;
    // Don't reload what we've already loaded.
    if (pnum <= loadedPages[scripture] ) {
      return;
    }
    fetchAjax({
      query: {
        methodname: 'local_bible-get_notes',
        page: pnum,
        book: book,
        chapter: chapter,
        verse: verse,
      }
    })
  }, [page]);

  useEffect(() => {
    if (fetchResponse && !fetchError) {
      const scrip = fetchResponse.data.scripture
      let updatedNotes = {...notes}
      if (notes.hasOwnProperty(scrip)) {
        // Appended freshly fetched notes to existing.
        // Do not include notes that are already in the list.
        let uniqueNotes = fetchResponse.data.notes.filter(newNote => !notes[scrip].find(exsistingNote => newNote.id === exsistingNote.id))
        updatedNotes[scrip] = [...updatedNotes[scrip], ...uniqueNotes]
      } else {
        updatedNotes[scrip] = fetchResponse.data.notes
      }
      setNotes(updatedNotes)
      setLoadedPages(current => ({...current, [scripture]: fetchResponse.data.page}))
      setHasMore(current => ({...current, [scrip]: fetchResponse.data.hasNextPage}))
    }
  }, [fetchResponse]);

  const getNextPage = () => {
    setPage(current => ({...current, [scripture]: current[scripture] + 1}))
  }

  const handleNoteClick = (note) => {
    setSelectedNote(note)
    open()
  }

  const handleNoteSave = (note) => {
    note.submitting = true
    note.scripture = scripture

    let data = {
      id: 0,
      uuid: 0,
      ...note,
    }

    if (note.id) {
      data.id = note.id
      // Update existing note on screen.
      let updatedNotes = {...notes}
      updatedNotes[scripture] = updatedNotes[scripture].map((n) =>
        n.id === note.id ? note : n
      ),
      setNotes(updatedNotes);
    } else {
      // Add note on screen.
      data.uuid = note.uuid = uuidv4()
      setSubmitting(current => [note, ...current])
    }

    // Add to queue for sending to server.
    setQueue(current => [...current, data])
  }

  useEffect(() => {
    if (!queue.length || submitLoading) {
      return
    }
    const data = queue[0]
    submitAjax({
      method: "POST", 
      body: {
        methodname: 'local_bible-post_note',
        args: data,
      }
    })
  }, [queue])

  useEffect(() => {
    if (submitResponse && !submitError) {
      const scrip = submitResponse.data.scripture
      if (submitResponse.data.uuid) {
        // New note was inserted.
        // Find the submitted note by UUID.
        const submittedNote = submitting.find(note => note.uuid === submitResponse.data.uuid)
        if (submittedNote) {
          submittedNote.id = submitResponse.data.id
          submittedNote.submitting = false

          // Remove from submitting.
          setSubmitting( 
            (current) => current.filter(function( note ) {
              return note.uuid !== submitResponse.data.uuid;
            })
          )

          // Add to notes list.
          let updatedNotes = {...notes}
          updatedNotes[scrip] = updatedNotes[scrip] !== undefined ? [submittedNote, ...updatedNotes[scrip]] : [submittedNote]
          setNotes(updatedNotes)
        }

      } else {
        // Remove submitting status from existing note.
        setNotes(current => ({...current, [scrip]: current[scrip].map((note) =>
          // Create a new object with the updated property, or return the note as is.
          note.id === submitResponse.data.id ? {...note, submitting: false} : note
        )}));
      }
    }

    // Remove from queue.
    if (submitResponse || submitError) {
      setQueue(current => current.slice(1))
    }

  }, [submitResponse]);

  const deleteAndClose = (note) => {
    // Remove from notes.
    setNotes(current => ({...current, [note.scripture]: current[note.scripture].map((n) =>
      n.id === note.id ? {...n, deleted: true} : n
    )}));
    close()
  }

  const title = () => {
    return (
      !!verse
      ? text && 
        <Box className='verse cursor-text'>
          <Text span fw={600}>{verse}</Text>
          <Text span>&nbsp;&nbsp;</Text><Text span fw={400} lts="0.006rem" lh={1.25}>
            <span dangerouslySetInnerHTML={{__html: text}}/>
          </Text>
        </Box>
      : <Box>
          <Text span fw={600}>Chapter notes</Text>
        </Box>
    )
  }


  const Note = (note) => {
    if (note.deleted) {
      return null;
    }
    let submittingClass = note.submitting ? classes.submitting : ''
    let noteClass = dark ? `${classes.note} ${classes.notedark}` : classes.note
    return (
      <Box 
        className={`${noteClass} ${submittingClass}`} 
        key={note.id} 
        py="sm" 
        px="sm" 
        w="100%" 
        pos="relative"
        style={{
          borderRadius: '0.25rem'
        }}
        bg={note.submitting ? dark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' : 'transparent'}
        mb={1}
      >
          <Text fz="1rem" opacity={note.submitting ? '0.5' : '1'}>
            <span className='note cursor-text' dangerouslySetInnerHTML={{__html: note.text}}/>
          </Text>
          { note.submitting
            ? <Loader 
                size="xs" 
                pos="absolute"
                top={-8}
                left={-7}
              />
            : <Paper className={classes.buttonWrap} pos="absolute" top={-12} left={-15}><Button radius="sm" variant="light" size="compact-sm" className={classes.button} onClick={() => handleNoteClick(note)} >Edit</Button></Paper>
          }
      </Box>
    )
  }

  return (
    <div>
      <Box pl="sm">{title()}</Box>
      <Space h="sm" />
      <EditorInline save={handleNoteSave} />

      {fetchLoading && page[scripture] == 1 && <Loader m="sm" size="sm" /> }

      <Box mt="md" className="notes">
        
        { submitting.map((note) => {
          return Note(note)
        })} 

        {notes[scripture] && notes[scripture].map((note) => {
            return Note(note)
        })}

        { hasMore[scripture] &&
          <Center p="sm">
            <Button variant="light" loading={fetchLoading && page[scripture] > 1} onClick={() => getNextPage()} size="compact-sm" px="sm" radius="xl" >Load more</Button>
          </Center>
        }
      </Box>

      <EditorPopout opened={opened} close={close} note={selectedNote} title={title()} save={handleNoteSave} deleted={deleteAndClose}/>
   
    </div>
  );



}