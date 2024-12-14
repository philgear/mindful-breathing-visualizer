
        # React Component Wrapper
        from ...js.src.core.breathing import CoreBreathing
        class ReactBreathing(CoreBreathing):
            def __init__(self):
               super().__init__()
               print('react Component')
            def start(self):
                super().start()
                print('start react breathing')

   