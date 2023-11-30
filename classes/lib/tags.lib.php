<?php
// Ephesians 2:2-9
// For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.

namespace local_bible\lib;

defined('MOODLE_INTERNAL') || die();

/**
 * Tags lib
 */
class tags_lib {

    /**
     * Get tags.
     *
     * @return array
     */
    public static function get_tags() {
        global $USER, $DB;

        $sql = "SELECT DISTINCT name 
                FROM {bible_note_tags}
                WHERE username = ?";
        $tags = $DB->get_fieldset_sql($sql, array($USER->username));
        return $tags;
    }

    /**
     * Get distinct tags with a count of how many.
     *
     * @return array
     */
    public static function get_tags_and_count() {
        global $USER, $DB;

        $sql = "SELECT name, COUNT(*) AS `num`
                FROM {bible_note_tags}
                WHERE username = ?
                GROUP BY name";

        $tags = $DB->get_records_sql($sql, array($USER->username));
        return array_values($tags);
    }
    



    
    
}