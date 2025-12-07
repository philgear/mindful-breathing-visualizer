<?php
/**
 * Plugin Name: Mindful Breathing Visualizer
 * Plugin URI: https://example.com/mindful-breathing
 * Description: Adds a mindful breathing visualizer shortcode [mindful_breathing].
 * Version: 1.0.1
 * Author: Antigravity
 * License: GPL2
 */

// SECURITY: Prevent direct file access. This ensures the file is only loaded by WordPress.
if (!defined('ABSPATH')) {
    exit;
}

function render_mindful_breathing_visualizer() {
    // Unique IDs for admin compatibility
    $uniq = uniqid('mb_');
    // SECURITY: Limit technique selection via sanitized inputs if we were accepting args
    
    // Inline Script with Frozen Config
    ?>
    <div id="<?php echo esc_attr($uniq); ?>_container" style="display:flex; flex-direction:column; align-items:center; padding:20px; background:#f0f4f8; border-radius:12px;">
        <h3 id="<?php echo esc_attr($uniq); ?>_phase" style="margin-bottom:20px; color:#333;">Inhale</h3>
        <div id="<?php echo esc_attr($uniq); ?>_circle" style="width:100px; height:100px; background:#34d399; border-radius:50%; transition: all 4s ease-in-out;"></div>
        <div style="margin-top:15px; font-size:12px; color:#666;">Take a moment to breathe.</div>
    </div>
    <script>
    (function() {
        const circle = document.getElementById('<?php echo esc_js($uniq); ?>_circle');
        const phaseLabel = document.getElementById('<?php echo esc_js($uniq); ?>_phase');
        const container = document.getElementById('<?php echo esc_js($uniq); ?>_container');

        // SECURITY: Tamper-Proof Configuration
        const TECHNIQUES = Object.freeze({
            box: Object.freeze({
                phases: Object.freeze([
                { name: 'Inhale', scale: 1.5, color: '#34d399', dur: 4000, x: 0 },
                { name: 'Hold', scale: 1.5, color: '#60a5fa', dur: 4000, x: 0 },
                { name: 'Exhale', scale: 1.0, color: '#fb7185', dur: 4000, x: 0 },
                { name: 'Hold', scale: 1.0, color: '#60a5fa', dur: 4000, x: 0 }
            ])}),
            diaphragmatic: Object.freeze({
                phases: Object.freeze([
                { name: 'Inhale', scale: 1.5, color: '#34d399', dur: 5000, x: 0 },
                { name: 'Exhale', scale: 1.0, color: '#fb7185', dur: 5000, x: 0 }
            ])}),
            alternate: Object.freeze({
                phases: Object.freeze([
                { name: 'Inhale Left', scale: 1.0, color: '#34d399', dur: 4000, x: -30 },
                { name: 'Hold', scale: 1.0, color: '#60a5fa', dur: 4000, x: 0 },
                { name: 'Exhale Right', scale: 1.0, color: '#fb7185', dur: 4000, x: 30 },
                { name: 'Hold', scale: 1.0, color: '#60a5fa', dur: 4000, x: 0 },
                { name: 'Inhale Right', scale: 1.0, color: '#34d399', dur: 4000, x: 30 },
                { name: 'Hold', scale: 1.0, color: '#60a5fa', dur: 4000, x: 0 },
                { name: 'Exhale Left', scale: 1.0, color: '#fb7185', dur: 4000, x: -30 },
                { name: 'Hold', scale: 1.0, color: '#60a5fa', dur: 4000, x: 0 }
            ])})
        });

        let currentTech = 'box';
        let idx = 0;
        let timeoutId = null;
        
        function tick() {
            if (!circle) return;
            // SECURITY: Safe lookup
            const technique = TECHNIQUES[currentTech] || TECHNIQUES['box'];
            const phases = technique.phases;
            const p = phases[idx % phases.length];
            
            phaseLabel.innerText = p.name;
            circle.style.transform = `scale(${p.scale}) translateX(${p.x}px)`;
            circle.style.backgroundColor = p.color;
            circle.style.transition = `all ${p.dur}ms ease-in-out`; 
            
            timeoutId = setTimeout(() => {
                idx++;
                tick();
            }, p.dur);
        }

        // Add controls
        const controls = document.createElement('div');
        controls.style.marginTop = '15px';
        ['box', 'diaphragmatic', 'alternate'].forEach(tech => {
            const btn = document.createElement('button');
            btn.innerText = tech.charAt(0).toUpperCase() + tech.slice(1);
            btn.style.margin = '0 5px';
            btn.style.padding = '5px 10px';
            btn.style.cursor = 'pointer';
            btn.style.background = '#fff';
            btn.style.border = '1px solid #ddd';
            btn.style.borderRadius = '4px';
            btn.onclick = (e) => {
                e.preventDefault();
                // SECURITY: Validate tech exists via safe lookup logic above
                if (TECHNIQUES[tech]) {
                    currentTech = tech;
                    idx = 0;
                    clearTimeout(timeoutId);
                    document.querySelectorAll('#<?php echo esc_js($uniq); ?>_container button').forEach(b => b.style.fontWeight = 'normal');
                    btn.style.fontWeight = 'bold';
                    tick();
                }
            };
            controls.appendChild(btn);
        });
        container.appendChild(controls);
        
        setTimeout(tick, 100);
    })();
    </script>
    <?php
}

// Shortcode
function mindful_breathing_shortcode() {
    ob_start();
    render_mindful_breathing_visualizer();
    return ob_get_clean();
}
add_shortcode('mindful_breathing', 'mindful_breathing_shortcode');

// Admin Dashboard Widget - SECURITY: Check capabilities
function mindful_breathing_register_dashboard_widget() {
    if (current_user_can('edit_dashboard')) {
        wp_add_dashboard_widget(
            'mindful_breathing_widget',
            'Mindful Breathing',
            'render_mindful_breathing_visualizer'
        );
    }
}
add_action('wp_dashboard_setup', 'mindful_breathing_register_dashboard_widget');
