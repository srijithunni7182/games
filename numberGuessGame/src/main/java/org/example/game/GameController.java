package org.example.game;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
public class GameController {
    @Autowired
    private GameService gameService;

    @PostMapping("/start")
    public Map<String, Object> startGame() {
        return gameService.startGame();
    }

    @PostMapping("/guess")
    public Map<String, Object> makeGuess(@RequestBody Map<String, Object> payload) {
        String gameId = (String) payload.get("gameId");
        int guess = (int) payload.get("guess");
        return gameService.makeGuess(gameId, guess);
    }
}

