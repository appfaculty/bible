import { IconPrinter, IconX } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import { Anchor, Flex, Loader, Paper, Button, Text, Box, Container, Grid, ScrollArea, Tooltip, useComputedColorScheme } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import bibleclasses from '../Bible/Bible.module.css';
import notesclasses from '../Bible/components/Notes/Notes.module.css';
import classes from './Tags.module.css';
import { useAjax } from "../../hooks/useAjax";
import { EditorPopout } from "../Bible/components/EditorPopout";
import { generatePath, useLocation, useNavigate } from "react-router-dom";

export function Tags() { 
  const isMobile = useMediaQuery("(max-width: 62em)");
  const [notesOpened, notesPanelHandlers ] = useDisclosure(false);

  const [tags, setTags] = useState([]);
  const [fetchResponse, fetchError, fetchLoading, fetchAjax, setFetchData] = useAjax(); // destructure state and fetch function
  const [fetchNotesResponse, fetchNotesError, fetchNotesLoading, fetchNotesAjax, setFetchNotesData] = useAjax(); // destructure state and fetch function
  const [selectedTag, setSelectedTag] = useState('');

  const [notes, setNotes] = useState([])
  const [queue, setQueue] = useState([])
  const [openedEditNote, editNoteHandlers] = useDisclosure(false);
  const [selectedNote, setSelectedNote] = useState({id: 0});
  const [submitResponse, submitError, submitLoading, submitAjax, setSubmitData] = useAjax(); // destructure state and fetch function

  const computedColorScheme = useComputedColorScheme()
  const dark = computedColorScheme === 'dark'

  useEffect(() => {
    fetchAjax({
      query: {
        methodname: 'local_bible-get_tags_and_count',
      }
    })
  }, [])

  useEffect(() => {
    if (fetchResponse && !fetchError) {
      setTags(fetchResponse.data)
      if (fetchResponse.data.length) {
        loadNotes(fetchResponse.data[0].name)
      }
    }
  }, [fetchResponse]);

  const clickTag = (tag) => {
    loadNotes(tag)
    notesPanelHandlers.open()
  }

  const loadNotes = (tag) => {
    setSelectedTag(tag)
    fetchNotesAjax({
      query: {
        methodname: 'local_bible-get_notes_by_tag',
        tag: tag,
      }
    })
  }

  useEffect(() => {
    if (fetchNotesResponse && !fetchNotesError) {
      console.log(fetchNotesResponse.data.notes)
      setNotes(fetchNotesResponse.data.notes)
    }
  }, [fetchNotesResponse]);


  const TagsPanel = () => {
    return (
      <Paper
        style={{overflowAnchor: "none"}} 
        bg="transparent"
      >
        <Box>
          {tags.map((tag) => (
            <div key={tag.name}>
              <Button
                display="block"
                onClick={() => clickTag(tag.name)} 
                mb="sm"

                variant="light"
                radius="xl"
                size="compact-sm"
                rightSection={<Text c={dark ? "dark.1" : "dark.4"} fz="0.8rem">{tag.num}</Text>}
              >
                {tag.name}
              </Button>
            </div>
          ))}
          { fetchLoading && <Loader size="sm" /> }
        </Box>
      </Paper>
    )
  }

  const NotesPanel = () => {
    return (
      <div>
        <Box className="notes">
          <Text fz="1.5rem" fw="600" mb="md">{selectedTag}</Text>
          {!fetchNotesLoading && notes && notes.map((grouping) => {
            return (
              <div key={grouping.scripture}>
                {verseTitle(grouping.book, grouping.chapter, grouping.verse, grouping.text)}
                <Box my="md">
                  {
                    grouping.notes.map((note) => {
                      return Note(note)
                    })
                  }
                </Box>
              </div>
            )
          })}
          { fetchNotesLoading && <Loader size="sm" /> }
        </Box>
        <EditorPopout opened={openedEditNote} close={editNoteHandlers.close} note={selectedNote} title={verseTitle(selectedNote.book, selectedNote.chapter, selectedNote.verse, selectedNote.versetext)} save={handleNoteSave} deleted={deleteAndClose}/>
      </div>
    );
  }

  const Note = (note) => {
    if (note.deleted) {
      return null;
    }
    let submittingClass = note.submitting ? notesclasses.submitting : ''
    let noteClass = dark ? `${notesclasses.note} ${notesclasses.notedark}` : notesclasses.note
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
            : <Paper className={notesclasses.buttonWrap} pos="absolute" top={-12} left={-15}><Button radius="sm" variant="light" size="compact-sm" className={notesclasses.button} onClick={() => handleNoteClick(note)} >Edit</Button></Paper>
          }
      </Box>
    )
  }

  const verseTitle = (book, chapter, verse, text) => {
    return (
      <Box >
        { verse != 0
          ? <>
              <Text span fw={600}>{book} {chapter}:{verse}</Text>
              <Text span>&nbsp;&nbsp;</Text>
              <Text span fw={400} lts="0.006rem" lh={1.25}>
                <span dangerouslySetInnerHTML={{__html: text}}/>
              </Text>
            </>
          : <>
              <Text span fw={600}>{book} {chapter} chapter notes</Text>
            </>
        }
      </Box>
    )
  }

  const handleNoteClick = (note) => {
    setSelectedNote(note)
    editNoteHandlers.open()
  }

  const handleNoteSave = (note) => {
    note.submitting = true

    let updatedNotes = [...notes]
    const index = updatedNotes.map(function(e) { return e.scripture; }).indexOf(note.scripture);
    updatedNotes[index].notes = updatedNotes[index].notes.map((n) =>
      n.id === note.id ? note : n
    )
    setNotes(updatedNotes);

    // Add to queue for sending to server.
    setQueue(current => [...current, note])
  }

  // When the queue changes, send the next note change.
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

  // On submit response, update the queue.
  useEffect(() => {
    if (submitResponse && !submitError) {
      // Remove submitting status from note.
      let updatedNotes = [...notes]
      const index = updatedNotes.map(function(e) { return e.scripture; }).indexOf(submitResponse.data.scripture);
      updatedNotes[index].notes = updatedNotes[index].notes.map((n) =>
        // Create a new object with the updated property, or return the note as is.
        n.id === submitResponse.data.id ? {...n, submitting: false} : n
      )
      setNotes(updatedNotes);
    }
    // Remove from queue.
    if (submitResponse || submitError) {
      setQueue(current => current.slice(1))
    }
  }, [submitResponse]);

  const deleteAndClose = (note) => {
    // Remove from notes.
    let updatedNotes = [...notes]
    const index = updatedNotes.map(function(e) { return e.scripture; }).indexOf(note.scripture);
    updatedNotes[index].notes = updatedNotes[index].notes.filter(n => n.id !== note.id)
    updatedNotes = updatedNotes.filter(n => n.notes.length)
    setNotes(updatedNotes);
    editNoteHandlers.close()
  }
  
  const printNotes = () => {
    const printUrl = generatePath("print/:tag", { tag: selectedTag });
    openInNewTab(printUrl)
  }

  const openInNewTab = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  }

  return (
    <>
      <Header book={"Matthew"} chapter={1} verse={0} />

      <Box
        pos="relative" 
        style={{
          overflow: "hidden",
        }}
      >
        <Container fluid size="lg" p={0} m={0}>
          <Grid grow gutter={0} m={0} styles={{inner: {margin: 0} }}>

            <Grid.Col maw={isMobile ? null : 400} span={{ base: 12, md: 6 }} p={0} display={isMobile && notesOpened ? "none" : null}>
              <ScrollArea 
                className={bibleclasses.vh100} 
                bg={dark ? "dark.6" : "#faf8f7"} 
              >
                <Box 
                  py={isMobile ? 20 : 32} 
                  pl={isMobile ? 22 : 32} 
                  pr={isMobile ? 15 : 35} 
                >
                  {TagsPanel()}
                </Box>
              </ScrollArea>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }} p={0} display={isMobile && !notesOpened ? "none" : null}>
              <ScrollArea
                //bg="#fff"
                className={bibleclasses.vh100} 
                pos="relative"
              >
                <Box pos="relative"> 
                  <Box 
                    className={bibleclasses.vh100}
                    pr={67}
                    py={isMobile ? 20 : 27} 
                    pl={isMobile ? 23 : 33} 
                  >
                    {NotesPanel()}
                  </Box>
                </Box>
              </ScrollArea>
            </Grid.Col>

          </Grid>
          <Box
            pos="fixed" 
            top={70}
            right={15}
          >
            { isMobile && notesOpened &&
              <Button onClick={() => notesPanelHandlers.close()} size="compact-md" variant="light" color="dark" h={34} mb="xs"><IconX size="1rem"/></Button> 
            }
            { (!isMobile || notesOpened) &&
              <Button.Group orientation="vertical">
                <Tooltip label="Print preview" withArrow position="left">
                  <Button onClick={printNotes} size="compact-md" variant="light" h={34}><IconPrinter size="1rem"/></Button>
                </Tooltip>
              </Button.Group>
            }
            
          </Box>
        </Container>
      </Box>

      

    </>
  );
};
