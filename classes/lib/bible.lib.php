<?php
// Ephesians 2:2-9
// For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.

namespace local_bible\lib;

defined('MOODLE_INTERNAL') || die();

/**
 * Bible lib
 */
class bible_lib {

    /**
     * Get scriptures.
     *
     * @param string $book
     * @param int $chapter
     * @param int $verse
     * @return array
     */
    public static function get_scripture($book = 'Matthew', $chapter = 1, $verse = 0) {
        $bookSpaced = str_replace('-', ' ', $book);
        $json = file_get_contents(__DIR__.'/../../data/KJV/'.$bookSpaced.'/'.$chapter.'.json');

        if ($verse) {
            $data = json_decode($json, true);
            $data = $data['verses'][$verse-1];
        } else {
            $data = json_decode($json, true);
            $data['book'] = $book;
            $data['chapter'] = $chapter;
        }

        return $data;
    }


    /**
     * Get notes.
     *
     * @param string $book
     * @param int $chapter
     * @param int $verse
     * @param int $page
     * @return array
     */
    public static function get_notes($book = 'Matthew', $chapter = 1, $verse = 0, $page = 1) {
        global $USER, $DB;

        $scripture = "$book/$chapter/$verse";
        $perpage = 10;
        $limitfrom = $perpage * ($page-1);
        $limitnum = $perpage+1; // Retrieve an exta one to determine hasNextPage.
        $hasNextPage = false;

        $sql = "SELECT * 
                FROM {bible_notes}
                WHERE username = ?
                AND scripture = ?
                AND deleted = 0
                ORDER BY timecreated DESC";

        $records = $DB->get_records_sql($sql, array($USER->username, $scripture), $limitfrom, $limitnum);

        if (count($records) > $perpage) {
            $hasNextPage = true;
            $records = array_slice($records, 0, $perpage);
        }

        /*
        foreach ($records as $record) {
            $metadata = json_decode($record->metadata);
            $notes['notes'][] = array(
                'scripture' => $scripture,
                'page' => $page,
                'id' => $record->id,
                'text' => $record->note,
                'tags' => isset($metadata->tags) ? $metadata->tags : [],
                'postedAt' => date('j M Y G:i', $record->timecreated),
                'user' => \local_platform\lib\service_lib::user_stub($USER->username),
            );
        }
        */

        // Export the notes.
        $notes = array();
        foreach ($records as $record) {
            $notes[] = static::export_note($record);
        }

        return array(
            'scripture' => $scripture,
            'page' => $page,
            'notes' => $notes,
            'hasNextPage' => $hasNextPage,
        );
    }

    /**
     * Get notes by a tag.
     *
     * @param string $tag
     * @return array
     */
    public static function get_notes_by_tag($tag) {
        global $USER, $DB;

        if (empty($tag)) {
            return [];
        }
        
        // Load list of bible books for later.
        $biblebooks = file_get_contents(__DIR__ . '/../../data/bible/biblebooks.json');
        $biblebooks = json_decode($biblebooks, true); 

        // Get the notes by tag.
        $sql = "SELECT n.*
                FROM {bible_notes} n
                INNER JOIN {bible_note_tags} t ON t.noteid = n.id AND t.username = n.username
                WHERE n.username = ?
                AND t.name = ?
                AND n.deleted = 0
                ORDER BY timecreated DESC";
        $records = $DB->get_records_sql($sql, array($USER->username, $tag));
        
        // Export the notes.
        $notes = array();
        foreach ($records as $record) {
            $notes[] = static::export_note($record);
        }

        // Group them by scripture.
        $groupednotes = array();
        foreach ($notes as $note) {
            // Get a sortable representation of the verse. e.g. Gen 1:1 becomes 0/1/1. Rev 1:1 becomes 65/1/1
            list($book, $chapter, $verse) = explode('/', $note->scripture);
            $index = array_search($book, $biblebooks);
            $index = sprintf('%02d', $index); // Pad the index with a leading 0.
            $sortablescripture = "$index/$chapter/$verse";
            
            // Set up the grouping.
            if (!isset($groupednotes[$sortablescripture])) {
                $versetext = '';
                if ($verse) {
                    $versedata = static::get_scripture($book, $chapter, $verse);
                    $versetext = $versedata['text'];
                }
                $groupednotes[$sortablescripture] = array(
                    'scripture' => $note->scripture,
                    'book' => $book,
                    'chapter' => intval($chapter),
                    'verse' => intval($verse),
                    'text' => $versetext,
                    'notes' => array(),
                );
            }
            // Add some extras to the exported note. We need it for the popout editor.
            $note->versetext = $versetext;
            $groupednotes[$sortablescripture]['notes'][] = $note;
        }

        // Sort the notes.
        ksort($groupednotes);

        return array(
            'tag' => $tag,
            'notes' => array_values($groupednotes),
        );
    }

    public static function export_note($record) {
        list($book, $chapter, $verse) = explode('/', $record->scripture);
        $metadata = json_decode($record->metadata);
        $out = (object) array(
            'id' => $record->id,
            'scripture' => $record->scripture,
            'book' => $book,
            'chapter' => $chapter,
            'verse' => $verse,
            'text' => $record->note,
            'tags' => isset($metadata->tags) ? $metadata->tags : [],
            'postedAt' => date('j M Y G:i', $record->timecreated),
            'user' => \local_platform\lib\service_lib::user_stub($record->username),
        );
        return $out;
    }

    /**
     * Save a note.
     *
     * @param object $data
     * @return array
     */
    public static function save_note($data) {
        global $USER, $DB;

        if (empty($data->text) || empty($data->scripture)) {
            return;
        }

        $metadata = array(
            'tags' => $data->tags,
        );

        $note = array(
            'username' => $USER->username,
            'scripture' => $data->scripture,
            'note' => $data->text,
            'metadata' => json_encode($metadata),
            'timemodified' => time(),
        );

        if ($data->id) {
            // Update existing.
            $note['id'] = $data->id;
            // Check it exists.
            if (!$DB->record_exists('bible_notes', array('id' => $data->id, 'username' => $USER->username))) {
                return;
            }
            $DB->update_record('bible_notes', $note);
            $DB->delete_records('bible_note_tags', array('noteid' => $data->id));
        } else {
            // Insert new.
            $note['timecreated'] = time();
            $data->id = $DB->insert_record('bible_notes', $note);
        }

        // Tags - delete and insert afresh.
        if ($data->tags) {
            $tags = array_map(function($tag) use ($USER, $data) {
                return array(
                    'noteid' => $data->id,
                    'name' => $tag,
                    'username' => $USER->username,
                );
            }, $data->tags);
            if (!empty($tags)) {
                $DB->insert_records('bible_note_tags', $tags);
            }
        }

        return array(
            'id' => $data->id,
            'uuid' => $data->uuid,
            'scripture' => $data->scripture,
        );
    }

    /**
     * Delete note.
     *
     * @param int $id
     * @return boolean
     */
    public static function delete_note($id) {
        global $DB, $USER;

        $note = $DB->delete_records('bible_notes', array('id' => $id, 'username' => $USER->username));

        if (empty($note)) {
            return false;
        }

        // Delete associated tags first.
        $DB->delete_records('bible_note_tags', array('noteid' => $id));

        // Delete the note.
        $sql = "UPDATE {bible_notes} SET deleted = 1 WHERE id = ? AND username = ?";
        
        return $DB->execute($sql, [$id, $USER->username]);
    }
    
    
}