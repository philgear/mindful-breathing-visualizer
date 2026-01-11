#lang racket

;; The Lambda Breath: Streams
;; "We can use streams to model signal-processing systems..." - SICP 3.5

(require racket/stream)

;; 1. The Serene Palette (SWEBOK v4)
(define EMERALD "#34d399")
(define BLUE    "#60a5fa")
(define ROSE    "#fb7185")

;; 2. The 4-7-8 Cycle Primitives
(define (inhale-stream n) (stream-make-flonum-sequence n 4.0 'inhale))
(define (hold-stream n)   (stream-make-flonum-sequence n 7.0 'hold))
(define (exhale-stream n) (stream-make-flonum-sequence n 8.0 'exhale))

;; Helper to generate a sequence of 'n' seconds
(define (stream-make-flonum-sequence seconds duration label)
  (if (<= seconds 0)
      empty-stream
      (stream-cons (list label duration) 
                   (stream-make-flonum-sequence (- seconds 1.0) duration label))))

;; 3. The Infinite Breath (Recursive Stream Construction)
;; This defines the breath not as a loop, but as an infinite mathematical object.
(define (breath-stream)
  (stream-append
   (stream-cons (list 'inhale 4.0) empty-stream)
   (stream-cons (list 'hold   7.0) empty-stream)
   (stream-cons (list 'exhale 8.0) empty-stream)
   (breath-stream))) ;; Recursion!

;; 4. The Observer (Interpreter)
(define (breathe stream)
  (let* ((phase (stream-first stream))
         (label (car phase))
         (duration (cadr phase)))
    
    ;; Visual Output (SWEBOK TrueColor)
    (cond
      [(eq? label 'inhale) (display (format "\033[38;2;52;211;153m~a (~as)\033[0m\n" "Inhale... 🌿" duration))]
      [(eq? label 'hold)   (display (format "\033[38;2;96;165;250m~a (~as)\033[0m\n" "Hold... ☁️"   duration))]
      [(eq? label 'exhale) (display (format "\033[38;2;251;113;133m~a (~as)\033[0m\n" "Exhale... 🌸" duration))])
    
    (sleep duration)
    (breathe (stream-rest stream))))

(display "Starting The Lambda Breath (SICP Stream)...\n")
(breathe (breath-stream))
