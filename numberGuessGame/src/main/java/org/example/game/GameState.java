package org.example.game;

import java.util.ArrayList;
import java.util.List;

public class GameState {
    private final int target;
    private final List<Integer> guesses = new ArrayList<Integer>();

    public GameState(int target) {
        this.target = target;
    }

    public int getTarget() {
        return target;
    }

    public List<Integer> getGuesses() {
        return guesses;
    }
}

