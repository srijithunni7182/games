package org.example.game;

import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GameStateTest {
    @Test
    void testGameStateStoresTargetAndGuesses() {
        GameState state = new GameState(42);
        assertEquals(42, state.getTarget());
        assertTrue(state.getGuesses().isEmpty());
        state.getGuesses().add(10);
        state.getGuesses().add(20);
        List<Integer> guesses = state.getGuesses();
        assertEquals(2, guesses.size());
        assertEquals(10, guesses.get(0));
        assertEquals(20, guesses.get(1));
    }
}

