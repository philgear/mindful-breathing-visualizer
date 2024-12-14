
          # Angular Component Wrapper
          from ...js.src.core.breathing import CoreBreathing
          class AngularBreathing(CoreBreathing):
               def __init__(self):
                  super().__init__()
                  print('Angular Component')
               def start(self):
                  super().start()
                  print('start angular breathing')
   