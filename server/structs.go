package server

var UserID int

type User struct {
	UserID    int
	Username  string
	Password  string
	Email     string
	FirstName string
	LastName  string
	Age       int
	Gender    string
}

type RegistrationData struct {
	Username  string `json:"username"`
	Password  string `json:"password"`
	Email     string `json:"email"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Age       string `json:"age"`
	Gender    string `json:"gender"`
}

type LoginData struct {
	Username string `json:"user"`
	Password string `json:"password"`
}
