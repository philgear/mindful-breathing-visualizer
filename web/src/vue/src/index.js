
       # Vue Component Wrapper
       from ...js.src.core.breathing import CoreBreathing
       class VueBreathing(CoreBreathing):
            def __init__(self):
               super().__init__()
               print('Vue Component')
            def start(self):
                super().start()
                print('start Vue breathing')

    