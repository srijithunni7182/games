package org.example.game;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class GeminiService {
    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public String getNumberHint(int number) {
        String prompt = "Give me an interesting fact or property about the number " + number + ". Do NOT mention the number itself in your response. Keep it concise and make it less obvious, what the number is.";
        try {
            String response = callGeminiApi(prompt);
            return response;
        } catch (Exception e) {
            return "Could not fetch hint from Gemini: " + e.getMessage();
        }
    }

    String callGeminiApi(String prompt) throws IOException, InterruptedException {
        String endpoint = apiUrl + "?key=" + apiKey;
        String requestBody = "{\"contents\":[{\"parts\":[{\"text\":\"" + prompt + "\"}]}]}";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();
        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            // Simple extraction of the first candidate's text
            String body = response.body();
            int idx = body.indexOf("\"text\":");
            if (idx != -1) {
                int start = body.indexOf('"', idx + 7) + 1;
                int end = body.indexOf('"', start);
                if (start > 0 && end > start) {
                    return body.substring(start, end);
                }
            }
            return "No hint found in Gemini response.";
        } else {
            throw new IOException("Gemini API error: " + response.statusCode() + " - " + response.body());
        }
    }
}
