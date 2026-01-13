import User from '../models/auth.model.js';
import bcrypt from 'bcryptjs';

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            phone,
            company,
            website,
            street,
            zipCode,
            city,
            country
        } = req.body;

        // Find user
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (phone !== undefined) user.phone = phone;
        if (company !== undefined) user.company = company;
        if (website !== undefined) user.website = website;
        if (street !== undefined) user.street = street;
        if (zipCode !== undefined) user.zipCode = zipCode;
        if (city !== undefined) user.city = city;
        if (country !== undefined) user.country = country;

        // Update name if firstName or lastName changed
        if (firstName || lastName) {
            user.name = `${firstName || user.firstName || ''} ${lastName || user.lastName || ''}`.trim();
        }

        await user.save();

        // Return updated user without sensitive fields
        const updatedUser = await User.findById(user._id).select('-password -resetPasswordToken -resetPasswordExpires');

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Find user with password
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has a password (not OAuth user)
        if (!user.password) {
            return res.status(400).json({ message: 'Cannot change password for OAuth accounts' });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
