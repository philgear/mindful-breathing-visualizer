;;; The Symbolic Breath: Common Lisp
;;; "Code is Data, Data is Code."

;; 1. The Serene Palette (SWEBOK v4)
(defparameter *emerald* (format nil "~c[38;2;52;211;153m" #\Esc))
(defparameter *blue*    (format nil "~c[38;2;96;165;250m" #\Esc))
(defparameter *rose*    (format nil "~c[38;2;251;113;133m" #\Esc))
(defparameter *reset*   (format nil "~c[0m" #\Esc))

;; 2. The Language (Macros)
;; We define a syntactic abstraction for a "Breath Phase".
(defmacro with-phase (color label seconds)
  `(progn
     (format t "~a~a (~as)~a~%" ,color ,label ,seconds *reset*)
     (force-output)
     (sleep ,seconds)))

;; 3. The 4-7-8 Cycle (Implementation)
(defun start-breathing ()
  (format t "Starting The Symbolic Breath (Common Lisp)...~%")
  (loop
    do (with-phase *emerald* "Inhale... 🌿" 4.0)
       (with-phase *blue*    "Hold... ☁️"   7.0)
       (with-phase *rose*    "Exhale... 🌸" 8.0)))

;; 4. Execution
(start-breathing)
