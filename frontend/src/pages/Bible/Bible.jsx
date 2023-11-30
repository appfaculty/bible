import React, { useEffect, useRef, useState } from "react";
import { Header } from "../../components/Header/index.jsx";
import { Verses } from "./components/Verses/index.jsx";
import { Notes } from "./components/Notes/index.jsx";
import { NavNextPrevChapter } from "./components/NavNextPrevChapter/index.jsx";
import { Box, Button, Container, Flex, Loader, Notification, Paper, ScrollArea, Space, Text, Tooltip, useComputedColorScheme } from '@mantine/core';
import { Grid } from '@mantine/core';
import { useNavigate, useParams } from "react-router-dom";
import { useAjax } from '../../hooks/useAjax';
import { IconArrowNarrowDown, IconArrowNarrowUp, IconBallpen, IconBallpenOff, IconColumns1, IconColumns2, IconDownload, IconEdit, IconEditOff, IconLayoutSidebarRightCollapse, IconNotebook, IconNotebookOff, IconX } from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { getNextChapter, getPrevChapter, getPrevVerse, getNextVerse } from "../../utils/index.js";
import classes from './Bible.module.css';
import { InstallPWA } from "./components/InstallPWA/index.jsx";

export function Bible() {

  let { book = 'Matthew', chapter = 1, verse = 0 } = useParams();
  chapter = parseInt(chapter)
  verse = parseInt(verse)
  const [fetchResponse, fetchError, fetchLoading, fetchAjax, setFetchData] = useAjax(); // destructure state and fetch function
  const [fetchNResponse, fetchNError, fetchNLoading, fetchNAjax, setFetchNData] = useAjax(); // destructure state and fetch function
  const [fetchPResponse, fetchPError, fetchPLoading, fetchPAjax, setFetchPData] = useAjax(); // destructure state and fetch function
  const currentPassage = book + '/' + chapter
  const [verses, setVerses] = useState({});
  const [currentVerses, setCurrentVerses] = useState({});
  const [selectedVerse, setSelectedVerse] = useState({verse: 0});
  const isMobile = useMediaQuery("(max-width: 62em)");
  const [notesOpened, notesPanelHandlers ] = useDisclosure(false);
  const [notesEnabled, notesEnabledHandlers ] = useDisclosure(true);
  const notesViewport = useRef(null);
  const versesViewport = useRef(null);
  const navigateTo = useNavigate()
  const nextVerse = getNextVerse(book, chapter, verse)
  const prevVerse = getPrevVerse(book, chapter, verse)
  const nextChapter = getNextChapter(book, chapter)
  const prevChapter = getPrevChapter(book, chapter)
  const computedColorScheme = useComputedColorScheme()
  const dark = computedColorScheme === 'dark'

  useEffect(() => {
    if (isMobile === undefined) {
      return
    }
    notesPanelHandlers.close()
    if (!isMobile && notesEnabled) {
      notesPanelHandlers.open()
    }
  }, [isMobile])

  // Handle book or chapter changed.
  useEffect(() => {
    getVerses(book, chapter, fetchAjax)
    getVerses(nextChapter.book, nextChapter.chapter, fetchNAjax)
    getVerses(prevChapter.book, prevChapter.chapter, fetchPAjax)
    document.title = title()
  }, [book, chapter]);
  
  // Handle verse changed.
  useEffect(() => {
    notesViewport.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [verse])

  const scrollVersesViewport = (y, behavior = 'smooth') => {
    versesViewport.current.scrollTo({ top: y, behavior: behavior });
  }

  const title = () => {
    return book.replaceAll("-", " ") + ' ' + chapter + (verse ? ':' + verse : (selectedVerse.verse ? ':' + selectedVerse.verse : ''));
  }

  const getVerses = (fbook, fchapter, fetch) => {
    const alreadyLoaded = Object.keys(verses).includes(fbook + '/' + fchapter);
    const currentChapter = fbook == book && fchapter == chapter
    if (alreadyLoaded && currentChapter) { // Dont set verse if loading next/prev chapters.
      findAndSetVerse(verse)
    } 
    if (!alreadyLoaded) {
      if (currentChapter) {
        setSelectedVerse({verse: 0})
      }
      fetch({
        query: {
          methodname: 'local_bible-get_scripture',
          book: fbook,
          chapter: fchapter,
        }
      })
    }
  }
  
  // Store the verses data after successful fetch.
  useEffect(() => {
    if (fetchResponse && !fetchError) {
      // Set the verses.
      const key = fetchResponse.data.book + '/' + fetchResponse.data.chapter
      setVerses(current => {
        return {...current, [key]: [...fetchResponse.data.verses]}
      })
    }
  }, [fetchResponse]);

  useEffect(() => {
    if (fetchNResponse && !fetchNError) {
      // Set the verses.
      const key = fetchNResponse.data.book + '/' + fetchNResponse.data.chapter
      setVerses(current => {
        return {...current, [key]: [...fetchNResponse.data.verses]}
      })
    }
  }, [fetchNResponse]);

  useEffect(() => {
    if (fetchPResponse && !fetchPError) {
      // Set the verses.
      const key = fetchPResponse.data.book + '/' + fetchPResponse.data.chapter
      setVerses(current => {
        return {...current, [key]: [...fetchPResponse.data.verses]}
      })
    }
  }, [fetchPResponse]);

  // When the verses data changes or the current passage change (navigated or a chapter is fetched and stored) update the current verses if necessary.
  // We don't use verses object directly as it triggers effects multiple times for next and prev chapters loaded.
  useEffect(() => {
    // If current verses are not set to the current passage.
    if (verses.hasOwnProperty(currentPassage) && !currentVerses.hasOwnProperty(currentPassage)) {
      setCurrentVerses({[currentPassage]: [...verses[currentPassage]]})
    }
  }, [verses, currentPassage])

  // When the verses data changes (a chapter is fetched and stored) set the selected verse from URL.
  useEffect(() => {
    findAndSetVerse(verse)
  }, [currentVerses])

  // Function to find and set a verse by number.
  const findAndSetVerse = (number) => {
    const n = parseInt(number)

    if (!n) {
      setSelectedVerse({verse: 0})
      return
    }

    if (selectedVerse && selectedVerse.verse == n) {
      return
    }

    if (verses[currentPassage] === undefined) {
      return
    }

    const theVerse = verses[currentPassage].filter(v => {
      return v.verse === n
    })
    setSelectedVerse(...theVerse)
  }

  const handleVerseClick = (number) => {
    findAndSetVerse(number)
    if (notesEnabled) {
      notesPanelHandlers.open()
    }
  }

  const closeNotesPanel = () => {
    notesPanelHandlers.close()
  }

  const loadPreviousNotes = () => {
    navigateTo(prevVerse.url)
    findAndSetVerse(prevVerse.verse)
  }

  const loadNextNotes = () => {
    navigateTo(nextVerse.url)
    findAndSetVerse(nextVerse.verse)
  }
  
  // Regen the title whenever a verse is selected.
  useEffect(() => {
    document.title = title();
  }, [selectedVerse])

  const goTo = (verse) => {
    navigateTo(verse.url)
    handleVerseClick(verse.verse)
  }
  
  return (
    <>
      <Header book={book} chapter={chapter} verse={verse} />

      <Box 
        pos="relative" 
        style={{
          overflow: "hidden",
        }}
      >
        <Container fluid size="lg" p={0} m={0}>
          
          <Grid grow gutter={0} m={0} styles={{inner: {margin: 0} }}>
            <Grid.Col span={{ base: 12, md: 6, lg: 5 }} p={0} display={isMobile && notesOpened && notesEnabled ? "none" : null}>
             
              <ScrollArea 
                className={classes.vh100} 
                viewportRef={versesViewport}
              >
                <Box 
                  py={isMobile ? 20 : 27} 
                  pl={isMobile ? 22 : 32} 
                  pr={isMobile ? 15 : 35} 
                  maw={800} 
                  m="auto"
                >
                  <Verses book={book} chapter={chapter} title={title()} verses={currentVerses[currentPassage] ? currentVerses[currentPassage] : []} verse={selectedVerse} setVerse={handleVerseClick} scroll={scrollVersesViewport} />
                  { (fetchLoading || !currentVerses.hasOwnProperty(currentPassage)) && <Loader size="sm" /> }
                  <Space h="sm" />
                  { currentVerses.hasOwnProperty(currentPassage) && <NavNextPrevChapter next={nextChapter} prev={prevChapter} /> }
                </Box>
              </ScrollArea>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6, lg: 7 }} p={0} display={(isMobile && !notesOpened) || !notesEnabled ? "none" : null}>
           
              <ScrollArea
                bg={dark ? "dark.6" : "#faf8f7"}
                className={classes.vh100} 
                viewportRef={notesViewport}
                pos="relative"
              >
                <Box 
                  className={classes.vh100}
                  pr={67}
                  py={isMobile ? 20 : 27} 
                  pl={isMobile ? 13 : 23} 
                >
                  <Notes book={book} chapter={chapter} verse={verse} text={selectedVerse?.text}/>
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
              <Button onClick={() => closeNotesPanel()} size="compact-md" variant="light" color="dark" h={34} mb="xs"><IconX size="1rem"/></Button> 
            }

            { notesOpened &&
              <Button.Group orientation="vertical">
                <Tooltip label="Previous verse" withArrow position="left">
                  <Button onClick={() => goTo(prevVerse)} size="compact-md" variant="light" h={34}><IconArrowNarrowUp size="1rem"/></Button>
                </Tooltip>
                <Tooltip label="Next verse" withArrow position="left">
                  <Button onClick={() => goTo(nextVerse)} size="compact-md" variant="light" h={34}><IconArrowNarrowDown size="1rem"/></Button>
                </Tooltip>
                <Tooltip label="Disable notes panel" withArrow position="left">
                  <Button onClick={() => {notesEnabledHandlers.close(); notesPanelHandlers.close()} } size="compact-md" variant="light" h={34}><IconBallpenOff size="1rem"/></Button>
                </Tooltip>
              </Button.Group>
            }

            {!notesEnabled &&
            <Paper
              orientation="vertical"
              pos="fixed" 
              bottom={15}
              right={20} 
              radius="50%"
              shadow="xl"
            >
              <Tooltip label="Open notes" withArrow position="left">
                <Button 
                  onClick={() => {notesEnabledHandlers.open(); notesPanelHandlers.open()}} 
                  size="compact-md" 
                  variant="light" 
                  h={50}
                  w={50}
                  radius="50%"
                  bg="rgba(34,139,230,.2)"
                >
                  <IconBallpen size="1.4rem"/>
                </Button>
              </Tooltip>
            </Paper>
            }
          
          
          </Box>
        </Container>
      </Box>
      <InstallPWA />
      


      

    </>
  );
};