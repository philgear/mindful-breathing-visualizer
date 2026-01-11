#lang racket

;; The Lambda Breath: Functional Geometry
;; "There is no difference between the 'procedure' and the 'data'..." - SICP 2.2.4

(require pict)
(require racket/draw)

;; 1. The Primitive (A Single Petal)
(define (petal color)
  (colorize 
   (filled-ellipse 60 150)
   color))

;; 2. The Combinator (Rotational Symmetry)
(define (rotations n painter)
  (if (= n 0)
      (ghost (rectangle 1 1)) ;; Identity element
      (cc-superimpose 
       (rotate painter (* (/ 360 8) n)) ;; 8-way symmetry
       (rotations (- n 1) painter))))

;; 3. The Lotus (Recursive Construction)
(define (lotus color)
  (rotations 8 (petal color)))

;; 4. Render
(define (render-to-svg filename painter)
  (define dc (new svg-dc% [output filename] [width 400] [height 400]))
  (send dc start-doc "Lotus")
  (send dc start-page)
  (draw-pict painter dc 200 200) ;; Center in 400x400
  (send dc end-page)
  (send dc end-doc))

;; Generate the "Serene Palette" variants
(display "Generative Lotus: Emerald...\n")
(render-to-svg "lotus-emerald.svg" (lotus (make-color 52 211 153))) ;; #34d399

(display "Generative Lotus: Blue...\n")
(render-to-svg "lotus-blue.svg"    (lotus (make-color 96 165 250))) ;; #60a5fa

(display "Generative Lotus: Rose...\n")
(render-to-svg "lotus-rose.svg"    (lotus (make-color 251 113 133))) ;; #fb7185

(display "Done. Generated pure Lambda visuals.\n")
