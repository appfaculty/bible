<?php

namespace local_bible;

defined('MOODLE_INTERNAL') || die();

require_once(__DIR__.'/bible.api.php');
require_once(__DIR__.'/tags.api.php');

use \local_bible\api\bible_api;
use \local_bible\api\tags_api;

class API {
    use bible_api;
    use tags_api;

    /**
     * Check for existing session.
     * 
     * @throws require_login_exception
     * @return void.
     */
    static public function check_login() {
        if (!isloggedin()) {
            throw new \require_login_exception('Login required.');
        }
    }
}