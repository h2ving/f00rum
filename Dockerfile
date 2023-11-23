# Use a base image for Golang
FROM golang:latest

# Set the working directory inside the container
WORKDIR /go/src/app

# Copy the entire project into the working directory
COPY . .

# Build the Go application
RUN go build -o main ./main.go

# Expose the port your app runs on
EXPOSE 8080

# Define the command to start your app
CMD ["./main"]
