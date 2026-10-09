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
        Schema::create('brain_challenge_moves', function (Blueprint $table) {
            $table->id();
            $table->string('game_id', 64);
            $table->unsignedSmallInteger('move_number');
            $table->string('actor', 20); // you, computer
            $table->unsignedTinyInteger('added_number'); // 1..10
            $table->unsignedTinyInteger('total_after');
            $table->timestamp('move_time')->nullable();
            $table->timestamps();

            $table->foreign('game_id')
                ->references('id')
                ->on('brain_challenge_games')
                ->onDelete('cascade');

            $table->index(['game_id', 'move_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('brain_challenge_moves');
    }
};
