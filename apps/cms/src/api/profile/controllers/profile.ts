/**
 * Custom profile controller for updating authenticated user's profile
 */
export default {
  /**
   * Update the authenticated user's profile
   */
  async update(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to update your profile');
    }

    // Only allow updating specific fields (not email, username, password, role, etc.)
    const allowedFields = ['firstName', 'lastName', 'phone', 'companyName', 'vatNumber'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (ctx.request.body[field] !== undefined) {
        updateData[field] = ctx.request.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return ctx.badRequest('No valid fields to update');
    }

    try {
      // Update the user using the users-permissions service
      const userService = strapi.plugin('users-permissions').service('user');
      const updatedUser = await userService.edit(user.id, updateData);

      // Remove sensitive fields before returning
      const { password, resetPasswordToken, confirmationToken, ...safeUser } = updatedUser;

      ctx.body = safeUser;
    } catch (error) {
      strapi.log.error('Error updating user profile:', error);
      return ctx.badRequest('Failed to update profile');
    }
  },

  /**
   * Get the authenticated user's profile
   */
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    try {
      const userService = strapi.plugin('users-permissions').service('user');
      const fullUser = await userService.fetch(user.id);

      // Remove sensitive fields before returning
      const { password, resetPasswordToken, confirmationToken, ...safeUser } = fullUser;

      ctx.body = safeUser;
    } catch (error) {
      strapi.log.error('Error fetching user profile:', error);
      return ctx.badRequest('Failed to fetch profile');
    }
  },
};
