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
        Schema::create('brain_challenge_games', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('difficulty', 20); // easy, medium, hard
            $table->string('first_player', 20); // you, computer
            $table->string('final_result', 20); // you, computer
            $table->unsignedTinyInteger('final_total')->default(100);
            $table->boolean('is_completed')->default(true);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('brain_challenge_games');
    }
};
