import { Container, Avatar, Menu, UnstyledButton, Group, Text, Box, ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconHash, IconLogout, IconMoon, IconSun } from '@tabler/icons-react';
import { fetchData, getConfig } from "../../utils/index.js";
import { useInterval, useMediaQuery } from "@mantine/hooks";
import { useEffect } from "react";
import { NavBookChapter } from "../../pages/Bible/components/NavBookChapter/index.jsx";
import { Link } from 'react-router-dom';


export function Header({book, chapter, verse}) {
  const isMobile = useMediaQuery("(max-width: 62em)");
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const dark = computedColorScheme === 'dark'


  const checkAuthStatus = async () => {
    const response = await fetchData({
      query: {
        methodname: 'local_bible-check_login',
      }
    })
    if (response.error && (response.exception?.errorcode === 'requireloginerror' || response.errorcode === 'requireloginerror')) {
      window.location.replace(getConfig().loginUrl)
    }
  }
  const interval = useInterval(() => checkAuthStatus(), 30000); // 30 seconds.
  useEffect(() => {
    interval.start();
    return interval.stop;
  }, []);

  return (
    <Box bg={dark ? '#000000' : '#0F172A'}>
      <Container fluid pl={isMobile ? 20 : 30} pr={isMobile ? 20 : 40}>
        <Group h={54} justify="space-between" wrap="nowrap">

          <NavBookChapter book={book} chapter={chapter} />
          
          <Group wrap="nowrap">
            <ActionIcon
              variant="subtle"
              onClick={() => setColorScheme(dark ? 'light' : 'dark')}
              title="Toggle color scheme"
              aria-label="Toggle color scheme"
              color={dark ? 'yellow' : 'blue'}
            >
              {dark ? (
                <IconSun size="1rem" />
              ) : (
                <IconMoon size="1rem" />
              )}
            </ActionIcon>

            <Menu position="bottom-end" width={200} shadow="md">
              <Menu.Target>
                <UnstyledButton> 
                  <Group>
                    <Avatar size="sm" radius="xl" src={'/local/platform/avatar.php?username=' + getConfig().user.un} />
                    <Box visibleFrom="sm">
                      <Text size="sm" c='#fff'>{getConfig().user.fn + " " + getConfig().user.ln}</Text>
                    </Box>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconHash size={14} />} component={Link} to="/tags">Tags</Menu.Item>
                <Menu.Item leftSection={<IconLogout size={14} />} onMouseDown={() => window.location.replace(getConfig().logoutUrl)}>Logout</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
          
          
        </Group>
      </Container>
    </Box>
  );
}