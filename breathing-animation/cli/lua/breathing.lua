-- Mindful Breathing Visualizer - Lua CLI
-- SWEBOK v4 Serene Palette: Emerald, Blue, Rose

local SERENE_EMERALD = "\27[38;2;52;211;153m"
local SERENE_BLUE    = "\27[38;2;96;165;250m"
local SERENE_ROSE    = "\27[38;2;251;113;133m"
local RESET          = "\27[0m"
local BEEP           = "\7"

-- Box Breathing Phases (4s In, 4s Hold, 4s Out, 4s Hold)
local phases = {
    { name = "Inhale", duration = 4, color = SERENE_EMERALD },
    { name = "Hold",   duration = 4, color = SERENE_BLUE },
    { name = "Exhale", duration = 4, color = SERENE_ROSE },
    { name = "Hold",   duration = 4, color = SERENE_BLUE }
}

-- Utility: Sleep function
local function sleep(seconds)
    os.execute("sleep " .. tonumber(seconds))
end

-- Utility: Clear Screen
local function clear_screen()
    os.execute("clear")
end

print("Starting Mindful Breathing (Lua)...")
sleep(1)

-- Main Loop
while true do
    for _, phase in ipairs(phases) do
        clear_screen()
        
        -- Audio Feedback (Beep at start of phase)
        io.write(BEEP)
        io.flush()
        
        -- Display Phase
        print(phase.color .. "--------------------------------")
        print("          " .. string.upper(phase.name))
        print("--------------------------------" .. RESET)
        
        -- Countdown
        for i = 1, phase.duration do
            io.write(phase.color .. string.rep("=", i * 2) .. "> " .. RESET)
            io.flush()
            sleep(1)
        end
        print("\n")
    end
end
