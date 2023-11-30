<?php
// John 3:16
// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.

namespace local_bible\api;

defined('MOODLE_INTERNAL') || die();

require_once(__DIR__.'/../lib/bible.lib.php');

use \local_bible\lib\bible_lib;

/**
 * bible API trait
 */
trait bible_api {

    /**
     * Load a scripture
     * 
     * @return string
     */
    static public function get_scripture() {
        $book = optional_param('book', 'Matthew', PARAM_TEXT);
        $chapter = optional_param('chapter', 1, PARAM_INT);
        $verse = optional_param('verse', 0, PARAM_INT);
        return bible_lib::get_scripture($book, $chapter, $verse);
    }

    /**
     * Load notes for a scripture
     */
    static public function get_notes() {
        $book = optional_param('book', 'Matthew', PARAM_TEXT);
        $chapter = optional_param('chapter', 1, PARAM_INT);
        $verse = optional_param('verse', 0, PARAM_INT);
        $page = optional_param('page', 1, PARAM_INT);
        return bible_lib::get_notes($book, $chapter, $verse, $page);
    }

    /**
     * Load notes for a scripture
     */
    static public function post_note($args) {
        $args = (object) $args;
        return bible_lib::save_note($args);
    }

    /**
     * Load notes for a scripture
     */
    static public function delete_note($args) {
        $args = (object) $args;
        return bible_lib::delete_note($args->id);
    }

    /**
     * Load notes for a tag
     * 
     * @return array
     */
    static public function get_notes_by_tag() {
        $tag = required_param('tag', PARAM_TEXT);
        return bible_lib::get_notes_by_tag($tag);
    }
}
