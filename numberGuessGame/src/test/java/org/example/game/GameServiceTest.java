package org.example.game;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GameServiceTest {
    private GameService gameService;
    private GeminiService mockGeminiService;

    @BeforeEach
    void setUp() {
        mockGeminiService = Mockito.mock(GeminiService.class);
        Mockito.when(mockGeminiService.getNumberHint(Mockito.anyInt())).thenReturn("hint");
        gameService = new GameService(mockGeminiService);
    }

    @Test
    void testStartGameReturnsGameId() {
        Map<String, Object> result = gameService.startGame();
        assertTrue(result.containsKey("gameId"));
        assertNotNull(result.get("gameId"));
    }

    @Test
    void testMakeGuessInvalidGameId() {
        Map<String, Object> result = gameService.makeGuess("invalid", 10);
        assertEquals("Invalid gameId", result.get("error"));
    }

    @Test
    void testMakeGuessCorrect() {
        String gameId = (String) gameService.startGame().get("gameId");
        GameState state = new GameState(50);
        gameService.games.put(gameId, state);
        Map<String, Object> result = gameService.makeGuess(gameId, 50);
        assertEquals("correct", result.get("result"));
    }

    @Test
    void testMakeGuessTooLow() {
        String gameId = (String) gameService.startGame().get("gameId");
        GameState state = new GameState(60);
        gameService.games.put(gameId, state);
        Map<String, Object> result = gameService.makeGuess(gameId, 10);
        assertEquals("too low", result.get("result"));
    }

    @Test
    void testMakeGuessTooHigh() {
        String gameId = (String) gameService.startGame().get("gameId");
        GameState state = new GameState(20);
        gameService.games.put(gameId, state);
        Map<String, Object> result = gameService.makeGuess(gameId, 30);
        assertEquals("too high", result.get("result"));
    }
}
