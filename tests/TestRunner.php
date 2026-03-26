<?php
/**
 * Lightweight Testing Framework
 * Simple test runner without external dependencies
 */

class TestRunner {
    private $tests = [];
    private $passed = 0;
    private $failed = 0;
    private $errors = [];
    
    public function addTest($name, $callback) {
        $this->tests[$name] = $callback;
    }
    
    public function run() {
        echo "\n=== Running Tests ===\n\n";
        
        foreach ($this->tests as $name => $callback) {
            try {
                $callback();
                $this->passed++;
                echo "✓ PASS: $name\n";
            } catch (AssertionException $e) {
                $this->failed++;
                $this->errors[] = ['test' => $name, 'message' => $e->getMessage()];
                echo "✗ FAIL: $name\n  Error: {$e->getMessage()}\n";
            } catch (Exception $e) {
                $this->failed++;
                $this->errors[] = ['test' => $name, 'message' => $e->getMessage()];
                echo "✗ ERROR: $name\n  Error: {$e->getMessage()}\n";
            }
        }
        
        $this->printSummary();
        return $this->failed === 0;
    }
    
    private function printSummary() {
        $total = $this->passed + $this->failed;
        echo "\n=== Test Summary ===\n";
        echo "Total: $total\n";
        echo "Passed: {$this->passed}\n";
        echo "Failed: {$this->failed}\n";
        
        if ($this->failed > 0) {
            echo "\n=== Failed Tests ===\n";
            foreach ($this->errors as $error) {
                echo "- {$error['test']}: {$error['message']}\n";
            }
        }
    }
}

class AssertionException extends Exception {}

class Assert {
    public static function assertEquals($expected, $actual, $message = '') {
        if ($expected !== $actual) {
            $msg = $message ?: "Expected " . json_encode($expected) . " but got " . json_encode($actual);
            throw new AssertionException($msg);
        }
    }
    
    public static function assertTrue($condition, $message = '') {
        if (!$condition) {
            $msg = $message ?: "Expected true but got false";
            throw new AssertionException($msg);
        }
    }
    
    public static function assertFalse($condition, $message = '') {
        if ($condition) {
            $msg = $message ?: "Expected false but got true";
            throw new AssertionException($msg);
        }
    }
    
    public static function assertNotNull($value, $message = '') {
        if ($value === null) {
            $msg = $message ?: "Expected non-null value";
            throw new AssertionException($msg);
        }
    }
    
    public static function assertArrayHasKey($key, $array, $message = '') {
        if (!isset($array[$key])) {
            $msg = $message ?: "Array does not have key: $key";
            throw new AssertionException($msg);
        }
    }
    
    public static function assertContains($needle, $haystack, $message = '') {
        if (!in_array($needle, $haystack)) {
            $msg = $message ?: "Array does not contain: $needle";
            throw new AssertionException($msg);
        }
    }
    
    public static function assertHttpCode($expected, $actual, $message = '') {
        if ($expected !== $actual) {
            $msg = $message ?: "Expected HTTP code $expected but got $actual";
            throw new AssertionException($msg);
        }
    }
}

class TestHelper {
    public static function simulateSession($user_id, $is_teacher = false) {
        $_SESSION = [];
        $_SESSION['user_id'] = $user_id;
        $_SESSION['is_teacher'] = $is_teacher;
        $_SESSION['user_email'] = 'test@example.com';
        $_SESSION['user_name'] = 'Test User';
    }
    
    public static function clearSession() {
        $_SESSION = [];
    }
    
    public static function simulatePost($data) {
        $_POST = $data;
    }
    
    public static function simulateGet($data) {
        $_GET = $data;
    }
    
    public static function captureOutput($callback) {
        ob_start();
        $callback();
        $output = ob_get_clean();
        return $output;
    }
    
    public static function parseJsonResponse($output) {
        $json = json_decode($output, true);
        if ($json === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response: ' . json_last_error_msg());
        }
        return $json;
    }
}

?>
