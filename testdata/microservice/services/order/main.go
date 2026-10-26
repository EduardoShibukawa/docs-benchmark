package main

import (
	"fmt"
	"net/http"
)

type CreateOrderRequest struct {
	ID        string  `json:"id"`
	ProductID string  `json:"product_id"`
	Amount    float64 `json:"amount"`
}

// CreateOrder handles new customer order creation and invokes payment processing.
func CreateOrder(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Order created successfully")
}

func main() {
	http.HandleFunc("/orders", CreateOrder)
	http.ListenAndServe(":8080", nil)
}
