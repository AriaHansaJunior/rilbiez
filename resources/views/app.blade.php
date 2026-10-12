<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title inertia>{{ config('app.name', 'Rilbiez') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/png" href="{{ asset('images/Rilbiez_logo_transparan.png') }}">
        <link rel="shortcut icon" type="image/png" href="{{ asset('images/Rilbiez_logo_transparan.png') }}">
        <link rel="apple-touch-icon" href="{{ asset('images/Rilbiez_logo_transparan.png') }}">

        <!-- Scripts -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/css/public/landing.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
