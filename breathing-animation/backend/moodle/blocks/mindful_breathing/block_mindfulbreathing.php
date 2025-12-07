<?php
defined('MOODLE_INTERNAL') || die();

class block_mindfulbreathing extends block_base {
    public function init() {
        $this->title = get_string('pluginname', 'block_mindfulbreathing');
    }

    public function get_content() {
        if ($this->content !== null) {
            return $this->content;
        }

        $this->content = new stdClass;
        
        // SECURITY: Use Moodle's Page Requirements Manager to load JS securely.
        // This ensures the script is loaded in the footer and compatible with Moodle's AMD loader.
        global $PAGE;
        
        // In a real deployment, serve from local plugin dir: $CFG->wwwroot . '/blocks/mindful_breathing/js/breathing-component.js'
        // For now, using the strict CDN URL.
        $script_url = new moodle_url('https://philgear.github.io/mindful-breathing-visualizer/frontend/web-components/breathing-component.js');
        $PAGE->requires->js($script_url);

        $this->content->text = '
            <div class="mindful-breathing-moodle-wrapper">
                <breathing-visualizer></breathing-visualizer>
            </div>
        ';
        
        return $this->content;
    }
}
