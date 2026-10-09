<?php

use App\Http\Controllers\BrainChallengeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Public/Home');
});

Route::get('/brain-challenge', [BrainChallengeController::class, 'index']);
Route::post('/brain-challenge/matches', [BrainChallengeController::class, 'store']);
