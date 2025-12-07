use std::thread;
use std::time::Duration;
use std::io::{self, Write};

struct Phase {
    name: String,
    duration: u64,
}

fn main() {
    println!("Mindful Breathing Visualizer (Rust CLI)");
    println!("1. Box Breathing");
    println!("2. Diaphragmatic Breathing");
    println!("3. Alternate Nostril Breathing");
    print!("Select a technique (1-3): ");
    io::stdout().flush().unwrap();

    let mut input = String::new();
    // SECURITY: Safe input handling (read_line) checks bounds automatically in Rust.
    // Rust's ownership model guarantees memory safety without manual checks.
    io::stdin().read_line(&mut input).unwrap();
    let choice = input.trim();

    let phases = match choice {
        "2" => {
            println!("Starting Diaphragmatic Breathing...");
            vec![
                Phase { name: String::from("Inhale"), duration: 5 },
                Phase { name: String::from("Exhale"), duration: 5 },
            ]
        },
        "3" => {
            println!("Starting Alternate Nostril Breathing...");
            vec![
                Phase { name: String::from("Inhale Left"), duration: 4 },
                Phase { name: String::from("Hold"), duration: 4 },
                Phase { name: String::from("Exhale Right"), duration: 4 },
                Phase { name: String::from("Hold"), duration: 4 },
                Phase { name: String::from("Inhale Right"), duration: 4 },
                Phase { name: String::from("Hold"), duration: 4 },
                Phase { name: String::from("Exhale Left"), duration: 4 },
                Phase { name: String::from("Hold"), duration: 4 },
            ]
        },
        _ => {
            println!("Starting Box Breathing...");
             vec![
                Phase { name: String::from("Inhale"), duration: 4 },
                Phase { name: String::from("Hold"), duration: 4 },
                Phase { name: String::from("Exhale"), duration: 4 },
                Phase { name: String::from("Hold"), duration: 4 },
            ]
        }
    };

    println!("Press Ctrl+C to stop.\n");

    loop {
        for phase in &phases {
            print!("\rPhase: {} ({}s)   ", phase.name, phase.duration);
            io::stdout().flush().unwrap();
            
            thread::sleep(Duration::from_secs(phase.duration));
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_phase_initialization() {
        let phase = Phase {
            name: String::from("Test"),
            duration: 5,
        };
        assert_eq!(phase.name, "Test");
        assert_eq!(phase.duration, 5);
    }
}
