<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BrainChallengeMove extends Model
{
    protected $table = 'brain_challenge_moves';

    protected $fillable = [
        'game_id',
        'move_number',
        'actor',
        'added_number',
        'total_after',
        'move_time',
    ];

    protected $casts = [
        'move_number' => 'integer',
        'added_number' => 'integer',
        'total_after' => 'integer',
        'move_time' => 'datetime',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(BrainChallengeGame::class, 'game_id', 'id');
    }
}
