import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const db = req.app.get('db');

        // Check if user already exists using stored procedure
        const [existingUsers] = await db.query('CALL GetUserByEmail(?)', [email]);
        if (existingUsers[0].length > 0) {
            return res.status(400).json({ message: 'This User already exists!' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password.toString(), salt);

        // Insert new user using stored procedure
        const [result] = await db.query('CALL InsertUser(?, ?, ?, @inserted_id); SELECT @inserted_id AS insertId', [
            username || email, // Use email as username if username is not provided
            email,
            hashedPass,
        ]);

        // Retrieve the inserted ID
        const insertId = result[1][0].insertId;

        // Retrieve the newly created user using stored procedure
        const [newUser] = await db.query('CALL GetUserByEmail(?)', [email]);

        // Generate JWT
        const token = jwt.sign({ id: newUser[0][0].id, email: newUser[0][0].email }, process.env.JWT_SECRET);

        res.status(200).json({ user: newUser[0][0], token });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: error.message });
    }
};

// Login a user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = req.app.get('db');

        // Check if user exists using stored procedure
        const [users] = await db.query('CALL GetUserByEmail(?)', [email]);
        if (users[0].length === 0) {
            return res.status(404).json({ message: 'Sorry, please enter the correct email or password!' });
        }

        const user = users[0][0];

        // Verify password
        const validity = await bcrypt.compare(password, user.password);
        if (!validity) {
            return res.status(400).json({ message: 'Sorry, please enter the correct email or password!' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);

        // Return user data (excluding password)
        res.status(200).json({ user: { id: user.id, username: user.username, email: user.email }, token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: error.message });
    }
};