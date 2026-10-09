<?php

use App\Http\Controllers\BrainChallengeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Public/Home');
})->name('home');

Route::get('/brain-challenge', [BrainChallengeController::class, 'index'])->name('brain-challenge');
Route::post('/brain-challenge/matches', [BrainChallengeController::class, 'store'])->name('brain-challenge.matches.store');
