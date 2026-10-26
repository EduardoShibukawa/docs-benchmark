import type { BenchmarkProbeTask } from "../types";

export const BENCHMARK_TASKS: BenchmarkProbeTask[] = [
  {
    id: "task-01-order-entrypoint",
    title: "Order Service Entrypoint Discovery",
    prompt: "Find the primary service responsible for creating orders and its main entrypoint function.",
    groundTruth: {
      targetFile: "services/order/main.go",
      targetSymbol: "CreateOrder",
      expectedConsumers: ["service:gateway"],
    },
  },
  {
    id: "task-02-auth-contract",
    title: "Auth Contract Consumers Discovery",
    prompt: "Identify the contract interface for user authentication and list all consuming services.",
    groundTruth: {
      targetFile: "pkg/auth/contract.go",
      targetSymbol: "Authenticator",
      expectedConsumers: ["service:order", "service:gateway"],
    },
  },
  {
    id: "task-03-payment-blast-radius",
    title: "Payment Gateway Blast Radius Analysis",
    prompt: "If PaymentClient in payment service changes its request signature, which upstream services and handlers will break?",
    groundTruth: {
      targetFile: "services/payment/client.go",
      targetSymbol: "ProcessPayment",
      expectedConsumers: ["service:order", "service:billing"],
    },
  },
  {
    id: "task-04-exact-locator",
    title: "Exact AST Coordinates Locator",
    prompt: "Retrieve the exact file path and line coordinates for the OrderRepository struct definition.",
    groundTruth: {
      targetFile: "services/order/repository.go",
      targetSymbol: "OrderRepository",
      expectedConsumers: ["service:order"],
    },
  },
  {
    id: "task-05-drift-gate-check",
    title: "Architectural Boundary Contract Check",
    prompt: "Check whether direct cross-service calls between billing and inventory are permitted by architectural policy.",
    groundTruth: {
      targetFile: "gira.yaml",
      targetSymbol: "forbidden_imports",
      expectedConsumers: ["service:inventory"],
    },
  },
];
