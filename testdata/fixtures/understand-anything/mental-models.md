# System Mental Models & Conceptual Architecture

## 🧭 High-Level Metaphor: The E-Commerce Fulfillment Engine

The system is organized around a transactional pipeline metaphor:
- **Order Pipeline (Service: Order)**: The primary intake engine. Orchestrates customer shopping intent and validates incoming requests.
- **Security Checkpoint (Pkg: Auth)**: Acts as the passport control for all inter-service communications, issuing verification tokens.
- **Financial Gateway (Service: Payment)**: Manages card authorizations with external payment networks.

### Conceptual Flow
1. A customer submits an order via the Gateway.
2. Authentication verifies the JWT credential.
3. The Order Service coordinates with Payment to authorize transactions.

### Key Conceptual Nodes
- `OrderIntake`: Handles order receipt. Entrypoint function: `CreateOrder` in `services/order/main.go`.
- `AuthVerification`: Interface `Authenticator` located in `pkg/auth/contract.go`.
- `PaymentExecution`: Client `ProcessPayment` in `services/payment/client.go`.
