import React, { useEffect, useState } from "react";
import { Loader, Text, Box, Container } from "@mantine/core";
import { useAjax } from "../../hooks/useAjax";
import { useParams } from "react-router-dom";
import classes from './Print.module.css';


export function Print() { 
  let { tag = '' } = useParams();
  const [fetchNotesResponse, fetchNotesError, fetchNotesLoading, fetchNotesAjax, setFetchNotesData] = useAjax(); // destructure state and fetch function
  const [notes, setNotes] = useState([])

  useEffect(() => {
    if (!tag) {
      return
    }
    // if no tag supplied, return to tags page.
    fetchNotesAjax({
      query: {
        methodname: 'local_bible-get_notes_by_tag',
        tag: tag,
      }
    })
  }, [tag])

  useEffect(() => {
    if (fetchNotesResponse && !fetchNotesError) {
      setNotes(fetchNotesResponse.data.notes)
    }
  }, [fetchNotesResponse]);

  useEffect(() => {
    if (notes.length) {
      //Trigger print.
      window.print();
    }
  }, [notes])

  const NotesPanel = () => {
    return (
      <div>
        <Box className="notes">
          <Text fz="1.5rem" fw="600" mb="md">{tag}</Text>
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
      </div>
    );
  }

  const Note = (note) => {
    if (note.deleted) {
      return null;
    }
    return (
      <Box 
        key={note.id} 
        py="sm" 
        px="sm" 
        w="100%" 
        pos="relative"
        mb={1}
      >
        <Text fz="1rem">
          <span className='note cursor-text' dangerouslySetInnerHTML={{__html: note.text}}/>
        </Text>
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

  return (
    <Container fluid size="lg" p={40} m={0} bg="#fff" className={`${classes.mvh100} ${classes.print}`}>
      {NotesPanel()}
    </Container>
  );
};