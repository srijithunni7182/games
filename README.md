# Number Guess Game

A Spring Boot application for a number guessing game, enhanced with AI-powered hints using the Gemini API.

## Features

- RESTful API for playing a number guessing game
- AI-generated hints for the secret number via Gemini API
- Configurable API key and endpoint via `application.properties`
- 100% unit test coverage with JUnit and Mockito

## Project Structure

```
src/
 ├── main/
 │    └── java/
 │         └── org/example/game/
 │               ├── GameApplication.java
 │               ├── GameController.java
 │               ├── GameService.java
 │               ├── GameState.java
 │               └── GeminiService.java
 └── test/
      └── java/org/example/game/
            └── GeminiServiceTest.java
```

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+

### Configuration

Set your Gemini API key and endpoint in `src/main/resources/application.properties`:

```
gemini.api.key=YOUR_GEMINI_API_KEY
gemini.api.url=https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent
```

### Build & Run

```sh
mvn clean package
java -jar target/numberGuessGame-0.0.1-SNAPSHOT.jar
```

### API Usage

- Start a new game: `POST /api/game/start`
- Make a guess: `POST /api/game/guess`

## Testing

Run all tests and generate a coverage report:

```sh
mvn test
```

## License

MIT License

