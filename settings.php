<?php
// Romans 11:6
// And if by grace, then is it no more of works: otherwise grace is no more grace. But if it be of works, then is it no more grace: otherwise work is no more work.

defined('MOODLE_INTERNAL') || die;

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_bible', get_string('pluginname', 'local_bible'));
    $ADMIN->add('localplugins', $settings);

}
