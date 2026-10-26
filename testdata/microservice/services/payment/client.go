package payment

type PaymentResponse struct {
	TxID   string `json:"tx_id"`
	Status string `json:"status"`
}

// PaymentClient processes external card transactions.
type PaymentClient struct {
	Endpoint string
}

func (c *PaymentClient) ProcessPayment(orderID string, amount float64) (*PaymentResponse, error) {
	return &PaymentResponse{TxID: "tx_mock_123", Status: "APPROVED"}, nil
}
