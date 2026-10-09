<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('brain_challenge_statistics', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('total_games')->default(0);
            $table->unsignedInteger('player_wins')->default(0);
            $table->unsignedInteger('computer_wins')->default(0);

            // Grouped by difficulty
            $table->unsignedInteger('easy_games')->default(0);
            $table->unsignedInteger('easy_player_wins')->default(0);
            $table->unsignedInteger('easy_computer_wins')->default(0);

            $table->unsignedInteger('medium_games')->default(0);
            $table->unsignedInteger('medium_player_wins')->default(0);
            $table->unsignedInteger('medium_computer_wins')->default(0);

            $table->unsignedInteger('hard_games')->default(0);
            $table->unsignedInteger('hard_player_wins')->default(0);
            $table->unsignedInteger('hard_computer_wins')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('brain_challenge_statistics');
    }
};
