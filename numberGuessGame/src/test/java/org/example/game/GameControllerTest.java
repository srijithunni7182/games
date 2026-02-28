package org.example.game;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GameController.class)
class GameControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GameService gameService;

    @Test
    void testStartGameEndpoint() throws Exception {
        when(gameService.startGame()).thenReturn(Map.of("gameId", "abc123"));
        mockMvc.perform(post("/api/game/start"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value("abc123"));
    }

    @Test
    void testMakeGuessEndpoint() throws Exception {
        when(gameService.makeGuess(eq("abc123"), eq(42)))
                .thenReturn(Map.of("result", "correct", "hint", "hint", "guesses", java.util.List.of(42)));
        mockMvc.perform(post("/api/game/guess")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"gameId\":\"abc123\",\"guess\":42}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("correct"))
                .andExpect(jsonPath("$.hint").value("hint"))
                .andExpect(jsonPath("$.guesses[0]").value(42));
    }
}

