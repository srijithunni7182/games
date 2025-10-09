package org.example.game;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameService {
    final Map<String, GameState> games = new ConcurrentHashMap<>();
    private final Random random = new Random();
    private final GeminiService geminiService;

    public GameService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    public Map<String, Object> startGame() {
        String gameId = UUID.randomUUID().toString();
        int target = random.nextInt(100) + 1;
        games.put(gameId, new GameState(target));
        return Map.of("gameId", gameId);
    }

    public Map<String, Object> makeGuess(String gameId, int guess) {
        GameState state = games.get(gameId);
        if (state == null) return Map.of("error", "Invalid gameId");
        state.getGuesses().add(guess);
        String result;
        if (guess == state.getTarget()) {
            result = "correct";
        } else if (guess < state.getTarget()) {
            result = "too low";
        } else {
            result = "too high";
        }
        String hint = geminiService.getNumberHint(state.getTarget());
        return Map.of(
                "result", result,
                "hint", hint,
                "guesses", state.getGuesses()
        );
    }
}
