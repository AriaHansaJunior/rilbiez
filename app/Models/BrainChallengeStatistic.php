<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BrainChallengeStatistic extends Model
{
    protected $table = 'brain_challenge_statistics';

    protected $fillable = [
        'total_games',
        'player_wins',
        'computer_wins',
        'easy_games',
        'easy_player_wins',
        'easy_computer_wins',
        'medium_games',
        'medium_player_wins',
        'medium_computer_wins',
        'hard_games',
        'hard_player_wins',
        'hard_computer_wins',
    ];

    /**
     * Atomically record a completed game into aggregate statistics.
     */
    public static function recordCompletedGame(BrainChallengeGame $game): self
    {
        $stats = self::firstOrCreate(['id' => 1]);

        $isPlayerWin = $game->final_result === 'you';
        $difficulty = $game->difficulty;

        $stats->total_games += 1;
        if ($isPlayerWin) {
            $stats->player_wins += 1;
        } else {
            $stats->computer_wins += 1;
        }

        if ($difficulty === 'easy') {
            $stats->easy_games += 1;
            $isPlayerWin ? $stats->easy_player_wins += 1 : $stats->easy_computer_wins += 1;
        } elseif ($difficulty === 'medium') {
            $stats->medium_games += 1;
            $isPlayerWin ? $stats->medium_player_wins += 1 : $stats->medium_computer_wins += 1;
        } elseif ($difficulty === 'hard') {
            $stats->hard_games += 1;
            $isPlayerWin ? $stats->hard_player_wins += 1 : $stats->hard_computer_wins += 1;
        }

        $stats->save();

        return $stats;
    }
}
