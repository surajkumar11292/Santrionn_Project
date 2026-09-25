const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { query } = require('../config/database');
const { UnauthorizedError, NotFoundError } = require('../utils/errors');

class AuthService {
  /**
   * Authenticate user credentials and issue JWT tokens
   */
  async login(email, password) {
    const res = await query(
      'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (res.rows.length === 0) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user = res.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateTokens(user);

    const { password_hash, ...safeUser } = user;

    return {
      user: safeUser,
      tokens
    };
  }

  /**
   * Refresh expired access token using valid refresh token
   */
  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret);
      const res = await query(
        'SELECT id, name, email, role FROM users WHERE id = $1',
        [decoded.sub]
      );

      if (res.rows.length === 0) {
        throw new UnauthorizedError('User associated with refresh token no longer exists');
      }

      const user = res.rows[0];
      const accessToken = jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return {
        accessToken,
        expiresIn: config.jwt.expiresIn
      };
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Retrieve authenticated user profile
   */
  async getProfile(userId) {
    const res = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError('User profile not found');
    }

    return res.rows[0];
  }

  /**
   * Generate access and refresh token pair
   */
  generateTokens(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    const refreshToken = jwt.sign({ sub: user.id }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: config.jwt.expiresIn
    };
  }
}

module.exports = new AuthService();
