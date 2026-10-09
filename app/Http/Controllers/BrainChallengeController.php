<?php

namespace App\Http\Controllers;

use App\Models\BrainChallengeGame;
use App\Models\BrainChallengeMove;
use App\Models\BrainChallengeStatistic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class BrainChallengeController extends Controller
{
    /**
     * Render the Brain Challenge page.
     */
    public function index(): Response
    {
        return Inertia::render('BrainChallenge/Index');
    }

    /**
     * Validate and persist a completed Brain Challenge match.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'game_id' => 'required|string|max:64',
            'difficulty' => 'required|string|in:easy,medium,hard',
            'first_player' => 'required|string|in:you,computer',
            'final_result' => 'required|string|in:you,computer',
            'final_total' => 'required|integer|in:100',
            'started_at' => 'required|date',
            'completed_at' => 'required|date',
            'moves' => 'required|array|min:1',
            'moves.*.move_number' => 'required|integer|min:1',
            'moves.*.actor' => 'required|string|in:you,computer',
            'moves.*.added_number' => 'required|integer|between:1,10',
            'moves.*.total_after' => 'required|integer|min:1|max:100',
            'moves.*.move_time' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'details' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Prevent duplicate submissions of the exact same game ID
        if (BrainChallengeGame::where('id', $data['game_id'])->exists()) {
            return response()->json([
                'success' => false,
                'error' => 'Duplicate game record: Match already recorded',
            ], 409);
        }

        // Server-Side Strict Game Rule Verification
        $moves = $data['moves'];
        $runningTotal = 0;
        $expectedPlayer = $data['first_player'];

        foreach ($moves as $index => $move) {
            $expectedMoveNumber = $index + 1;

            if ($move['move_number'] !== $expectedMoveNumber) {
                return response()->json([
                    'success' => false,
                    'error' => "Move order violation at index {$index}: expected move #{$expectedMoveNumber}",
                ], 422);
            }

            if ($move['actor'] !== $expectedPlayer) {
                return response()->json([
                    'success' => false,
                    'error' => "Turn alternation violation at move #{$expectedMoveNumber}: expected {$expectedPlayer}, got {$move['actor']}",
                ], 422);
            }

            $runningTotal += $move['added_number'];

            if ($runningTotal > 100) {
                return response()->json([
                    'success' => false,
                    'error' => "Total exceeded 100 at move #{$expectedMoveNumber}",
                ], 422);
            }

            if ($move['total_after'] !== $runningTotal) {
                return response()->json([
                    'success' => false,
                    'error' => "Total discrepancy at move #{$expectedMoveNumber}: move says {$move['total_after']}, calculated {$runningTotal}",
                ], 422);
            }

            // Next expected player alternates
            $expectedPlayer = $expectedPlayer === 'you' ? 'computer' : 'you';
        }

        // Final total must be exactly 100
        if ($runningTotal !== 100) {
            return response()->json([
                'success' => false,
                'error' => "Incomplete match: final total is {$runningTotal}, expected exactly 100",
            ], 422);
        }

        // The actor of the final move must match the final_result
        $lastMove = end($moves);
        if ($lastMove['actor'] !== $data['final_result']) {
            return response()->json([
                'success' => false,
                'error' => "Result mismatch: final move played by {$lastMove['actor']} but reported result is {$data['final_result']}",
            ], 422);
        }

        // Transactional commit to guarantee data integrity across game, moves, and aggregate statistics
        try {
            DB::transaction(function () use ($data, $moves) {
                $game = BrainChallengeGame::create([
                    'id' => $data['game_id'],
                    'difficulty' => $data['difficulty'],
                    'first_player' => $data['first_player'],
                    'final_result' => $data['final_result'],
                    'final_total' => $data['final_total'],
                    'is_completed' => true,
                    'started_at' => $data['started_at'],
                    'completed_at' => $data['completed_at'],
                ]);

                foreach ($moves as $m) {
                    BrainChallengeMove::create([
                        'game_id' => $game->id,
                        'move_number' => $m['move_number'],
                        'actor' => $m['actor'],
                        'added_number' => $m['added_number'],
                        'total_after' => $m['total_after'],
                        'move_time' => $m['move_time'] ?? null,
                    ]);
                }

                BrainChallengeStatistic::recordCompletedGame($game);
            });
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => 'Database error while saving match: ' . $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'success' => true,
            'game_id' => $data['game_id'],
            'message' => 'Match successfully validated and persisted',
        ], 201);
    }
}
