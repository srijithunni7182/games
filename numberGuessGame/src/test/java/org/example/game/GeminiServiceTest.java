package org.example.game;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;

class GeminiServiceTest {
    private GeminiService geminiService;

    @BeforeEach
    void setUp() {
        geminiService = Mockito.spy(new GeminiService());
        ReflectionTestUtils.setField(geminiService, "apiKey", "dummy");
        ReflectionTestUtils.setField(geminiService, "apiUrl", "http://dummy");
    }

    @Test
    void testEvenNumberHint() throws Exception {
        Mockito.doReturn("The number is even.").when(geminiService).callGeminiApi(anyString());
        assertEquals("The number is even.", geminiService.getNumberHint(4));
    }

    @Test
    void testMultipleOfFiveHint() throws Exception {
        Mockito.doReturn("The number is a multiple of 5.").when(geminiService).callGeminiApi(anyString());
        assertEquals("The number is a multiple of 5.", geminiService.getNumberHint(25));
    }

    @Test
    void testLessThanFiftyHint() throws Exception {
        Mockito.doReturn("The number is less than 50.").when(geminiService).callGeminiApi(anyString());
        assertEquals("The number is less than 50.", geminiService.getNumberHint(43));
    }

    @Test
    void testGreaterThanOrEqualFiftyHint() throws Exception {
        Mockito.doReturn("The number is greater than or equal to 50.").when(geminiService).callGeminiApi(anyString());
        assertEquals("The number is greater than or equal to 50.", geminiService.getNumberHint(51));
    }

    @Test
    void testGeminiServiceReturnsErrorOnException() throws Exception {
        Mockito.doThrow(new RuntimeException("Simulated error")).when(geminiService).callGeminiApi(anyString());
        String result = geminiService.getNumberHint(42);
        assertTrue(result.contains("Could not fetch hint from Gemini"));
    }
}
