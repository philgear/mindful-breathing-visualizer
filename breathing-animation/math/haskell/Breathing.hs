-- The Pure Breath: Haskell
-- "Separation of Concern: Purity vs. Side Effects"

import Control.Concurrent (threadDelay)
import System.IO (hFlush, stdout)

-- 1. The Data (Type Safety)
data PhaseType = Inhale | Hold | Exhale deriving (Show)

data BreathPhase = BreathPhase 
    { label :: String
    , duration :: Float
    , color :: String 
    }

-- 2. The Serene Palette (Pure Values)
emerald = "\x1b[38;2;52;211;153m"
blue    = "\x1b[38;2;96;165;250m"
rose    = "\x1b[38;2;251;113;133m"
reset   = "\x1b[0m"

-- 3. The 4-7-8 Pattern (Defined as List)
pattern :: [BreathPhase]
pattern = 
    [ BreathPhase (emerald ++ "Inhale... 🌿" ++ reset) 4.0 emerald
    , BreathPhase (blue    ++ "Hold... ☁️"   ++ reset) 7.0 blue
    , BreathPhase (rose    ++ "Exhale... 🌸" ++ reset) 8.0 rose
    ]

-- 4. The Infinite Breath (Lazy Evaluation)
-- 'cycle' creates an infinite list from a finite one.
eternalBreath :: [BreathPhase]
eternalBreath = cycle pattern

-- 5. The Runtime (IO Monad)
-- Only here do we interact with the "Real World".
breathe :: [BreathPhase] -> IO ()
breathe [] = return () -- Should never happen with infinite list
breathe (p:ps) = do
    putStrLn $ (label p) ++ " (" ++ show (duration p) ++ "s)"
    hFlush stdout
    -- Haskell sleep is in microseconds
    threadDelay $ round ((duration p) * 1000000)
    breathe ps

main :: IO ()
main = do
    putStrLn "Starting The Pure Breath (Haskell)..."
    breathe eternalBreath
