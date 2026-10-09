<?php

namespace Tests\Feature;

use App\Models\BrainChallengeGame;
use App\Models\BrainChallengeMove;
use App\Models\BrainChallengeStatistic;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class BrainChallengePersistenceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Helper to generate a valid game payload.
     */
    protected function generateValidMatchPayload(array $overrides = []): array
    {
        $moves = [
            ['move_number' => 1, 'actor' => 'you', 'added_number' => 10, 'total_after' => 10, 'move_time' => now()->toIso8601String()],
            ['move_number' => 2, 'actor' => 'computer', 'added_number' => 10, 'total_after' => 20, 'move_time' => now()->toIso8601String()],
            ['move_number' => 3, 'actor' => 'you', 'added_number' => 10, 'total_after' => 30, 'move_time' => now()->toIso8601String()],
            ['move_number' => 4, 'actor' => 'computer', 'added_number' => 10, 'total_after' => 40, 'move_time' => now()->toIso8601String()],
            ['move_number' => 5, 'actor' => 'you', 'added_number' => 10, 'total_after' => 50, 'move_time' => now()->toIso8601String()],
            ['move_number' => 6, 'actor' => 'computer', 'added_number' => 10, 'total_after' => 60, 'move_time' => now()->toIso8601String()],
            ['move_number' => 7, 'actor' => 'you', 'added_number' => 10, 'total_after' => 70, 'move_time' => now()->toIso8601String()],
            ['move_number' => 8, 'actor' => 'computer', 'added_number' => 10, 'total_after' => 80, 'move_time' => now()->toIso8601String()],
            ['move_number' => 9, 'actor' => 'you', 'added_number' => 10, 'total_after' => 90, 'move_time' => now()->toIso8601String()],
            ['move_number' => 10, 'actor' => 'computer', 'added_number' => 10, 'total_after' => 100, 'move_time' => now()->toIso8601String()],
        ];

        return array_merge([
            'game_id' => 'test_game_' . uniqid(),
            'difficulty' => 'medium',
            'first_player' => 'you',
            'final_result' => 'computer',
            'final_total' => 100,
            'started_at' => now()->subMinutes(2)->toIso8601String(),
            'completed_at' => now()->toIso8601String(),
            'moves' => $moves,
        ], $overrides);
    }

    /**
     * 1. Test migrations and model relationships.
     */
    public function test_migrations_and_model_relationships(): void
    {
        $game = BrainChallengeGame::create([
            'id' => 'game_rel_test',
            'difficulty' => 'hard',
            'first_player' => 'you',
            'final_result' => 'you',
            'final_total' => 100,
            'is_completed' => true,
            'started_at' => now(),
            'completed_at' => now(),
        ]);

        $move1 = BrainChallengeMove::create([
            'game_id' => $game->id,
            'move_number' => 1,
            'actor' => 'you',
            'added_number' => 1,
            'total_after' => 1,
            'move_time' => now(),
        ]);

        $move2 = BrainChallengeMove::create([
            'game_id' => $game->id,
            'move_number' => 2,
            'actor' => 'computer',
            'added_number' => 10,
            'total_after' => 11,
            'move_time' => now(),
        ]);

        // Test hasMany relationship
        $this->assertCount(2, $game->moves);
        $this->assertEquals(1, $game->moves->first()->move_number);
        $this->assertEquals(2, $game->moves->last()->move_number);

        // Test belongsTo relationship
        $this->assertEquals($game->id, $move1->game->id);
    }

    /**
     * 2. Test saving a completed game via endpoint.
     */
    public function test_saving_a_completed_game(): void
    {
        $payload = $this->generateValidMatchPayload();

        $response = $this->postJson('/brain-challenge/matches', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'game_id' => $payload['game_id'],
        ]);

        $this->assertDatabaseHas('brain_challenge_games', [
            'id' => $payload['game_id'],
            'difficulty' => 'medium',
            'final_result' => 'computer',
            'final_total' => 100,
            'is_completed' => 1,
        ]);
    }

    /**
     * 3. Test saving all moves in the correct order.
     */
    public function test_saving_all_moves_in_correct_order(): void
    {
        $payload = $this->generateValidMatchPayload();

        $this->postJson('/brain-challenge/matches', $payload)->assertStatus(201);

        $savedMoves = BrainChallengeMove::where('game_id', $payload['game_id'])
            ->orderBy('move_number', 'asc')
            ->get();

        $this->assertCount(10, $savedMoves);

        foreach ($savedMoves as $index => $move) {
            $expectedNumber = $index + 1;
            $this->assertEquals($expectedNumber, $move->move_number);
            $this->assertEquals($payload['moves'][$index]['actor'], $move->actor);
            $this->assertEquals($payload['moves'][$index]['added_number'], $move->added_number);
            $this->assertEquals($payload['moves'][$index]['total_after'], $move->total_after);
        }
    }

    /**
     * 4. Test saving correct winner, difficulty, first player, and final total.
     */
    public function test_saving_correct_winner_difficulty_first_player_and_total(): void
    {
        $moves = [
            ['move_number' => 1, 'actor' => 'computer', 'added_number' => 1, 'total_after' => 1, 'move_time' => now()->toIso8601String()],
            ['move_number' => 2, 'actor' => 'you', 'added_number' => 99, 'total_after' => 100, 'move_time' => now()->toIso8601String()],
        ];
        // Note: added_number 99 is invalid by rule, let's make valid 10x steps ending with player win
        $validMoves = [];
        $running = 0;
        $player = 'computer';
        for ($i = 1; $i <= 10; $i++) {
            $running += 10;
            $validMoves[] = [
                'move_number' => $i,
                'actor' => $player,
                'added_number' => 10,
                'total_after' => $running,
                'move_time' => now()->toIso8601String(),
            ];
            $player = $player === 'computer' ? 'you' : 'computer';
        }
        // At move 10, actor is 'you', total reaches 100
        $payload = $this->generateValidMatchPayload([
            'game_id' => 'game_hard_win',
            'difficulty' => 'hard',
            'first_player' => 'computer',
            'final_result' => 'you',
            'moves' => $validMoves,
        ]);

        $this->postJson('/brain-challenge/matches', $payload)->assertStatus(201);

        $game = BrainChallengeGame::find('game_hard_win');
        $this->assertNotNull($game);
        $this->assertEquals('hard', $game->difficulty);
        $this->assertEquals('computer', $game->first_player);
        $this->assertEquals('you', $game->final_result);
        $this->assertEquals(100, $game->final_total);
    }

    /**
     * 5. Test aggregate statistics consistency.
     */
    public function test_aggregate_statistics_consistency(): void
    {
        // Save first match: Hard, Player wins
        $movesPlayerWin = [];
        $running = 0;
        $curr = 'you';
        for ($i = 1; $i <= 10; $i++) {
            $running += 10;
            $movesPlayerWin[] = [
                'move_number' => $i,
                'actor' => $curr,
                'added_number' => 10,
                'total_after' => $running,
                'move_time' => now()->toIso8601String(),
            ];
            $curr = $curr === 'you' ? 'computer' : 'you';
        }
        // Last move is computer (10). Wait: to make player win, let 11 moves or start with computer
        $curr = 'computer';
        $running = 0;
        $validPlayerWinMoves = [];
        for ($i = 1; $i <= 10; $i++) {
            $running += 10;
            $validPlayerWinMoves[] = [
                'move_number' => $i,
                'actor' => $curr,
                'added_number' => 10,
                'total_after' => $running,
                'move_time' => now()->toIso8601String(),
            ];
            $curr = $curr === 'computer' ? 'you' : 'computer';
        }
        // Move 10 actor is 'you'

        $p1 = $this->generateValidMatchPayload([
            'game_id' => 'g1',
            'difficulty' => 'hard',
            'first_player' => 'computer',
            'final_result' => 'you',
            'moves' => $validPlayerWinMoves,
        ]);

        $this->postJson('/brain-challenge/matches', $p1)->assertStatus(201);

        $stat = BrainChallengeStatistic::find(1);
        $this->assertEquals(1, $stat->total_games);
        $this->assertEquals(1, $stat->player_wins);
        $this->assertEquals(0, $stat->computer_wins);
        $this->assertEquals(1, $stat->hard_games);
        $this->assertEquals(1, $stat->hard_player_wins);

        // Save second match: Easy, Computer wins
        $p2 = $this->generateValidMatchPayload([
            'game_id' => 'g2',
            'difficulty' => 'easy',
            'first_player' => 'you',
            'final_result' => 'computer',
        ]);

        $this->postJson('/brain-challenge/matches', $p2)->assertStatus(201);

        $stat->refresh();
        $this->assertEquals(2, $stat->total_games);
        $this->assertEquals(1, $stat->player_wins);
        $this->assertEquals(1, $stat->computer_wins);
        $this->assertEquals(1, $stat->easy_games);
        $this->assertEquals(1, $stat->easy_computer_wins);
    }

    /**
     * 6. Test transaction rollback when persistence fails.
     */
    public function test_transaction_rollback_when_persistence_fails(): void
    {
        $payload = $this->generateValidMatchPayload(['game_id' => 'tx_fail_game']);

        // Force an exception during transaction by inserting a conflicting game ID ahead of time
        // or simulating a failure inside the transaction
        DB::shouldReceive('transaction')
            ->once()
            ->andThrow(new \Exception('Simulated database deadlock'));

        $response = $this->postJson('/brain-challenge/matches', $payload);

        $response->assertStatus(500);
        $response->assertJson(['success' => false]);
    }

    /**
     * 7. Test rejection of invalid or inconsistent game records.
     */
    public function test_rejection_of_invalid_game_records(): void
    {
        // 7a: Move out of order
        $payloadBadOrder = $this->generateValidMatchPayload();
        $payloadBadOrder['moves'][1]['move_number'] = 99;
        $this->postJson('/brain-challenge/matches', $payloadBadOrder)
            ->assertStatus(422)
            ->assertJsonPath('error', fn($e) => str_contains($e, 'Move order violation'));

        // 7b: Alternation violation (same player plays twice)
        $payloadBadTurn = $this->generateValidMatchPayload();
        $payloadBadTurn['moves'][1]['actor'] = 'you'; // should be computer
        $this->postJson('/brain-challenge/matches', $payloadBadTurn)
            ->assertStatus(422)
            ->assertJsonPath('error', fn($e) => str_contains($e, 'Turn alternation violation'));

        // 7c: Incomplete match (total < 100)
        $payloadIncomplete = $this->generateValidMatchPayload();
        array_pop($payloadIncomplete['moves']); // removes last 10, total is 90
        $this->postJson('/brain-challenge/matches', $payloadIncomplete)
            ->assertStatus(422)
            ->assertJsonPath('error', fn($e) => str_contains($e, 'Incomplete match'));

        // 7d: Result mismatch (last move is computer, but claims 'you' won)
        $payloadResultMismatch = $this->generateValidMatchPayload(['final_result' => 'you']);
        $this->postJson('/brain-challenge/matches', $payloadResultMismatch)
            ->assertStatus(422)
            ->assertJsonPath('error', fn($e) => str_contains($e, 'Result mismatch'));
    }

    /**
     * 8. Test preventing duplicate game submissions.
     */
    public function test_preventing_duplicate_game_submissions(): void
    {
        $payload = $this->generateValidMatchPayload(['game_id' => 'dup_test_game']);

        $this->postJson('/brain-challenge/matches', $payload)->assertStatus(201);

        // Submitting exact same game_id again must be rejected with 409
        $dupResponse = $this->postJson('/brain-challenge/matches', $payload);
        $dupResponse->assertStatus(409);
        $dupResponse->assertJson(['success' => false]);
    }

    /**
     * 9. Ensure no match-history UI has been introduced.
     */
    public function test_no_match_history_ui_introduced(): void
    {
        // Confirm there is no /admin/matches or /brain-challenge/history route
        $this->get('/brain-challenge/history')->assertStatus(404);
        $this->get('/admin/brain-challenge')->assertStatus(404);
        $this->get('/matches')->assertStatus(404);
    }
}
