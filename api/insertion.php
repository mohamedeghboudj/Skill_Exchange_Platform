<?php
// Include database connection
require_once '../config/db.php';

// Hash function for passwords - using password_hash for security
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

try {
    echo "Starting database insertion...<br>";
    
    // 1. Insert Regular User (is_teacher=0)
    $studentPassword = hashPassword('student123');
    
    $sql_regular = "INSERT INTO USER (
        email, 
        password_hash, 
        full_name, 
        profile_picture, 
        age, 
        skill, 
        bio, 
        date_registered, 
        is_teacher, 
        insta_link, 
        whatsapp_link, 
        linkedIn_link
    ) VALUES (
        'student@example.com',
        '$studentPassword',
        'John Student',
        'profile_student.jpg',
        25,
        'Web Development',
        'Passionate learner interested in programming and design.',
        CURRENT_TIMESTAMP,
        0,
        'https://instagram.com/johnstudent',
        'https://wa.me/1234567890',
        'https://linkedin.com/in/johnstudent'
    )";
    
    if ($conn->query($sql_regular)) {
        echo "✓ Regular user inserted successfully!<br>";
    } else {
        echo "✗ Error inserting regular user: " . $conn->error . "<br>";
    }
    
    // 2. Insert Teacher User (is_teacher=1)
    $teacherPassword = hashPassword('teacher456');
    
    $sql_teacher = "INSERT INTO USER (
        email, 
        password_hash, 
        full_name, 
        profile_picture, 
        age, 
        skill, 
        bio, 
        date_registered, 
        is_teacher, 
        insta_link, 
        whatsapp_link, 
        linkedIn_link
    ) VALUES (
        'teacher@example.com',
        '$teacherPassword',
        'Dr. Sarah Johnson',
        'profile_teacher.jpg',
        35,
        'Computer Science, Mathematics, Education',
        'Experienced educator with 10+ years in teaching computer science and mathematics.',
        CURRENT_TIMESTAMP,
        1,
        'https://instagram.com/drsarahjohnson',
        'https://wa.me/0987654321',
        'https://linkedin.com/in/drsarahjohnson'
    )";
    
    if ($conn->query($sql_teacher)) {
        echo "✓ Teacher user inserted successfully!<br>";
    } else {
        echo "✗ Error inserting teacher user: " . $conn->error . "<br>";
    }
    
    // 3. Get Teacher ID
    $result = $conn->query("SELECT user_id FROM USER WHERE email = 'teacher@example.com'");
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $teacher_id = $row['user_id'];
        echo "✓ Teacher ID retrieved: $teacher_id<br>";
    } else {
        die("✗ Cannot proceed without teacher ID.");
    }
    
    // 4. Insert 12 Courses (2 per category) - CORRECTED FIELDS
    echo "<br>Inserting courses...<br>";
    
    $courses = [
        // Computer Science
        ['Introduction to Python Programming', 'Learn Python from scratch with hands-on projects and exercises.', 'computer science', 49.99, 30, 4.5, 120],
        ['Data Structures and Algorithms', 'Master essential data structures and algorithms for technical interviews.', 'computer science', 79.99, 45, 4.7, 85],
        
        // Science
        ['Fundamentals of Physics', 'Understand basic physics concepts with practical examples.', 'science', 39.99, 25, 4.3, 95],
        ['Introduction to Biology', 'Explore the basics of biology and living organisms.', 'science', 44.99, 28, 4.2, 78],
        
        // Art
        ['Watercolor Painting for Beginners', 'Learn watercolor techniques and create beautiful artworks.', 'art', 29.99, 20, 4.6, 150],
        ['Digital Art Fundamentals', 'Master digital drawing and painting using modern tools.', 'art', 59.99, 35, 4.4, 110],
        
        // Languages
        ['Spanish for Beginners', 'Start speaking Spanish with essential vocabulary and grammar.', 'languages', 34.99, 30, 4.8, 200],
        ['Business English Communication', 'Improve your professional English for the workplace.', 'languages', 49.99, 25, 4.5, 145],
        
        // Design
        ['UI/UX Design Principles', 'Learn user interface and user experience design fundamentals.', 'design', 69.99, 40, 4.7, 180],
        ['Graphic Design Basics', 'Master essential graphic design skills and software.', 'design', 54.99, 32, 4.4, 125],
        
        // Business
        ['Entrepreneurship 101', 'Learn how to start and grow your own business.', 'business', 59.99, 35, 4.6, 165],
        ['Digital Marketing Strategy', 'Master online marketing techniques for business growth.', 'business', 49.99, 30, 4.5, 195]
    ];
    
    $courses_inserted = 0;
    foreach ($courses as $course) {
        list($title, $description, $category, $price, $duration, $rating, $enrolled) = $course;
        
        $sql_course = "INSERT INTO COURSE (
            teacher_id, 
            course_title, 
            course_description, 
            category, 
            price, 
            duration, 
            rating, 
            enrolled_count
        ) VALUES (
            $teacher_id,
            '" . $conn->real_escape_string($title) . "',
            '" . $conn->real_escape_string($description) . "',
            '" . $conn->real_escape_string($category) . "',
            $price,
            $duration,
            $rating,
            $enrolled
        )";
        
        if ($conn->query($sql_course)) {
            $courses_inserted++;
            echo "✓ Course '$title' inserted<br>";
        } else {
            echo "✗ Error inserting course '$title': " . $conn->error . "<br>";
        }
    }
    
    echo "<br>=== SUMMARY ===<br>";
    echo "✓ Database population completed!<br>";
    echo "✓ Total courses inserted: $courses_inserted/12<br>";
    echo "✓ Teacher ID: $teacher_id<br>";
    
    // Verify counts
    $user_count = $conn->query("SELECT COUNT(*) as count FROM USER")->fetch_assoc()['count'];
    $course_count = $conn->query("SELECT COUNT(*) as count FROM COURSE")->fetch_assoc()['count'];
    
    echo "✓ Total users in database: $user_count<br>";
    echo "✓ Total courses in database: $course_count<br>";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "<br>";
}

// Optional: Show a sample of inserted data
echo "<br>=== SAMPLE DATA ===<br>";
echo "Recent users:<br>";
$users = $conn->query("SELECT user_id, email, full_name, is_teacher FROM USER ORDER BY user_id DESC LIMIT 5");
while ($user = $users->fetch_assoc()) {
    echo "- {$user['full_name']} ({$user['email']}) - " . ($user['is_teacher'] ? 'Teacher' : 'Student') . "<br>";
}

echo "<br>Recent courses by category:<br>";
$categories = $conn->query("SELECT category, COUNT(*) as count FROM COURSE GROUP BY category");
while ($cat = $categories->fetch_assoc()) {
    echo "- {$cat['category']}: {$cat['count']} courses<br>";
}
?>