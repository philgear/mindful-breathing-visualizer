// The Modern System: Zig
// "Communication is paramount."

const std = @import("std");

// 1. The Structure (Packed Struct not needed, but typical Zig style)
const BreathPhase = struct {
    label: []const u8,
    duration: f64,
    color: []const u8,
};

// 2. The Serene Palette (Comptime Definition)
const Palette = struct {
    pub const emerald = "\x1b[38;2;52;211;153m";
    pub const blue    = "\x1b[38;2;96;165;250m";
    pub const rose    = "\x1b[38;2;251;113;133m";
    pub const reset   = "\x1b[0m";
};

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();

    // 3. The Pattern (Const Array)
    const cycle = [_]BreathPhase{
        .{ .label = "Inhale... 🌿", .duration = 4.0, .color = Palette.emerald },
        .{ .label = "Hold... ☁️",   .duration = 7.0, .color = Palette.blue },
        .{ .label = "Exhale... 🌸", .duration = 8.0, .color = Palette.rose },
    };

    try stdout.print("Starting The Modern System (Zig)...\n", .{});

    // 4. The Loop (While True)
    while (true) {
        for (cycle) |phase| {
            // Output
            try stdout.print("{s}{s} ({d:0.1}s){s}\n", .{
                phase.color, phase.label, phase.duration, Palette.reset
            });
            
            // Sleep
            // Zig std.time is in nanoseconds (u64)
            const ns = @as(u64, @intFromFloat(phase.duration * 1_000_000_000));
            std.time.sleep(ns);
        }
    }
}
