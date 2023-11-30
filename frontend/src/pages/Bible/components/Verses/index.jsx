import { Box, Paper, Text, UnstyledButton, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Verses({book, chapter, verses, verse, title, setVerse, scroll}) {
  const navigateTo = useNavigate()
  const verseRef = useRef()
  const isMobile = useMediaQuery("(max-width: 62em)")
  const computedColorScheme = useComputedColorScheme()
  const dark = computedColorScheme === 'dark'

  useEffect(() => {
    if (verses.length && verse.verse && verseRef.current) {
      scroll(verseRef.current.offsetTop - 38)
    }
    if (verses.length && !verse.verse && verses[0].book_name == book.replaceAll('-', ' ') && verses[0].chapter == chapter) {
      scroll(0)
    }
  
  }, [verses, verse])

  // Select / deselect verse by clicking on it.
  const handleVerseClick = (number) => {
    window.getSelection().removeAllRanges()
    if (verse.verse == number) {
      if (!isMobile) {
        const url = '/' + book + '/' + chapter;
        setVerse(0)
        navigateTo(url)
      } else {
        setVerse(number)
      }
    } else {
      setVerse(number)
      const url = '/' + book + '/' + chapter + '/' + number;
      navigateTo(url)
    }
  }

  return (
    <Paper
      style={{overflowAnchor: "none"}} 
      bg="transparent" 
    >
      <UnstyledButton onClick={() => handleVerseClick(0)}><Text fz="1.5rem" fw="600" mb="md" >{title}</Text></UnstyledButton>
      <Box>
        {verses.map((v) => (
          <div key={v.verse}>
            <UnstyledButton 
              onClick={() => handleVerseClick(v.verse)}
              ref={verse.verse == v.verse ? verseRef : null}
              ml={isMobile ? "1.75rem" : "2rem"}
              mb="sm"
            >
              <Box pos="relative">
                <Text fw={600} left={isMobile ? "-1.75rem" : "-2rem"} top={0} pos="absolute" >{v.verse}</Text>
                <Text lh={1} span lts="0.006rem" c={verse.verse == v.verse || !dark ? 'dark.9' : 'dark.0'} bg={verse.verse == v.verse ? '#ffec99' : 'transparent'}><span dangerouslySetInnerHTML={{__html: v.text}}/></Text>   
              </Box>
            </UnstyledButton>
          </div>
        ))}
      </Box>
    </Paper>
    )
}
