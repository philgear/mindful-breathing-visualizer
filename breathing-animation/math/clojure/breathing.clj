(ns breathing
  (:require [clojure.string :as str]))

;;; The Recursive Breath: Clojure
;;; "Simple Made Easy"

;; 1. The Serene Palette (SWEBOK v4) - Defined as Immutable Map
(def palette
  {:emerald "\u001b[38;2;52;211;153m"
   :blue    "\u001b[38;2;96;165;250m"
   :rose    "\u001b[38;2;251;113;133m"
   :reset   "\u001b[0m"})

;; 2. The Cycle Data (Vector of Maps)
(def cycle
  [{:label "Inhale... 🌿" :duration 4.0 :color (:emerald palette)}
   {:label "Hold... ☁️"   :duration 7.0 :color (:blue    palette)}
   {:label "Exhale... 🌸" :duration 8.0 :color (:rose    palette)}])

;; 3. The Function (Pure Process)
(defn breathe-phase [phase]
  (let [{:keys [label duration color]} phase]
    (println (str color label " (" duration "s)" (:reset palette)))
    (Thread/sleep (long (* duration 1000)))))

;; 4. The Infinite Recursion (loop/recur)
;; Unlike standard recursion, 'recur' does not consume stack space.
(defn start-breathing []
  (println "Starting The Recursive Breath (Clojure JVM)...")
  (loop [phases (cycle cycle)] ;; Infinite sequence from specific cycle
    (let [current-phase (first phases)]
      (breathe-phase current-phase)
      (recur (rest phases))))) ;; Tail-call optimization

;; Execution
(start-breathing)
