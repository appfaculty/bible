import { ActionIcon, Image, Paper, Text, UnstyledButton } from '@mantine/core'
import { IconDownload, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react'
import logo from "../../../../assets/logo.svg"

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = e => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("transitionend", handler);
  }, []);

  const onClick = evt => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
    setSupportsPWA(false)
  };

  if (!supportsPWA) {
    return null;
  }

  return (
    <Paper 
      pos="absolute"
      bottom={15}
      right={15}
      shadow="lg" 
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
      bg="#0F172A"
      radius="sm"
    >
      <UnstyledButton 
        onClick={onClick}
        py="xs"
        px="md"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          borderRight: '1px solid #58696a',
        }}
        h={46}
      >
        <Image
          radius="sm"
          h={28}
          w="auto"
          fit="contain"
          src={logo}
        />
        <Text c="white">Install the app</Text>
        <IconDownload color="white" size="1rem" />
      </UnstyledButton>
      <ActionIcon 
        variant="transparent" 
        aria-label="Hide notification"
        w={38}
        h={46}
        onClick={(e) => setSupportsPWA(false)} 
        color="white"
        radius="lg"
      >
        <IconX size={"1.2rem"} stroke={1.5} />
      </ActionIcon>
    </Paper>
  );

};