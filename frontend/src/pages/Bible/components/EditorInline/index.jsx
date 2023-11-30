
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { Placeholder } from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import { Box, Button, Group, Space, TagsInput, useComputedColorScheme } from '@mantine/core';
import { useAjax } from '../../../../hooks/useAjax';

export function EditorInline({save}) {
  const [newNote, setNewNote] = useState('')
  const [focussed, setFocussed] = useState(false)

  const [tagsValue, setTagsValue] = useState([]);
  const [tagsData, setTagsData] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [fetchResponse, fetchError, fetchLoading, fetchAjax] = useAjax();

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
    content: '',
    onUpdate({ editor, event }) {
      if (editor.getText()) {
        setNewNote(editor.getHTML())
      } else {
        setNewNote('')
      }
    },
    onFocus({ editor, event }) {
      setFocussed(true)
    }
  });

  const saveNote = () => {
    if (!newNote.length) {
      return;
    }
    save({
      id: 0,
      text: newNote,
      tags: tagsValue
    })
    closeNote()
  }

  const closeNote = () => {
    editor.commands.clearContent(true)
    setTagsValue([])
    setFocussed(false)
  }
  
  const addTypedTag = () => {
    if (searchValue.length) {
      setTagsValue((current) => [...current, searchValue])
      setSearchValue('')
    }
  }

  useEffect(() => {
    fetchAjax({
      query: {
        methodname: 'local_bible-get_tags',
      }
    })
  }, []);
  useEffect(() => {
    if (fetchResponse && !fetchError) {
      setTagsData(fetchResponse.data)
    }
  }, [fetchResponse]);

  return (
    <Box
      className="editor"
      bg={focussed && !dark ? "white": "transparent" }
      style={{
        border: focussed ? (dark ? "0.0625rem solid rgb(63, 63, 63)" : "0.0625rem solid #dee2e6") : "0 none",
        borderRadius: "0.25rem",
      }}
      py={focussed ? "sm" : 0 }
      px={focussed ? "sm" : 0 }
      my={focussed ? "xs" : "sm" }
      ml={focussed ? 0 : "sm" }
    >
      <RichTextEditor 
        editor={editor}
        style={{
          border: "0 none",
        }}
      >
        <RichTextEditor.Toolbar 
          m="-0.75rem"
          p="sm"
          style={{border: "0 none"}}
          display={focussed ? 'flex' : 'none'}
          sticky
          bg={!dark ? "white": "transparent" }
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

        <RichTextEditor.Content fz="md" bg="transparent" mt={focussed ? "md" : ""} />
      </RichTextEditor>


      <Box display={!focussed ? "none" : null} >
        <Space h="sm" />
        <Group justify="space-between" align="end" gap="xs" wrap="nowrap">
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
          <Button.Group>
            <Button radius="sm" variant="light" onClick={() => saveNote()} size="compact-sm" >Save</Button>
          </Button.Group>
        </Group>
      </Box>
    
    </Box>
  )
}
