use crossterm::{
    cursor,
    event::{self, Event, KeyCode},
    execute,
    style::{self, Color, SetForegroundColor},
    terminal::{self, Clear, ClearType},
    ExecutableCommand,
};
use std::io::{self, Write};
use std::time::{Duration, Instant};

struct Phase {
    name: String,
    duration: f32, // Seconds as float for smoother animation calculations
    kind: PhaseKind,
}

#[derive(PartialEq)]
enum PhaseKind {
    Inhale,
    Exhale,
    Hold,
}

fn main() -> io::Result<()> {
    // Setup terminal
    terminal::enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, terminal::EnterAlternateScreen, cursor::Hide)?;

    // Menu Selection (basic raw mode interaction)
    // For simplicity in this demo, we'll default to Box Breathing or let user pick via simplistic raw input
    // But since we are already in raw mode, let's just default to Box for now to avoid complex menu logic in raw mode without a library like ratatui.
    // Or we can simple print a menu in non-raw mode first.
    
    // Switch back to normal to ASK for input
    execute!(stdout, terminal::LeaveAlternateScreen, cursor::Show)?;
    terminal::disable_raw_mode()?;

    println!("Mindful Breathing Visualizer (Rust CLI)");
    println!("1. Box Breathing");
    println!("2. Diaphragmatic Breathing (5s in, 5s out)");
    println!("3. 4-7-8 Breathing (Relaxing)");
    print!("Select a technique (1-3): ");
    io::stdout().flush()?;

    let mut input = String::new();
    io::stdin().read_line(&mut input)?;
    let choice = input.trim();

    let phases = match choice {
        "2" => vec![
            Phase { name: "Inhale".to_string(), duration: 5.0, kind: PhaseKind::Inhale },
            Phase { name: "Exhale".to_string(), duration: 5.0, kind: PhaseKind::Exhale },
        ],
        "3" => vec![
            Phase { name: "Inhale".to_string(), duration: 4.0, kind: PhaseKind::Inhale },
            Phase { name: "Hold".to_string(), duration: 7.0, kind: PhaseKind::Hold },
            Phase { name: "Exhale".to_string(), duration: 8.0, kind: PhaseKind::Exhale },
        ],
        _ => vec![ // Box
            Phase { name: "Inhale".to_string(), duration: 4.0, kind: PhaseKind::Inhale },
            Phase { name: "Hold".to_string(), duration: 4.0, kind: PhaseKind::Hold },
            Phase { name: "Exhale".to_string(), duration: 4.0, kind: PhaseKind::Exhale },
            Phase { name: "Hold".to_string(), duration: 4.0, kind: PhaseKind::Hold },
        ],
    };

    // Enter Animation Mode
    terminal::enable_raw_mode()?;
    execute!(stdout, terminal::EnterAlternateScreen, cursor::Hide)?;

    let mut phase_idx = 0;
    let mut start_time = Instant::now();
    let circle_chars = "●"; // Simple dot for lungs

    loop {
        // Handle Input (Quit)
        if event::poll(Duration::from_millis(16))? { // ~60 FPS poll
            if let Event::Key(key) = event::read()? {
                if key.code == KeyCode::Char('q') || key.code == KeyCode::Esc {
                    break;
                }
            }
        }

        let current_phase = &phases[phase_idx];
        let elapsed = start_time.elapsed().as_secs_f32();
        
        if elapsed >= current_phase.duration {
            phase_idx = (phase_idx + 1) % phases.len();
            start_time = Instant::now();
            
            // SWEBOK KA 2 Audio Feedback (System Beep)
            print!("\x07"); 
            io::stdout().flush()?;
            
            continue;
        }

        let progress = elapsed / current_phase.duration;
        let (w, h) = terminal::size()?;
        let center_x = w / 2;
        let center_y = h / 2;

        // Visual Calculation
        // Inhale: 0.0 -> 1.0 (expand)
        // Exhale: 1.0 -> 0.0 (contract)
        // Hold: Stay as is (Full or Empty)
        // Note: Hold after inhale = Full, Hold after exhale = Empty. 
        // We need to track 'lung capacity' state more constantly or infer it.
        // For simple phases: 
        // Box: In -> Hold(Full) -> Ex -> Hold(Empty)
        
        let visual_progress = match current_phase.kind {
            PhaseKind::Inhale => progress,
            PhaseKind::Exhale => 1.0 - progress,
            PhaseKind::Hold => {
                // Heuristic: If previous was Inhale, we are holding full. If Exhale, holding empty.
                // Box: Inhale(prev) -> Hold.
                let prev_idx = if phase_idx == 0 { phases.len() - 1 } else { phase_idx - 1 };
                match phases[prev_idx].kind {
                    PhaseKind::Inhale => 1.0,
                    PhaseKind::Exhale => 0.0,
                    _ => 0.5, // Fallback
                }
            }
        };

        // Draw
        stdout.execute(Clear(ClearType::All))?;
        
        // Info
        stdout.execute(cursor::MoveTo(2, 2))?;
        print!("Mode: Rust CLI Visualizer | Press 'q' to quit");
        
        stdout.execute(cursor::MoveTo(center_x.saturating_sub(10), center_y - 5))?;
        print!("Phase: {} ({:.1}s)", current_phase.name, current_phase.duration - elapsed);

        // Color Logic based on Phase (SWEBOK KA 2.1)
        // Inhale: #34d399 (52, 211, 153)
        // Hold:   #60a5fa (96, 165, 250)
        // Exhale: #fb7185 (251, 113, 133)
        let phase_color = match current_phase.kind {
            PhaseKind::Inhale => Color::Rgb { r: 52, g: 211, b: 153 },
            PhaseKind::Hold => Color::Rgb { r: 96, g: 165, b: 250 },
            PhaseKind::Exhale => Color::Rgb { r: 251, g: 113, b: 133 },
        };

        // Animation: Expanding bar/circle
        let max_width = 40;
        let current_width = (visual_progress * max_width as f32) as u16;
        let bar_str = "=".repeat(current_width as usize);
        
        stdout.execute(cursor::MoveTo(center_x.saturating_sub(max_width / 2), center_y))?;
        stdout.execute(SetForegroundColor(phase_color))?;
        print!("[{:<width$}]", bar_str, width = max_width as usize);
        stdout.execute(style::ResetColor)?;

        // Animation: Breathing Circle Size
        // Let's draw a simple circle approximation or just a scaling string
        let scale = 1.0 + (visual_progress * 2.0); // 1.0x to 3.0x
        let lung_str = format!("( {} )", circle_chars.repeat((scale * 5.0) as usize));
        
        stdout.execute(cursor::MoveTo(center_x.saturating_sub(lung_str.len() as u16 / 2), center_y + 2))?;
        stdout.execute(SetForegroundColor(phase_color))?;
        print!("{}", lung_str);
        stdout.execute(style::ResetColor)?;

        stdout.flush()?;
    }

    // Cleanup
    execute!(stdout, cursor::Show, terminal::LeaveAlternateScreen)?;
    terminal::disable_raw_mode()?;
    println!("Namaste.");
    
    Ok(())
}
