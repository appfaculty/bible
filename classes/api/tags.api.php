<?php
// John 3:16
// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.

namespace local_bible\api;

defined('MOODLE_INTERNAL') || die();

require_once(__DIR__.'/../lib/tags.lib.php');

use \local_bible\lib\tags_lib;

/**
 * bible API trait
 */
trait tags_api {

    /**
     * Get tags
     * 
     * @return array
     */
    static public function get_tags() {
        return tags_lib::get_tags();
    }

    /**
     * Get tags with count
     * 
     * @return array
     */
    static public function get_tags_and_count() {
        return tags_lib::get_tags_and_count();
    }

}
