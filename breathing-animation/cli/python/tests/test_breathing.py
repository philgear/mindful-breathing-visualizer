import unittest

class TestBreathingLogic(unittest.TestCase):
    def test_box_breathing_cycle(self):
        phases = [
            ("Inhale", 4),
            ("Hold", 4),
            ("Exhale", 4),
            ("Hold", 4)
        ]
        
        total_duration = sum(p[1] for p in phases)
        self.assertEqual(total_duration, 16)
        
        for name, duration in phases:
            self.assertEqual(duration, 4)

    def test_478_breathing_cycle(self):
        phases = [
            ("Inhale", 4),
            ("Hold", 7),
            ("Exhale", 8)
        ]
        
        total_duration = sum(p[1] for p in phases)
        self.assertEqual(total_duration, 19)

if __name__ == '__main__':
    unittest.main()
