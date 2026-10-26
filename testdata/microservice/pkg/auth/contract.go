package auth

// Authenticator defines the public contractual interface for user session validation.
type Authenticator interface {
	VerifyToken(token string) (bool, error)
	GetUserID(token string) (string, error)
}
