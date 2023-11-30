import { Grid, Box, Button, Group } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks';
import { IconArrowNarrowLeft, IconArrowNarrowRight } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom';

export function NavNextPrevChapter({prev, next}) {
  const isMobile = useMediaQuery("(max-width: 62em)");

  const navigateTo = useNavigate()

  return (
    <Group justify={isMobile ? "flex-start" : "space-between"} gap={2}>
      <Button onClick={() => navigateTo(prev.url)} size="compact-sm" variant="light" leftSection={<IconArrowNarrowLeft size="1rem"/>}>{prev.book.replaceAll("-", " ")} {prev.chapter}</Button>
      <Button onClick={() => navigateTo(next.url)} size="compact-sm" variant="light" rightSection={<IconArrowNarrowRight size="1rem"/>}>{next.book.replaceAll("-", " ")} {next.chapter}</Button>
    </Group>
  );
};
