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
    <div id="<?php echo esc_attr($uniq); ?>_container" style="display:flex; flex-direction:column; align-items:center; padding:20px; background:#f4f4f4; border: 1px solid #dcdcdc; border-radius:0; font-family: 'Inter', sans-serif;">
        <h3 id="<?php echo esc_attr($uniq); ?>_phase" style="margin-bottom:20px; color:#111; font-weight: 600; text-transform: uppercase;">Inhale</h3>
        <div id="<?php echo esc_attr($uniq); ?>_circle" style="width:100px; height:100px; background:#ea5b0c; border-radius:50%; transition: all 4s cubic-bezier(0.4, 0.0, 0.2, 1);"></div>
        <div style="margin-top:20px; font-size:14px; color:#888;">Take a moment to breathe.</div>
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
                { name: 'Inhale', scale: 1.5, color: '#ea5b0c', dur: 4000, x: 0 },
                { name: 'Hold', scale: 1.5, color: '#111111', dur: 4000, x: 0 },
                { name: 'Exhale', scale: 1.0, color: '#ea5b0c', dur: 4000, x: 0 },
                { name: 'Hold', scale: 1.0, color: '#111111', dur: 4000, x: 0 }
            ])}),
            diaphragmatic: Object.freeze({
                phases: Object.freeze([
                { name: 'Inhale', scale: 1.5, color: '#ea5b0c', dur: 5000, x: 0 },
                { name: 'Exhale', scale: 1.0, color: '#ea5b0c', dur: 5000, x: 0 }
            ])}),
            alternate: Object.freeze({
                phases: Object.freeze([
                { name: 'Inhale Left', scale: 1.0, color: '#ea5b0c', dur: 4000, x: -30 },
                { name: 'Hold', scale: 1.0, color: '#111111', dur: 4000, x: 0 },
                { name: 'Exhale Right', scale: 1.0, color: '#ea5b0c', dur: 4000, x: 30 },
                { name: 'Hold', scale: 1.0, color: '#111111', dur: 4000, x: 0 },
                { name: 'Inhale Right', scale: 1.0, color: '#ea5b0c', dur: 4000, x: 30 },
                { name: 'Hold', scale: 1.0, color: '#111111', dur: 4000, x: 0 },
                { name: 'Exhale Left', scale: 1.0, color: '#ea5b0c', dur: 4000, x: -30 },
                { name: 'Hold', scale: 1.0, color: '#111111', dur: 4000, x: 0 }
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
            circle.style.transition = `all ${p.dur}ms cubic-bezier(0.4, 0.0, 0.2, 1)`; 
            
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
            btn.style.background = '#ffffff';
            btn.style.border = '1px solid #111111';
            btn.style.borderRadius = '2px';
            btn.style.color = '#111111';
            btn.onclick = (e) => {
                e.preventDefault();
                // SECURITY: Validate tech exists via safe lookup logic above
                if (TECHNIQUES[tech]) {
                    currentTech = tech;
                    idx = 0;
                    clearTimeout(timeoutId);
                    document.querySelectorAll('#<?php echo esc_js($uniq); ?>_container button').forEach(b => {
                        b.style.background = '#ffffff';
                        b.style.color = '#111111';
                    });
                    btn.style.background = '#111111';
                    btn.style.color = '#ffffff';
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
