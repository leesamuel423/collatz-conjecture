package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

// CalculateCollatz generates the Collatz sequence for a given number
func CalculateCollatz(start int) []int {
	if start <= 0 {
		return []int{}
	}

	sequence := []int{start}
	current := start

	for current != 1 {
		if current%2 == 0 {
			current = current / 2
		} else {
			current = 3*current + 1
		}
		sequence = append(sequence, current)
	}

	return sequence
}

func main() {
	// Serve static files from the static directory
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", fs)

	// API endpoint to calculate Collatz sequence
	http.HandleFunc("/api/collatz", func(w http.ResponseWriter, r *http.Request) {
		strNum := r.URL.Query().Get("start")
		num, err := strconv.Atoi(strNum)
		if err != nil || num <= 0 {
			http.Error(w, "Please provide a valid positive integer", http.StatusBadRequest)
			return
		}

		sequence := CalculateCollatz(num)

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(sequence); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
	})

	log.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
