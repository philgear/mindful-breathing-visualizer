#!/usr/bin/perl
# Mindful Breathing Visualizer - Perl CLI
# SWEBOK v4 Serene Palette

use strict;
use warnings;
use Time::HiRes qw(sleep);

# Define Palette (ANSI TrueColor)
my $SERENE_EMERALD = "\e[38;2;52;211;153m";
my $SERENE_BLUE    = "\e[38;2;96;165;250m";
my $SERENE_ROSE    = "\e[38;2;251;113;133m";
my $RESET          = "\e[0m";
my $BEEP           = "\7";

# Box Breathing Phases
my @phases = (
    { name => "Inhale", duration => 4, color => $SERENE_EMERALD },
    { name => "Hold",   duration => 4, color => $SERENE_BLUE },
    { name => "Exhale", duration => 4, color => $SERENE_ROSE },
    { name => "Hold",   duration => 4, color => $SERENE_BLUE }
);

print "Starting Mindful Breathing (Perl)...\n";
sleep(1);

# Main Loop
while (1) {
    foreach my $phase (@phases) {
        # Clear Screen
        print "\e[2J\e[H";
        
        # Audio Feedback
        print $BEEP;
        
        # Display Header
        print $phase->{color} . "--------------------------------\n";
        print "          " . uc($phase->{name}) . "\n";
        print "--------------------------------" . $RESET . "\n";
        
        # Countdown
        for (my $i = 1; $i <= $phase->{duration}; $i++) {
            my $bar = "=" x ($i * 2);
            print $phase->{color} . $bar . "> " . $RESET . "\r";
            $| = 1; # Flush buffer
            sleep(1);
        }
        print "\n";
    }
}
