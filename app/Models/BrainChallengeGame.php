<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BrainChallengeGame extends Model
{
    protected $table = 'brain_challenge_games';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'difficulty',
        'first_player',
        'final_result',
        'final_total',
        'is_completed',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'final_total' => 'integer',
        'is_completed' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function moves(): HasMany
    {
        return $this->hasMany(BrainChallengeMove::class, 'game_id', 'id')->orderBy('move_number', 'asc');
    }
}
