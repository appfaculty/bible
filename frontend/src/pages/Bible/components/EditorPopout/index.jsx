import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { Placeholder } from '@tiptap/extension-placeholder';
import { ActionIcon, Box, Button, Group, Menu, Modal, Space, TagsInput, Text, useComputedColorScheme } from '@mantine/core';
import { IconChevronDown, IconTrash, IconX } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useAjax } from '../../../../hooks/useAjax';
import { modals } from '@mantine/modals';

export function EditorPopout({opened, close, title, note, save, deleted}) {
  const isMobile = useMediaQuery("(max-width: 62em)");

  const [fetchResponse, fetchError, fetchLoading, fetchAjax] = useAjax()
  const [deleteResponse, deleteError, deleteLoading, deleteAjax] = useAjax()
  const [tagsValue, setTagsValue] = useState([])
  const [tagsData, setTagsData] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const computedColorScheme = useComputedColorScheme()
  const dark = computedColorScheme === 'dark'

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      Subscript,
      Highlight,
      Placeholder.configure({ placeholder: 'Take a note...' }),
    ],
    content: note.text,
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(note.text)
    }
    setTagsValue(note.tags)
    // Fetch tags data.
    fetchAjax({
      query: {
        methodname: 'local_bible-get_tags',
      }
    })
  }, [note]);

  useEffect(() => {
    if (fetchResponse && !fetchError) {
      setTagsData(fetchResponse.data)
    }
  }, [fetchResponse]);

  const saveNote = () => {
    if (editor && editor.getText()) {
      save({...note, text: editor.getHTML(), tags: tagsValue})
    } else {
      return
    }
    setTagsValue([])
    close()
  }

  const addTypedTag = () => {
    if (searchValue.length) {
      setTagsValue((current) => [...current, searchValue])
      setSearchValue('')
    }
  }

  const onDelete = (note) => {
    modals.openConfirmModal({
      title: 'Delete note',
      centered: true,
      children: (
        <Text size="sm">Are you sure you want to delete this note?</Text>
      ),
      labels: { confirm: 'Delete', cancel: "Cancel" },
      confirmProps: { color: 'red', className: 'bg-mantine-red' },
      onConfirm: () => submitDelete(note),
    });
  }
  const submitDelete = (note) => {
    deleteAjax({
      method: "POST", 
      body: {
        methodname: 'local_bible-delete_note',
        args: {id: note.id},
      }
    });
    deleted(note)
  }

  return (

    <Modal
      opened={opened} 
      onClose={close}
      size="xl"        
      withCloseButton={false}
      styles={{
        body: {
          padding: 0,
        },
        content: {
          border: dark ? "0.0625rem solid rgb(63, 63, 63)" : "0 none",
        }
      }}
      overlayProps={{
        opacity: dark ? 1 : isMobile ? 0.6 : 0.4,
      }}
      closeOnClickOutside={false}
      
    >
      <Box pt="md" pb="sm" px="md" bg={dark ? "dark.8" : "#faf8f7"}>
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          {title}
          <Button radius="sm" variant="light" color={dark ? "dark.2" : "dark"} onClick={close} size="compact-sm" px={5}><IconX size="1rem" /></Button>
        </Group>
      </Box>
      <Box
        bg={dark ? "dark.6" : "white"}
        style={{
          overflow: "hidden",
        }}
      >
        <RichTextEditor 
          editor={editor}
          style={{
            border: "0 none",
          }}
        >
          <RichTextEditor.Toolbar 
            style={{border: "0 none"}}
            sticky
            my={9}
            bg="transparent"
          >
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Underline />
              <RichTextEditor.Superscript />
              <RichTextEditor.Subscript />
              <RichTextEditor.Highlight />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>

          <RichTextEditor.Content px="md" bg="transparent" fz="md" />
        </RichTextEditor>
        <Space h="sm" />
        <Group 
          py={10}
          px="md"
          style={{
            position: 'sticky',
            bottom: -1,
          }}
          justify="space-between"
          gap={10}
          align="end" 
          wrap="nowrap"
        >

          <TagsInput
            data={tagsData}
            value={tagsValue}
            onChange={setTagsValue}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onBlur={addTypedTag}
            placeholder="# tags"
            variant="unstyled"
            radius="xs"
            size="sm"
            withScrollArea={true}
            miw={180}
            maxDropdownHeight={250}
            comboboxProps={{
              position: "bottom-start",
              shadow: "lg"
            }}
            styles={{
              input: {
                padding: 0,
                minHeight: 24,
                fontSize: "0.8rem",
              },
              dropdown: {
                maxWidth: 280,
              }
            }}
            p={0}
          />

          <Group wrap="nowrap" gap={0}>
            <Button 
              radius="sm" 
              variant="light" 
              onClick={() => saveNote()} 
              size="compact-sm" 
              mr={1}
              style={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
            >
              Save
            </Button>
            <Menu transitionProps={{ transition: 'pop' }} position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon
                  variant="light"
                  size={26}
                  style={{
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                >
                  <IconChevronDown size="1rem" />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size="0.8rem" />}
                  onMouseDown={() => onDelete(note)}
                >
                  Delete note
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>
    </Modal>
  )
}