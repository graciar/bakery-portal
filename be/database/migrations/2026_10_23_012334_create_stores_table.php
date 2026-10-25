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
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->string('code', 11)->unique();
            $table->string('name');
            $table->string('street_address');
            $table->string('city');
            $table->string('province');
            $table->foreignId('tier_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->index('tier_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
