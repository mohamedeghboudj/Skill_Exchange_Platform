<?php
/**
 * Test Runner - Main Entry Point
 * Run all tests with: php run_tests.php
 */

// Set error reporting for tests
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session for tests
session_start();

echo "\n";
echo "╔══════════════════════════════════════════════════════╗\n";
echo "║  Skill Exchange Platform - Test Suite               ║\n";
echo "╚══════════════════════════════════════════════════════╝\n";

// Run API tests
echo "\n→ Running API Tests...\n";
require __DIR__ . '/api_tests.php';

echo "\n";
echo "╔══════════════════════════════════════════════════════╗\n";
echo "║  All Tests Complete!                                 ║\n";
echo "╚══════════════════════════════════════════════════════╝\n";
echo "\n";
?>
